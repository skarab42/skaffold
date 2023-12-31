import path from 'node:path';

import type { SkaffoldOptions } from '../skaffold.js';
import { randomProjectName, type RequiredStrict } from '../utils.js';

export type SkaffoldConfig = RequiredStrict<SkaffoldOptions>;

export function createConfig(options: SkaffoldOptions): SkaffoldConfig {
  const overwrite = options.overwrite ?? false;
  const projectName = options.projectName ?? randomProjectName();
  const projectPath = path.resolve(options.projectPath ?? path.join(process.cwd(), projectName));

  return { ...options, overwrite, projectName, projectPath };
}
