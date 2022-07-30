import chalk from 'chalk';
import fs from 'fs-extra';

export class SkaffoldError extends Error {}

export const errorLabel = chalk.bold.hex('#111').bgRed(' ERROR ');
export const infoLabel = chalk.bold.hex('#111').bgBlueBright(' INFO ');

export function printError(message: string): void {
  process.exitCode = 1;
  // eslint-disable-next-line no-console
  console.error(`${errorLabel} ${chalk.red(message)}\nFor help, run ${chalk.gray('pnpm skaffold --help')}.`);
}

export function printInfo(message: string): void {
  // eslint-disable-next-line no-console
  console.log(infoLabel, message);
}

export function isDirectory(path: string): boolean {
  return fs.statSync(path).isDirectory();
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
