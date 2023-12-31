import path from 'node:path';

import { getGitUser } from '../git-utils.js';
import type { SkaffoldOptions } from '../skaffold.js';
import { randomProjectName, type RequiredStrict } from '../utils.js';

export type OptionalFieldName = 'funding' | 'homepage' | 'repository' | 'bugs';
export type RequiredFields = RequiredStrict<Omit<SkaffoldOptions, OptionalFieldName>>;
export type OptionalFields = Pick<SkaffoldOptions, OptionalFieldName>;
export type SkaffoldConfig = RequiredFields & OptionalFields;

export async function createConfig(options: SkaffoldOptions): Promise<SkaffoldConfig> {
  const overwrite = options.overwrite ?? false;
  const author = options.author ?? (await getGitUser());
  const license = options.license ?? 'MIT';
  const description = options.description ?? 'My awesome project';
  const projectName = options.projectName ?? randomProjectName();
  const projectPath = path.resolve(options.projectPath ?? path.join(process.cwd(), projectName));
  const homepage = options.homepage ?? options.repository;
  const type = options.type ?? 'module';

  return {
    ...options,
    type,
    homepage,
    overwrite,
    author,
    license,
    description,
    projectName,
    projectPath,
  };
}
