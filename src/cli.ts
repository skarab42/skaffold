import meow from 'meow';
import inquirer from 'inquirer';
import { basename } from 'node:path';
import { skaffold } from './skaffold.js';
import projectNameGenerator from 'project-name-generator';
import validateNpmPackageName from 'validate-npm-package-name';
import { getGitUser, getNpmUser, getVersion, printError, SkaffoldError } from './util.js';

const help = `
Usage
  $ pnpm skaffold [packageName] [options]
  
The best way to generate a project as I would do it myself (Kappa).
If the package name is not provided, a random name will be generated.

Options
  --packageName     , -p  package name (a random name is generated if not provided)     
  --interactive     , -i  interactive prompt (default: false)
  --lintStaged      , -l  lint staged files (default: true)
  --testingSuite    , -t  add testing suite (default: true)
  --listEmittedFiles,     list emitted files (default: true)         
  --version         , -v  print version
  --help            , -h  print this help
`;

const flags = {
  packageName: { type: 'string', alias: 'p' },
  interactive: { type: 'boolean', alias: 'i', default: false },
  lintStaged: { type: 'boolean', alias: 'l', default: true },
  testingSuite: { type: 'boolean', alias: 't', default: true },
  listEmittedFiles: { type: 'boolean', default: true },
  version: { type: 'boolean', alias: 'v' },
  help: { type: 'boolean', alias: 'h' },
} as const;

const cli = meow(help.trim(), { importMeta: import.meta, flags });

if (cli.flags.version) {
  cli.showVersion();
}

if (cli.flags.help) {
  cli.showHelp();
}

async function run(): Promise<void> {
  if (cli.input[0] && cli.flags.packageName) {
    return printError('Do not specify the "packageName" argument and option at the same time.');
  }

  const flagsKeys = Object.keys(flags);
  const cliFlagsKeys = Object.keys(cli.flags);
  const undefinedFlags = cliFlagsKeys.filter((flag) => !flagsKeys.includes(flag));

  if (undefinedFlags.length > 0) {
    const optionWord = `option${undefinedFlags.length === 1 ? '' : 's'}`;
    return printError(`Unknown ${optionWord} "${undefinedFlags.join(',')}".`);
  }

  const packageName = cli.input[0] ?? cli.flags.packageName ?? projectNameGenerator({ words: 3 }).dashed;

  const options = cli.flags.interactive
    ? await inquirer.prompt<{ packageName: string; lintStaged: boolean; testingSuite: boolean }>([
        {
          type: 'input',
          name: 'packageName',
          message: 'package name',
          default: packageName,
        },
        {
          type: 'expand',
          name: 'lintStaged',
          message: 'lint staged files',
          choices: [
            { key: 'y', name: 'yes', value: true },
            { key: 'n', name: 'no', value: false },
          ],
        },
        {
          type: 'expand',
          name: 'testingSuite',
          message: 'testing suite',
          choices: [
            { key: 'y', name: 'yes', value: true },
            { key: 'n', name: 'no', value: false },
          ],
        },
      ])
    : { packageName, lintStaged: cli.flags.lintStaged, testingSuite: cli.flags.testingSuite };

  const { validForNewPackages, errors } = validateNpmPackageName(options.packageName);

  if (!validForNewPackages) {
    printError(`Invalid project name "${packageName}".`);

    if (errors) {
      for (const error of errors) {
        printError(error);
      }
    }

    return;
  }

  try {
    const gitUser = await getGitUser();

    const files = [
      'src/index.ts',
      '.eslintrc.json',
      '.gitignore',
      '.prettierignore',
      '.prettierrc.json',
      'tsconfig.build.json',
      'tsconfig.json',
      { file: 'README.md', tags: { moduleName: basename(packageName), packageName } },
      { file: 'LICENSE', tags: { date: new Date().getFullYear().toString(), ...gitUser } },
    ];

    const devDependencies = [
      '@skarab/eslint-config',
      '@skarab/prettier-config',
      '@skarab/typescript-config',
      '@types/node',
      'eslint',
      'prettier',
      'typescript',
    ];

    if (options.lintStaged) {
      devDependencies.push('lint-staged', 'simple-git-hooks');
      files.push('.lintstagedrc.json', '.simple-git-hooks.json');
    }

    if (options.testingSuite) {
      devDependencies.push('vitest', 'vite-plugin-vitest-typescript-assert');
      files.push('test/index.test.ts', 'vitest.config.ts');
    }

    await skaffold({
      ...cli.flags,
      ...options,
      files,
      gitUser,
      devDependencies,
      npmUser: await getNpmUser(),
      nodeVersion: await getVersion('node'),
      pnpmVersion: await getVersion('pnpm'),
    });
  } catch (error) {
    if (error instanceof SkaffoldError) {
      return printError(error.message);
    }

    throw error;
  }
}

await run();
