import chalk from 'chalk';
import fs from 'fs-extra';
import semver from 'semver';
import { execa } from 'execa';
import type { NPMUser, GITUser } from './types.js';

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

export async function getNpmUser(): Promise<NPMUser> {
  const childProcess = await execa('npm', ['whoami']);
  const name = childProcess.stdout.trim();

  if (name.length === 0) {
    throw new SkaffoldError(`Unable to retrieve your NPM username.`);
  }

  return { name };
}

export async function getGitConfig(key: string): Promise<string> {
  const childProcess = await execa('git', ['config', key]);
  const value = childProcess.stdout.trim();

  if (value.length === 0) {
    throw new SkaffoldError(`Unable to retrieve your GIT "${key}".`);
  }

  return value;
}

export async function getGitUser(): Promise<GITUser> {
  return { name: await getGitConfig('user.name'), email: await getGitConfig('user.email') };
}

export async function getVersion(bin: string): Promise<semver.SemVer> {
  const childProcess = await execa(bin, ['--version']);
  const version = semver.parse(childProcess.stdout);

  if (version === null) {
    throw new SkaffoldError(`Unable to retrieve the "${bin}" version.`);
  }

  return version;
}
