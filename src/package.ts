import { basename } from 'node:path';
import type { Options } from './types.js';

export function createPackageJSON(options: Options): Record<string, unknown> {
  const gitRepo = `${options.gitUser.name}/${basename(options.packageName)}`;

  return {
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
      check: 'tsc -p ./tsconfig.json',
      build: 'tsc -p ./tsconfig.build.json',
      lint: 'eslint ./src --fix --max-warnings=0',
      format: 'prettier **/* --write --cache --ignore-unknown',
      test: 'pnpm check && pnpm lint && pnpm format',
    },
    devDependencies: {
      '@skarab/eslint-config': '*',
      '@skarab/prettier-config': '*',
      '@skarab/typescript-config': '*',
      '@types/node': '*',
      'eslint': '*',
      'prettier': '*',
      'typescript': '*',
    },
    engines: {
      node: `>=${options.nodeVersion.major}`,
      pnpm: `>=${options.pnpmVersion.major}`,
    },
    packageManager: `pnpm@${options.pnpmVersion.version}`,
  };
}
