import { basename } from 'node:path';
import type { Options } from './types.js';

interface PackageJSON {
  [x: string]: unknown;
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
}

export function createPackageJSON(options: Options): PackageJSON {
  const gitRepo = `${options.gitUser.name}/${basename(options.packageName)}`;

  const config: PackageJSON = {
    name: options.packageName,
    version: options.packageVersion ?? '0.0.0-development',
    description: options.description ?? 'Scaffolded with @skarab/skaffold',
    author: options.gitUser,
    repository: {
      type: 'git',
      url: `https://github.com/${gitRepo}.git`,
    },
    homepage: `https://github.com/${gitRepo}`,
    bugs: `https://github.com/${gitRepo}/issues`,
    funding: `https://github.com/sponsors/${options.gitUser.name}`,
    license: 'MIT',
    private: true,
    type: 'module',
    exports: './lib/index.js',
    types: './lib/index.d.ts',
    scripts: {
      'check': 'tsc -p ./tsconfig.json',
      'build': 'tsc -p ./tsconfig.build.json',
      'lint': 'eslint ./src --fix --max-warnings=0',
      'format': 'prettier **/* --write --cache --ignore-unknown',
      'check-lint-format': 'pnpm check && pnpm lint && pnpm format',
      'test': `pnpm check-lint-format${options.testingSuite ? ' && pnpm vitest run' : ''}`,
    },
    devDependencies: {},
    engines: {
      node: `>=${options.nodeVersion.major}`,
      pnpm: `>=${options.pnpmVersion.major}`,
    },
    packageManager: `pnpm@${options.pnpmVersion.version}`,
  };

  const devDependencies = [...options.devDependencies].sort();

  for (const dependency of devDependencies) {
    config.devDependencies[dependency] = '*';
  }

  if (options.lintStaged) {
    config.scripts['prepare'] = 'npx simple-git-hooks';
  }

  return config;
}
