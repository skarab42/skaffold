import fs from 'fs-extra';
import { resolve } from 'node:path';
import { printInfo, isDirectory, isEmptyDirectory, SkaffoldError } from './util.js';

export interface Options {
  packageName: string;
}

export async function skaffold(options: Options): Promise<void> {
  const packagePath = resolve(process.cwd(), options.packageName);
  const packagePathIsDirectory = isDirectory(packagePath);
  const packagePathIsEmptyDirectory = packagePathIsDirectory && (await isEmptyDirectory(packagePath));

  printInfo(`Skaffold package "${options.packageName}" at "${packagePath}".`);

  if (fs.existsSync(packagePath) && (!packagePathIsDirectory || !packagePathIsEmptyDirectory)) {
    throw new SkaffoldError(
      `The destination exists but is not an empty directory! Please choose another package name or move/rename/delete the destination directory and run the command again.`,
    );
  }

  if (!packagePathIsEmptyDirectory) {
    fs.mkdirSync(packagePath);
  }

  // eslint-disable-next-line no-console
  console.log({ packagePath });
}
