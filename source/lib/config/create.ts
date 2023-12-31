import path from 'node:path';

import { getGitUser } from '../git-utils.js';
import type { SkaffoldOptions } from '../skaffold.js';
import { randomProjectName, type RequiredStrict } from '../utils.js';

export type SkaffoldConfig = RequiredStrict<SkaffoldOptions>;

export async function createConfig(options: SkaffoldOptions): Promise<SkaffoldConfig> {
  const overwrite = options.overwrite ?? false;
  const author = options.author ?? (await getGitUser());
  const projectName = options.projectName ?? randomProjectName();
  const projectPath = path.resolve(options.projectPath ?? path.join(process.cwd(), projectName));

  return { ...options, overwrite, author, projectName, projectPath };
}
