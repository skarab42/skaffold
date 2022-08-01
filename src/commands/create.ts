import fs from 'fs-extra';
import inquirer from 'inquirer';
import * as util from '../util.js';
import { basename, resolve } from 'node:path';
import projectNameGenerator from 'project-name-generator';
import validateNpmPackageName from 'validate-npm-package-name';

export const createFeatures = ['lint-staged', 'vitest', 'vitest-type-assert'] as const;

export type CreateFeature = typeof createFeatures[number];

export interface BaseOptions {
  userName?: string;
  userEmail?: string;
  minNodeVersion?: string;
  minPnpmVersion?: string;
  features: 'all' | readonly CreateFeature[];
}

export interface CommandLineOptions extends BaseOptions {
  colors: boolean;
  interactive: boolean;
  listCreatedFiles: boolean;
}

export interface InteractiveOptions {
  name: string;
  options: Required<BaseOptions>;
}

export interface Options extends Required<CommandLineOptions> {}

export async function create(name: string, commandLineOptions: CommandLineOptions): Promise<void> {
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

  let options: Options = {
    userName: gitUser.name,
    userEmail: gitUser.email,
    minNodeVersion: nodeVersion ? nodeVersion.major.toString() : '14',
    minPnpmVersion: pnpmVersion ? pnpmVersion.major.toString() : '7',
    ...commandLineOptions,
  };

  if (options.interactive) {
    const interactiveOptions = await inquirer.prompt<InteractiveOptions>([
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
        choices: createFeatures,
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

    name = interactiveOptions.name;
    path = resolve(process.cwd(), name);
    options = { ...options, ...interactiveOptions.options };
  }

  if (!isValidNpmPackageName(name, options)) {
    return;
  }

  const shortName = basename(name);

  if (options.features === 'all') {
    options.features = createFeatures;
  }

  util.printInfo(`Skaffold package "${name}" at "${path}".`, options.colors);

  if (!(await createRootPath(path, options))) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log({ name, shortName, path, options });
}

export async function createRootPath(path: string, options: CommandLineOptions): Promise<boolean> {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });

    return true;
  }

  if (!(await util.isEmptyDirectory(path))) {
    util.printError(
      `The destination exists but is not an empty directory! Please choose another package name or move/rename/delete the destination directory and run the command again.`,
      options.colors,
    );
    util.printErrorHint('create', options.colors);

    return false;
  }

  return true;
}

export function isValidNpmPackageName(name: string, options: CommandLineOptions): boolean {
  const { validForNewPackages, errors } = validateNpmPackageName(name);

  if (!validForNewPackages) {
    util.printError(`Invalid project name "${name}".`, options.colors);

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
