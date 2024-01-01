import fs from 'fs-extra';

import { type SkaffoldConfig } from './config/index.js';
import { conditional, PackageJsonFactory } from './package-json.js';
import { type Result, success } from './result.js';

export function build(config: SkaffoldConfig): Result<true, string[]> {
  if (config.overwrite) {
    fs.emptyDirSync(config.projectPath);
  }

  createPackageJson(config);

  return success(true);
}

function createPackageJson(config: SkaffoldConfig): void {
  const json = new PackageJsonFactory(config.projectPath);

  json.set('name', config.projectName);
  json.set('description', config.description);
  json.set('version', '0.0.0-development');
  json.set('license', config.license);
  json.set('author', config.author);

  json.optional('funding', config.funding);
  json.optional('homepage', config.homepage);
  json.optional('repository', config.repository);
  json.optional('bugs', config.bugs);

  json.set('type', config.type);
  json.set('module', './output/index.js');
  json.conditional(config.ts, 'types', './output/index.d.ts');

  json.set('private', true);
  json.set('publishConfig', { access: 'restricted' });
  json.set('files', ['./output']);
  json.set('keywords', ['skaffold']);

  json.set('scripts', {
    'prepare': 'npx simple-git-hooks',
    'lint': 'eslint . --max-warnings=0',
    'lint:fix': 'pnpm lint --fix',
    'format': 'prettier **/* --ignore-unknown',
    'format:write': 'pnpm format --write',
    ...conditional(config.ts, {
      'check': 'tsc -p ./tsconfig.json',
      'build': 'rimraf ./output && tsc -p ./tsconfig.build.json',
      'build:watch': 'pnpm build --watch',
    }),
  });

  json.set('devDependencies', {
    '@skarab/eslint-config': '^4.1.0',
    '@skarab/prettier-config': '^1.2.2',
    'eslint': '^8.56.0',
    'lint-staged': '^15.2.0',
    'prettier': '^3.1.1',
    'rimraf': '^5.0.5',
    'simple-git-hooks': '^2.9.0',
    ...conditional(config.ts, {
      'typescript': '^5.3.3',
      '@skarab/typescript-config': '^3.1.0',
    }),
  });

  json.set('packageManager', `pnpm@${config.versions.pnpm}`);
  json.set('engines', {
    node: `>=${config.versions.node}`,
    pnpm: `>=${config.versions.pnpm}`,
  });

  json.set('prettier', '@skarab/prettier-config');
  json.set('eslintConfig', { extends: '@skarab/eslint-config/recommended' });
  json.set('simple-git-hooks', { 'pre-commit': 'pnpm lint-staged' });
  json.set('lint-staged', {
    '*': ['pnpm eslint-staged --fix --max-warnings=0', 'pnpm prettier --write --ignore-unknown'],
  });

  json.write();
}
