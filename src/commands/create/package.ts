import type { CreateCommandOptions } from '../create.js';

interface PackageJSON {
  [x: string]: unknown;
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
}

export function createPackageJSON(options: CreateCommandOptions): PackageJSON {
  const gitRepo = `${options.userName}/${options.shortName}`;
  const hasTest = options.features.includes('vitest');

  const config: PackageJSON = {
    name: options.name,
    version: '0.0.0-development',
    description: 'Scaffolded with @skarab/skaffold',
    author: { name: options.userName, email: options.userEmail },
    repository: {
      type: 'git',
      url: `https://github.com/${gitRepo}.git`,
    },
    homepage: `https://github.com/${gitRepo}`,
    bugs: `https://github.com/${gitRepo}/issues`,
    funding: `https://github.com/sponsors/${options.userName}`,
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
      'test': `pnpm check-lint-format${hasTest ? ' && pnpm vitest run' : ''}`,
    },
    devDependencies: {},
    engines: {
      node: `>=${options.minNodeVersion}`,
      pnpm: `>=${options.minPnpmVersion}`,
    },
    packageManager: `pnpm@${options.pnpmVersion}`,
  };

  const devDependencies = [...options.devDependencies].sort();

  for (const dependency of devDependencies) {
    config.devDependencies[dependency] = '*';
  }

  if (options.features.includes('lint-staged')) {
    config.scripts['prepare'] = 'npx simple-git-hooks';
  }

  return config;
}
