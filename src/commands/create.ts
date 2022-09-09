import fs from 'fs-extra';
import inquirer from 'inquirer';
import * as util from '../util.js';
import { basename, resolve } from 'node:path';
import { createPackageJSON } from './create/package.js';
import projectNameGenerator from 'project-name-generator';
import validateNpmPackageName from 'validate-npm-package-name';

export const createCommandFeatures = ['lint-staged', 'vitest', 'vitest-type-assert', 'release', 'coverage'] as const;
export const createCommandFeatureChoices = ['all', 'recommended', ...createCommandFeatures] as const;

export type CreateCommandFeature = typeof createCommandFeatures[number];
export type CreateCommandFeatureChoices = typeof createCommandFeatureChoices[number];

export interface CreateCommandBaseOptions {
  userName?: string;
  userEmail?: string;
  minNodeVersion?: string;
  minPnpmVersion?: string;
  features: 'all' | 'recommended' | readonly CreateCommandFeatureChoices[];
}

export interface CreateCommandCommandLineOptions extends CreateCommandBaseOptions {
  colors: boolean;
  public: boolean;
  interactive: boolean;
  listCreatedFiles: boolean;
}

export interface CreateCommandInteractiveOptions {
  name: string;
  options: Required<CreateCommandBaseOptions>;
}

export interface FileRecord {
  file: string | [string, ...string[]];
  tags: Record<string, string>;
}

export type File = string | FileRecord;

export interface CreateCommandOptions extends Required<CreateCommandCommandLineOptions> {
  path: string;
  name: string;
  shortName: string;
  nodeVersion: string;
  pnpmVersion: string;
  devDependencies: [string, string][];
  files: File[];
}

export async function create(name: string, commandLineOptions: CreateCommandCommandLineOptions): Promise<void> {
  await createProject(name, commandLineOptions);
}

export async function createProject(
  name: string,
  commandLineOptions: CreateCommandCommandLineOptions,
): Promise<CreateCommandOptions | undefined> {
  let path = resolve(process.cwd(), name);

  if (name === 'random') {
    name = projectNameGenerator({ words: 3 }).dashed;
    path = resolve(process.cwd(), name);
  } else if (name === '.') {
    path = process.cwd();
    name = basename(path);
  }

  const gitUser = await util.getGitUser();
  const nodeVersion = await util.getVersion('node');
  const pnpmVersion = await util.getVersion('pnpm');

  let options: CreateCommandOptions = {
    path,
    name,
    shortName: basename(name),
    userName: gitUser.name,
    userEmail: gitUser.email,
    nodeVersion: nodeVersion ? nodeVersion.raw : 'v14.19.1',
    pnpmVersion: pnpmVersion ? pnpmVersion.raw : '7.6.0',
    minNodeVersion: nodeVersion ? nodeVersion.major.toString() : '14',
    minPnpmVersion: pnpmVersion ? pnpmVersion.major.toString() : '7',
    ...commandLineOptions,
    devDependencies: [],
    files: [],
  };

  if (options.interactive) {
    const interactiveOptions = await inquirer.prompt<CreateCommandInteractiveOptions>([
      {
        type: 'input',
        name: 'name',
        message: 'project name',
        default: name,
      },
      {
        type: 'checkbox',
        name: 'options.features',
        message: 'select features',
        choices: createCommandFeatures,
      },
      {
        type: 'confirm',
        name: 'options.public',
        message: 'public project',
        default: options.public,
      },
      {
        type: 'input',
        name: 'options.userName',
        message: 'user name',
        default: options.userName,
      },
      {
        type: 'input',
        name: 'options.userEmail',
        message: 'user email',
        default: options.userEmail,
      },
      {
        type: 'input',
        name: 'options.minNodeVersion',
        message: 'min node version',
        default: options.minNodeVersion,
      },
      {
        type: 'input',
        name: 'options.minPnpmVersion',
        message: 'min pnpm version',
        default: options.minPnpmVersion,
      },
    ]);

    options = {
      ...options,
      ...interactiveOptions.options,
      name: interactiveOptions.name,
      shortName: basename(interactiveOptions.name),
      path: resolve(process.cwd(), interactiveOptions.name),
    };
  }

  if (!isValidNpmPackageName(options)) {
    return;
  }

  if (options.features === 'recommended') {
    options.features = [];
  } else if (options.features === 'all') {
    options.features = createCommandFeatures;
  }

  util.printInfo(`Skaffold package "${options.name}" at "${options.path}".`, options.colors);

  if (!(await createRootPath(options))) {
    return;
  }

  const tsConfigCheckExclude = ['lib'];

  if (options.features.includes('coverage')) {
    tsConfigCheckExclude.push('coverage');
  }

  if (options.features.includes('vitest-type-assert')) {
    tsConfigCheckExclude.push('test');
  }

  options.files = [
    'src/index.ts',
    '.eslintignore',
    '.eslintrc.json',
    '.gitignore',
    '.prettierignore',
    '.prettierrc.json',
    'tsconfig.json',
    'tsconfig.build.json',
    { file: 'tsconfig.check.json', tags: { exclude: JSON.stringify(tsConfigCheckExclude) } },
    { file: 'README.md', tags: { moduleName: options.shortName, packageName: options.name } },
    { file: 'LICENSE', tags: { date: new Date().getFullYear().toString(), ...gitUser } },
  ];

  options.devDependencies = [
    ['@skarab/eslint-config', '^1.1.0'],
    ['@skarab/prettier-config', '^1.2.2'],
    ['@skarab/typescript-config', '^1.1.0'],
    ['@types/node', '^18.6.3'],
    ['eslint', '^8.20.0'],
    ['prettier', '^2.7.1'],
    ['typescript', '^4.7.4'],
  ];

  if (options.features.includes('lint-staged')) {
    options.devDependencies.push(['lint-staged', '^13.0.3'], ['simple-git-hooks', '^2.8.0']);
    options.files.push('.lintstagedrc.json', '.simple-git-hooks.json');
  }

  let vitestConfigPlugings: string = '';
  let vitestConfigTest: string = '';
  let vitestImports: string = '';

  if (options.features.includes('coverage')) {
    options.devDependencies.push(['c8', '^7.12.0']);
    vitestConfigTest = `test: { coverage: { reporter: ['text', 'lcov'] } },`;
  }

  if (options.features.includes('vitest-type-assert')) {
    vitestImports = `import { vitestTypescriptAssertPlugin } from 'vite-plugin-vitest-typescript-assert';`;
    vitestConfigPlugings = 'plugins: [vitestTypescriptAssertPlugin()],';
  }

  if (options.features.includes('vitest') || options.features.includes('vitest-type-assert')) {
    options.devDependencies.push(['vitest', '^0.20.2']);
    options.files.push(
      {
        file: 'vitest.config.ts',
        tags: { vitestImports, vitestConfigTest, vitestConfigPlugings },
      },
      'test/index.test.ts',
    );
  }

  if (options.features.includes('vitest-type-assert')) {
    options.devDependencies.push(['vite-plugin-vitest-typescript-assert', '^1.1.4']);
    options.files.push('test/types.test.ts');
  }

  options.files.push({
    file: ['.github/workflows/test.yaml', '.github/workflows/parts/base.yaml', '.github/workflows/parts/test.yaml'],
    tags: { minNodeVersion: options.minNodeVersion, pnpmVersion: options.pnpmVersion },
  });

  if (options.features.includes('release')) {
    options.devDependencies.push(['semantic-release', '^19.0.3']);
    options.files.push({
      file: [
        '.github/workflows/test-release.yaml',
        '.github/workflows/parts/base.yaml',
        '.github/workflows/parts/test.yaml',
        '.github/workflows/parts/release.yaml',
      ],
      tags: { minNodeVersion: options.minNodeVersion, pnpmVersion: options.pnpmVersion },
    });
  }

  const templatePath = resolve(util.metaDirname(import.meta.url), '../../template');

  fs.writeJsonSync(resolve(options.path, 'package.json'), createPackageJSON(options), { spaces: 2 });

  function getFileContent(files: string[], tags?: Record<string, string> | undefined): string {
    let content = '';

    for (const file of files) {
      content += fs.readFileSync(resolve(templatePath, `${file}.tpl`), 'utf8');
    }

    if (tags) {
      content = content.replace(/{([a-z]+)}/gi, (_: string, tagName: string) => {
        return tags[tagName] ?? '';
      });
    }

    return content;
  }

  for (const file of options.files) {
    let name: string;
    let content: string;

    if (typeof file === 'string') {
      name = file;
      content = getFileContent([file]);
    } else if (Array.isArray(file.file)) {
      name = file.file[0];
      content = getFileContent(file.file, file.tags);
    } else {
      name = file.file;
      content = getFileContent([file.file], file.tags);
    }

    const filepath = resolve(options.path, name);

    fs.outputFileSync(filepath, content);

    if (options.listCreatedFiles) {
      util.printInfo(`FILE: ${filepath}`, options.colors);
    }
  }

  util.printInfo('Done!', options.colors);

  return options;
}

export async function createRootPath(options: CreateCommandOptions): Promise<boolean> {
  if (!fs.existsSync(options.path)) {
    fs.mkdirSync(options.path, { recursive: true });

    return true;
  }

  if (!(await util.isEmptyDirectory(options.path))) {
    util.printError(
      `The destination exists but is not an empty directory! Please choose another package name or move/rename/delete the destination directory and run the command again.`,
      options.colors,
    );
    util.printErrorHint('create', options.colors);

    return false;
  }

  return true;
}

export function isValidNpmPackageName(options: CreateCommandOptions): boolean {
  const { validForNewPackages, errors } = validateNpmPackageName(options.name);

  if (!validForNewPackages) {
    util.printError(`Invalid project name "${options.name}".`, options.colors);

    if (errors) {
      for (const error of errors) {
        util.printError(error, options.colors);
      }
    }

    util.printErrorHint('create', options.colors);

    return false;
  }

  return true;
}
