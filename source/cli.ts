import { resolve } from 'node:path';

import * as commander from 'commander';
import fs from 'fs-extra';

import { create, createCommandFeatureChoices } from './commands/create.js';
import { init } from './commands/init.js';
import { metaDirname } from './util.js';

const program = new commander.Command();

const { version } = fs.readJsonSync(resolve(metaDirname(import.meta.url), '../package.json')) as {
  version: string;
};

program
  .name('skaffold')
  .version(version, '-v, --version')
  .description('The best way to scaffold a project as I would do it myself (Kappa).');

program.command('init', { isDefault: true }).description('initialize a (new) project').action(init);
program.command('create').description('create a new project').action(create);

for (const command of program.commands) {
  command
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
    .option('--no-colors', 'disable colors in output');
}

program.parse();
