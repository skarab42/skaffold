import chalk from 'chalk';
import fs from 'fs-extra';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function metaDirname(url: string): string {
  return dirname(fileURLToPath(url));
}

export const errorLabel = chalk.bold.hex('#111').bgRed(' ERROR ');
export const infoLabel = chalk.bold.hex('#111').bgBlueBright(' INFO ');

export function printError(message: string, colors = true): void {
  process.exitCode = 1;
  // eslint-disable-next-line no-console
  console.error(colors ? errorLabel : 'ERROR:', colors ? chalk.red(message) : message);
}

export function printErrorHint(command = '', colors = true): void {
  command = ['skaffold', command, '--help'].join(' ');
  // eslint-disable-next-line no-console
  console.error(`For help, run ${colors ? chalk.gray(command) : command}.`);
}

export function printInfo(message: string, colors = true): void {
  // eslint-disable-next-line no-console
  console.log(colors ? infoLabel : 'INFO:', message);
}

export async function isEmptyDirectory(path: string): Promise<boolean> {
  let directory;
  try {
    directory = await fs.opendir(path);
    return (await directory.read()) === null;
  } catch {
    return false;
  } finally {
    await directory?.close();
  }
}
