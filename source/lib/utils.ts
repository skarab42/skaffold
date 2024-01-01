import { execa } from 'execa';
import fs from 'fs-extra';
import { parse, type SemVer } from 'semver';

export type GitUser = {
  name: string;
  email: string;
};

export async function getGitConfig(key: string): Promise<string> {
  const childProcess = await execa('git', ['config', key]);

  return childProcess.stdout.trim();
}

export async function getGitUser(): Promise<GitUser> {
  return { name: await getGitConfig('user.name'), email: await getGitConfig('user.email') };
}

export async function getVersion(bin: string): Promise<SemVer | undefined> {
  const childProcess = await execa(bin, ['--version']);

  return parse(childProcess.stdout) ?? undefined;
}

export type RequiredStrict<T> = { [P in keyof T]-?: Exclude<T[P], undefined> };

export function randomShortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function randomProjectName(): string {
  return `my-project-${randomShortId()}`;
}

export function isDirectoryEmpty(path: string): boolean {
  let directory: fs.Dir | undefined;
  try {
    directory = fs.opendirSync(path);
    return directory.readSync() === null;
  } catch {
    return false;
  } finally {
    void directory?.close();
  }
}
