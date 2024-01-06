import { SemVer } from 'semver';

import { build } from './build.js';
import type { Feature } from './features.js';

export type Type = 'module' | 'commonjs';
export type User = { name?: string | undefined; email?: string | undefined };
export type Project = { name: string; namespace?: string | undefined; identifier: string };

export type SkaffoldConfig = {
  user: User;
  type: Type;
  project: Project;
  features: Feature[];
  pnpmVersion: string;
  nodeVersions: string[];
  outputDirectory: string;
};

export type SkaffoldBuildConfig = Omit<SkaffoldConfig, 'pnpmVersion'> & {
  pnpmVersion: SemVer;
};

export async function skaffold(config: SkaffoldConfig): Promise<void> {
  const pnpmVersion = new SemVer(config.pnpmVersion);
  const buildConfig: SkaffoldBuildConfig = { ...config, pnpmVersion };

  await build(buildConfig);
}
