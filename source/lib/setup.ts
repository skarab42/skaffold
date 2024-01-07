import { type EventEmitter } from 'node:events';

import { runBin } from './bin.js';
import { type SkaffoldConfig } from './skaffold.js';

export async function setup(config: SkaffoldConfig, eventEmitter: EventEmitter): Promise<void> {
  const { runPnpmInstall, runPnpmUpdate, runGitInit, makeFirstCommit } = config.afterBuild;

  if (runPnpmInstall || runPnpmUpdate) {
    eventEmitter.emit('run:pnpm-install');
    await runBin('pnpm', ['install'], config.outputDirectory);

    if (runPnpmUpdate) {
      eventEmitter.emit('run:pnpm-update');
      await runBin('pnpm', ['update'], config.outputDirectory);
    }
  }

  if (runGitInit || makeFirstCommit) {
    eventEmitter.emit('run:git-init');
    await runBin('git', ['init'], config.outputDirectory);

    if (makeFirstCommit) {
      eventEmitter.emit('make:first-commit');
      await runBin('git', ['add', '--all'], config.outputDirectory);
      await runBin('git', ['commit', '-m', 'feat: skaffold'], config.outputDirectory);
      await runBin('git', ['checkout', '-b', 'develop'], config.outputDirectory);
    }
  }
}
