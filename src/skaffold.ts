import fs from 'fs-extra';
import { resolve } from 'node:path';
import { printInfo, isEmptyDirectory, SkaffoldError } from './util.js';

export interface Options {
  packageName: string;
}

export async function skaffold(options: Options): Promise<void> {
  const packagePath = resolve(process.cwd(), options.packageName);

  printInfo(`Skaffold package "${options.packageName}" at "${packagePath}".`);

  if (!fs.existsSync(packagePath)) {
    fs.mkdirSync(packagePath);
  } else if (!(await isEmptyDirectory(packagePath))) {
    throw new SkaffoldError(
      `The destination exists but is not an empty directory! Please choose another package name or move/rename/delete the destination directory and run the command again.`,
    );
  }

  // eslint-disable-next-line no-console
  console.log({ packagePath });
}
