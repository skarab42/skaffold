import { Argument, Command, Option } from 'commander';
import ora from 'ora';

import {
  type AfterBuild,
  features,
  fetchCurrentNodeVersions,
  getBinVersion,
  getGitUser,
  isFailure,
  printer,
  randomProjectName,
  skaffold,
  type SkaffoldConfig,
  unwrap,
} from '../../lib/index.js';

const gitUser = await getGitUser();
const defaultProjectName = randomProjectName();
const nodeVersions = await fetchCurrentNodeVersions();
const pnpmVersion = (await getBinVersion('pnpm')) ?? '8';

export const createCommand = new Command('create')
  .description('create a new project (default)')
  .addArgument(new Argument('[project-name]', 'a valid npm package name').default(defaultProjectName, 'random'))
  .addOption(new Option('--type <type>', 'script type').choices(['module', 'commonjs']).default('module'))
  .option('--user-name [name]', 'user name', gitUser.name)
  .option('--user-email [email]', 'user email', gitUser.email)
  .option('--pnpm-version <version>', 'pnpm version', pnpmVersion)
  .addOption(
    new Option('--node-versions [version...]', 'supported node versions').choices(nodeVersions).default(nodeVersions),
  )
  .addOption(
    new Option('-f, --features [feature...]', 'features to includes').choices(features).default(features, 'all'),
  )
  .addOption(
    new Option('-o, --output-directory [path]', 'output directory path').default(
      `./${defaultProjectName}`,
      './${project-name}',
    ),
  )
  .option('--run-git-init', 'run "git init" command after project creation', true)
  .option('--run-pnpm-install', 'run "pnpm install" command after project creation', true)
  .option('--run-pnpm-update', 'run "pnpm update" command after project creation', true)
  .option('--make-first-commit', 'make first commit after project creation', true)
  .option('--overwrite', 'overwrite the project if it exists', false)
  .option('--no-colors', 'disable colors in output')
  .action(createAction);

type CreateCommandOptions = Omit<SkaffoldConfig, 'user' | 'project' | 'afterBuild'> &
  AfterBuild & {
    userName: string;
    userEmail: string;
    colors: boolean;
  };

type ParseConfigOptions = Omit<CreateCommandOptions, 'colors'>;

function parseProject(name: string): SkaffoldConfig['project'] {
  const [namespace, identifier] = name.split('/', 2) as [string, string | undefined];

  if (namespace && identifier) {
    return { name, namespace, identifier };
  }

  return { name, namespace: undefined, identifier: namespace };
}

function parseConfig(projectName: string, options: ParseConfigOptions): SkaffoldConfig {
  const project = parseProject(projectName);
  const { userName, userEmail, runGitInit, runPnpmInstall, runPnpmUpdate, makeFirstCommit, ...restOptions } = options;
  const afterBuild = { runGitInit, runPnpmInstall, runPnpmUpdate, makeFirstCommit };
  const user: SkaffoldConfig['user'] = { name: userName, email: userEmail };

  let outputDirectory = options.outputDirectory;

  if (outputDirectory === `./${defaultProjectName}` && defaultProjectName !== projectName) {
    outputDirectory = `./${projectName}`;
  }

  return { project, user, ...restOptions, outputDirectory, afterBuild };
}

async function createAction(projectName: string, options: CreateCommandOptions): Promise<void> {
  const { colors, ...parseConfigOptions } = options;
  const config = parseConfig(projectName, parseConfigOptions);
  const print = printer(colors);

  const result = skaffold(config);

  if (isFailure(result)) {
    print.error(unwrap(result).join('\n'));
    print.errorHint('create');
    return;
  }

  const { project, outputDirectory } = config;
  const { on, run } = unwrap(result);
  const spinner = ora();

  on('build', () => {
    print.info(`Skaffold "${project.name}" in "${outputDirectory}"`);
    spinner.text = 'Building project';
    spinner.start();
  });

  on('setup', () => {
    spinner.text = 'Setup project';
  });

  on('run:pnpm-install', () => {
    spinner.text = 'Installing dependencies';
  });

  on('run:pnpm-update', () => {
    spinner.text = 'Updating dependecies';
  });

  on('run:git-init', () => {
    spinner.text = 'Initializing git repository';
  });

  on('make:first-commit', () => {
    spinner.text = 'Making first commit';
  });

  on('done', () => {
    spinner.succeed('Project ready!');
  });

  await run();
}
