import { execa } from 'execa';

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
