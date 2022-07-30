import meow from 'meow';
import inquirer from 'inquirer';
import { skaffold } from './skaffold.js';
import { printError, SkaffoldError } from './util.js';
import projectNameGenerator from 'project-name-generator';
import validateNpmPackageName from 'validate-npm-package-name';

const help = `
Usage
  $ pnpm skaffold [packageName] [options]
  
The best way to generate a project as I would do it myself (Kappa).
If the package name is not provided, a random name will be generated.

Options
  --packageName, -p  package name (a random name is generated if not provided)     
  --interactive, -i  interactive prompt            
  --version    , -v  print version
  --help       , -h  print this help
`;

const flags = {
  packageName: { type: 'string', alias: 'p' },
  interactive: { type: 'boolean', alias: 'i' },
  version: { type: 'boolean', alias: 'v' },
  help: { type: 'boolean', alias: 'h' },
} as const;

const cli = meow(help.trim(), { importMeta: import.meta, flags });

if (cli.flags.version) {
  cli.showVersion();
}

if (cli.flags.help) {
  cli.showHelp();
}

async function run(): Promise<void> {
  if (cli.input[0] && cli.flags.packageName) {
    return printError('Do not specify the "packageName" argument and option at the same time.');
  }

  const flagsKeys = Object.keys(flags);
  const cliFlagsKeys = Object.keys(cli.flags);
  const undefinedFlags = cliFlagsKeys.filter((flag) => !flagsKeys.includes(flag));

  if (undefinedFlags.length > 0) {
    const optionWord = `option${undefinedFlags.length === 1 ? '' : 's'}`;
    return printError(`Unknown ${optionWord} "${undefinedFlags.join(',')}".`);
  }

  const packageName = cli.input[0] ?? cli.flags.packageName ?? projectNameGenerator({ words: 3 }).dashed;
  const { validForNewPackages, errors } = validateNpmPackageName(packageName);

  if (!validForNewPackages) {
    printError(`Invalid project name "${packageName}".`);

    if (errors) {
      for (const error of errors) {
        printError(error);
      }
    }

    return;
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

  try {
    await skaffold({ ...cli.flags, ...interactiveAnswers });
  } catch (error) {
    if (error instanceof SkaffoldError) {
      return printError(error.message);
    }

    throw error;
  }
}

await run();
