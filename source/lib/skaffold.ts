import EventEmitter from 'node:events';

import { SemVer } from 'semver';

import { build } from './build.js';
import type { Feature } from './features.js';
import { failure, isFailure, type Result, success, unwrap } from './result.js';
import { setup } from './setup.js';
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

export type SkaffoldEvent =
  | 'done'
  | 'build'
  | 'setup'
  | 'run:pnpm-install'
  | 'run:pnpm-update'
  | 'run:git-init'
  | 'make:first-commit';

export type Skaffold = {
  on(this: void, event: SkaffoldEvent, callback: () => void): void;
  run(this: void): Promise<void>;
};

export function skaffold(config: SkaffoldConfig): Result<Skaffold, string[]> {
  const configResult = validateConfig(config);
  // eslint-disable-next-line unicorn/prefer-event-target
  const eventEmitter = new EventEmitter();

  if (isFailure(configResult)) {
    return failure(unwrap(configResult));
  }

  async function run(): Promise<void> {
    eventEmitter.emit('build');

    await build({ ...config, pnpmVersion: new SemVer(config.pnpmVersion) });

    eventEmitter.emit('setup');

    await setup(config, eventEmitter);

    eventEmitter.emit('done');
  }

  return success({
    run: () => run(),
    on: (event, callback) => eventEmitter.on(event, callback),
  });
}
