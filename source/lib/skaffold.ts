import { SemVer } from 'semver';

import { build } from './build.js';
import type { Feature } from './features.js';
import { failure, isFailure, type Result, success, unwrap } from './result.js';
import { validateConfig } from './validate.js';

export type Type = 'module' | 'commonjs';
export type User = { name?: string | undefined; email?: string | undefined };
export type Project = { name: string; namespace?: string | undefined; identifier: string };
export type AfterBuild = {
  runGitInit: boolean;
  runPnpmInstall: boolean;
  runPnpmUpdate: boolean;
  makeFirstCommit: boolean;
};

export type SkaffoldConfig = {
  user: User;
  type: Type;
  project: Project;
  features: Feature[];
  pnpmVersion: string;
  nodeVersions: string[];
  outputDirectory: string;
  overwrite: boolean;
  afterBuild: AfterBuild;
};

export type SkaffoldBuildConfig = Omit<SkaffoldConfig, 'pnpmVersion'> & {
  pnpmVersion: SemVer;
};

export async function skaffold(config: SkaffoldConfig): Promise<Result<true, string[]>> {
  const configResult = validateConfig(config);

  if (isFailure(configResult)) {
    return failure(unwrap(configResult));
  }

  await build({ ...config, pnpmVersion: new SemVer(config.pnpmVersion) });

  return success(true);
}
