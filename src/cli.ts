/* eslint-disable no-console */
import meow from 'meow';
import inquirer from 'inquirer';
import { skaffold } from './skaffold.js';
import projectNameGenerator from 'project-name-generator';
import validateNpmPackageName from 'validate-npm-package-name';

const help = `
Usage
  $ skaffold [packageName] [options]
  
Options
  --packageName, -p  package name
  --interactive, -i  interactive prompt
  --version    , -v  print version
  --help       , -h  print this help
`;

const cli = meow(help.trim(), {
  importMeta: import.meta,
  flags: {
    packageName: { type: 'string', alias: 'p' },
    interactive: { type: 'boolean', alias: 'i' },
    version: { type: 'boolean', alias: 'v' },
    help: { type: 'boolean', alias: 'h' },
  },
});

if (cli.flags.version) {
  cli.showVersion();
}

if (cli.flags.help) {
  cli.showHelp();
}

if (cli.input[0] && cli.flags.packageName) {
  console.error('ERROR: do not specify the "packageName" argument and option at the same time');
  cli.showHelp();
}

const packageName = cli.input[0] ?? cli.flags.packageName ?? projectNameGenerator({ words: 3 }).dashed;
const { validForNewPackages, errors } = validateNpmPackageName(packageName);

if (!validForNewPackages) {
  console.error(`ERROR: invalid project name "${packageName}"`);

  if (errors) {
    for (const error of errors) {
      console.error('ERROR:', error);
    }
  }

  cli.showHelp();
}

const interactiveAnswers = cli.flags.interactive
  ? await inquirer.prompt<{ packageName: string }>([
      {
        type: 'input',
        name: 'packageName',
        message: 'package name',
        default: packageName,
      },
    ])
  : { packageName };

skaffold({ ...cli.flags, ...interactiveAnswers });
