import * as util from '../util.js';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { createProject } from './create.js';
import type { CreateCommandCommandLineOptions } from './create.js';

import { execa } from 'execa';

export async function init(name: string, commandLineOptions: CreateCommandCommandLineOptions): Promise<void> {
  const path = resolve(process.cwd(), name);

  if (!existsSync(path) && !(await createProject(name, commandLineOptions))) {
    return;
  }

  util.printInfo(`Initialize package "${name}" at "${path}".`, commandLineOptions.colors);

  if (!existsSync(resolve(path, 'node_modules'))) {
    await execAndPrint('pnpm', ['install'], path, commandLineOptions);
  }

  if (!existsSync(resolve(path, '.git'))) {
    await execAndPrint('git', ['init'], path, commandLineOptions);
    await execAndPrint('git', ['add', '--all'], path, commandLineOptions);
    await execAndPrint('git', ['commit', '-m', '"feat: skaffold"'], path, commandLineOptions);
    await execAndPrint('git', ['checkout', '-b', 'dev'], path, commandLineOptions);
  }

  util.printInfo('Done!', commandLineOptions.colors);
}

async function execAndPrint(
  file: string,
  argv: string[],
  path: string,
  commandLineOptions: CreateCommandCommandLineOptions,
): Promise<void> {
  util.printInfo(`> ${file} ${argv.join(' ')}`, commandLineOptions.colors);

  const childProcess = execa(file, argv, { cwd: path });

  childProcess.stdout?.pipe(process.stdout);

  await childProcess;
}
