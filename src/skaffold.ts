import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import type { Options } from './types.js';
import { dirname, resolve } from 'node:path';
import { createPackageJSON } from './package.js';
import { printInfo, isEmptyDirectory, SkaffoldError } from './util.js';

export async function skaffold(options: Options): Promise<void> {
  const packagePath = resolve(process.cwd(), options.packageName);
  const templatePath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'template');

  printInfo(`Skaffold package "${options.packageName}" at "${packagePath}".`);

  if (!fs.existsSync(packagePath)) {
    fs.mkdirSync(packagePath, { recursive: true });
  } else if (!(await isEmptyDirectory(packagePath))) {
    throw new SkaffoldError(
      `The destination exists but is not an empty directory! Please choose another package name or move/rename/delete the destination directory and run the command again.`,
    );
  }

  fs.writeJsonSync(resolve(packagePath, 'package.json'), createPackageJSON(options), { spaces: 2 });

  for (const file of options.files) {
    const name = typeof file === 'string' ? file : file.file;
    const tags = typeof file === 'string' ? undefined : file.tags;

    let content = fs.readFileSync(resolve(templatePath, name), 'utf8');

    if (tags) {
      content = content.replace(/{([a-z]+)}/gi, (_: string, tagName: string) => {
        return tags[tagName] ?? tagName;
      });
    }

    const filepath = resolve(packagePath, name);

    if (options.listEmittedFiles) {
      printInfo(`FILE: ${filepath}`);
    }

    fs.outputFileSync(filepath, content);
  }
}
