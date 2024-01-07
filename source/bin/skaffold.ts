import path from 'node:path';

import { Command } from 'commander';
import fs from 'fs-extra';

import { metaDirname } from '../lib/index.js';
import { createCommand } from './commands/index.js';

const rootPath = path.resolve(metaDirname(import.meta), '..', '..', 'package.json');
const packageJson = fs.readJSONSync(rootPath) as { name: string; description: string; version: string };

new Command()
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version, '-v, --version')
  .addCommand(createCommand, { isDefault: true })
  .parse();
