import type { CreateCommandOptions } from '../create.js';

type PackageJSON = {
  [x: string]: unknown;
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
};

export function createPackageJSON(options: CreateCommandOptions): PackageJSON {
  const gitRepo = `${options.userName}/${options.shortName}`;

  let testScript = `pnpm check-lint-format`;

  if (options.features.includes('vitest')) {
    testScript += ` && pnpm vitest run`;

    if (options.features.includes('coverage')) {
      testScript += ` --coverage`;
    }
  }

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
    type: 'module',
    exports: './build/index.js',
    types: './build/index.d.ts',
    private: !options.public,
    publishConfig: {
      access: options.public ? 'public' : 'restricted',
    },
    files: ['build'],
    scripts: {
      'build': 'tsc -p ./tsconfig.build.json',
      'check': 'tsc -p ./tsconfig.check.json',
      'lint': 'eslint --max-warnings=0 .',
      'format': 'prettier --check .',
      'check-lint-format': 'pnpm check && pnpm lint && pnpm format',
      'test': testScript,
    },
    devDependencies: {},
    engines: {
      node: `>=${options.minNodeVersion}`,
      pnpm: `>=${options.minPnpmVersion}`,
    },
    packageManager: `pnpm@${options.pnpmVersion}`,
    keywords: [],
  };

  const devDependencies = [...options.devDependencies].sort((a, b) => a[0].localeCompare(b[0]));

  for (const [name, version] of devDependencies) {
    config.devDependencies[name] = version;
  }

  if (options.features.includes('lint-staged')) {
    config.scripts['prepare'] = 'npx simple-git-hooks';
  }

  if (options.features.includes('release')) {
    config.scripts['release'] = 'semantic-release --branches main';
  }

  return config;
}
