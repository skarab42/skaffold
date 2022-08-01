import fs from 'fs-extra';
import { resolve } from 'node:path';
import * as commander from 'commander';
import { metaDirname } from './util.js';
import { create, createFeatures } from './commands/create.js';

const program = new commander.Command();

const { version } = fs.readJsonSync(resolve(metaDirname(import.meta.url), '../package.json')) as {
  version: string;
};

program
  .name('skaffold')
  .version(version, '-v, --version')
  .description('The best way to generate a project as I would do it myself (Kappa).');

program
  .command('create')
  .description('Create a new project.\n\nIf the package name is not provided, a random name will be generated.')
  .argument('[package-name]', 'a valid npm package name', 'random')
  .addOption(
    new commander.Option('-f, --features [features...]', 'features to includes').choices(createFeatures).default('all'),
  )
  .option('-i, --interactive', 'interactive prompt', false)
  .option('--list-created-files', 'list created files', true)
  .option('--no-colors', 'disable colors in output')
  .action(create);

program.parse();
