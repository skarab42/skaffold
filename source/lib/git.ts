import { execa } from 'execa';

export type GitUser = {
  name?: string | undefined;
  email?: string | undefined;
};

export type GitConfig = Map<string, string>;

export async function getGitConfig(): Promise<GitConfig>;
export async function getGitConfig(key: string): Promise<string>;
export async function getGitConfig(key?: string): Promise<GitConfig | string> {
  const childProcess = await execa('git', ['config', key ?? '--list']);
  const stdout = childProcess.stdout.trim();

  if (key === undefined) {
    const lines = stdout.split('\n');
    const config = lines.map((line) => line.split('=', 2) as [string, string]);

    return new Map(config);
  }

  return stdout;
}

export async function getGitUser(): Promise<GitUser> {
  const config = await getGitConfig();
  return {
    name: config.get('user.name'),
    email: config.get('user.email'),
  };
}
