import fs from 'fs-extra';
import { resolve } from 'node:path';
import * as commander from 'commander';
import { metaDirname } from './util.js';
import { create, createCommandFeatureChoices } from './commands/create.js';

const program = new commander.Command();

const { version } = fs.readJsonSync(resolve(metaDirname(import.meta.url), '../package.json')) as {
  version: string;
};

program
  .name('skaffold')
  .version(version, '-v, --version')
  .description('The best way to scaffold a project as I would do it myself (Kappa).');

program
  .command('create')
  .description('Create a new project.\n\nIf the package name is not provided, a random name will be generated.')
  .argument('[name]', 'a valid npm package name', 'random')
  .addOption(
    new commander.Option('-f, --features [features...]', 'features to includes')
      .choices(createCommandFeatureChoices)
      .default('all'),
  )
  .option('--user-name [name]', 'user name')
  .option('--user-email [email]', 'user email')
  .option('--min-node-version [version]', 'min node version')
  .option('--min-pnpm-version [version]', 'min pnpm version')
  .option('-p, --public', 'public package', false)
  .option('-i, --interactive', 'interactive prompt', false)
  .option('--list-created-files', 'list created files', false)
  .option('--no-colors', 'disable colors in output')
  .action(create);

program.parse();
