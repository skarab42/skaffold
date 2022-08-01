import fs from 'fs-extra';
import { basename, resolve } from 'node:path';
import projectNameGenerator from 'project-name-generator';
import validateNpmPackageName from 'validate-npm-package-name';
import { isEmptyDirectory, printError, printErrorHint, printInfo } from '../util.js';

export const createFeatures = ['lint-staged', 'vitest', 'vitest-type-assert'] as const;

export type CreateFeature = typeof createFeatures[number];

export interface CreateOptions {
  colors: boolean;
  interactive: boolean;
  listCreatedFiles: boolean;
  features: 'all' | readonly CreateFeature[];
}

export async function create(name: string, options: CreateOptions): Promise<void> {
  let path = resolve(process.cwd(), name);

  if (name === 'random') {
    name = projectNameGenerator({ words: 3 }).dashed;
    path = resolve(process.cwd(), name);
  } else if (name === '.') {
    path = process.cwd();
    name = basename(path);
  }

  if (!isValidNpmPackageName(name, options)) {
    return;
  }

  const shortName = basename(name);

  if (options.features === 'all') {
    options.features = createFeatures;
  }

  printInfo(`Skaffold package "${name}" at "${path}".`, options.colors);

  if (!(await createRootPath(path, options))) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log({ name, shortName, path, options });
}

export async function createRootPath(path: string, options: CreateOptions): Promise<boolean> {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });

    return true;
  }

  if (!(await isEmptyDirectory(path))) {
    printError(
      `The destination exists but is not an empty directory! Please choose another package name or move/rename/delete the destination directory and run the command again.`,
      options.colors,
    );
    printErrorHint('create', options.colors);

    return false;
  }

  return true;
}

export function isValidNpmPackageName(name: string, options: CreateOptions): boolean {
  const { validForNewPackages, errors } = validateNpmPackageName(name);

  if (!validForNewPackages) {
    printError(`Invalid project name "${name}".`, options.colors);

    if (errors) {
      for (const error of errors) {
        printError(error, options.colors);
      }
    }

    printErrorHint('create', options.colors);

    return false;
  }

  return true;
}
