import path from 'node:path';

import type { SkaffoldOptions } from '../skaffold.js';
import { getGitUser, getVersion, randomProjectName, type RequiredStrict } from '../utils.js';

export type OptionalFieldName = 'funding' | 'repository' | 'homepage' | 'bugs';
export type RequiredFields = RequiredStrict<Omit<SkaffoldOptions, OptionalFieldName>>;
export type OptionalFields = Pick<SkaffoldOptions, OptionalFieldName>;
export type SkaffoldConfig = RequiredFields &
  OptionalFields & {
    funding: string | undefined;
    authorName: string | undefined;
    versions: {
      node: string;
      pnpm: string;
    };
  };

async function getVersions(): Promise<{
  node: string;
  pnpm: string;
}> {
  const nodeVersion = await getVersion('node');
  const pnpmVersion = await getVersion('pnpm');

  return {
    node: nodeVersion?.version ?? '18.18.0',
    pnpm: pnpmVersion?.version ?? '8.13.1',
  };
}

function getFunding({ funding }: SkaffoldOptions, authorName?: string | undefined): string | undefined {
  if (funding === undefined || typeof funding === 'string') {
    return funding;
  }

  return funding ? `https://github.com/sponsors/${authorName}` : undefined;
}

export async function createConfig(options: SkaffoldOptions): Promise<SkaffoldConfig> {
  const author = options.author ?? (await getGitUser());
  const authorName = typeof author === 'string' ? author : author.name;
  const projectName = options.projectName ?? randomProjectName();
  const projectPath = path.resolve(options.projectPath ?? path.join(process.cwd(), projectName));
  const bugs = options.bugs ?? (options.repository ? `${options.repository}/issues` : undefined);
  const homepage = options.homepage ?? options.repository;
  const type = options.type ?? 'module';
  const ts = options.ts ?? true;
  const funding = getFunding(options, authorName);
  const versions = await getVersions();

  return {
    ...options,
    overwrite: options.overwrite ?? false,
    license: options.license ?? 'MIT',
    description: options.projectName ?? randomProjectName(),
    bugs,
    funding,
    versions,
    ts,
    type,
    homepage,
    author,
    authorName,
    projectName,
    projectPath,
  };
}
