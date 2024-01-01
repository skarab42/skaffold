import fs from 'fs-extra';

import { type SkaffoldConfig } from './config/index.js';
import { PackageJsonFactory } from './package-json.js';
import { type Result, success } from './result.js';

function optional<Value extends object>(condition: boolean, returnValue: Value): Value | undefined {
  return condition ? returnValue : undefined;
}

export function build(config: SkaffoldConfig): Result<true, string[]> {
  if (config.overwrite) {
    fs.emptyDirSync(config.projectPath);
  }

  const packageJsonFactory = new PackageJsonFactory(config.projectPath);

  packageJsonFactory.set('name', config.projectName);
  packageJsonFactory.set('description', config.description);
  packageJsonFactory.set('version', '0.0.0-development');
  packageJsonFactory.set('license', config.license);
  packageJsonFactory.set('author', config.author);

  config.funding && packageJsonFactory.set('funding', config.funding);
  config.homepage && packageJsonFactory.set('homepage', config.homepage);
  config.repository && packageJsonFactory.set('repository', config.repository);
  config.bugs && packageJsonFactory.set('bugs', config.bugs);

  packageJsonFactory.set('type', config.type);
  packageJsonFactory.set('module', './output/index.js');
  config.ts && packageJsonFactory.set('types', './output/index.d.ts');

  packageJsonFactory.set('private', true);
  packageJsonFactory.set('publishConfig', { access: 'restricted' });
  packageJsonFactory.set('files', ['./output']);
  packageJsonFactory.set('keywords', ['skaffold']);

  packageJsonFactory.set('scripts', {
    'prepare': 'npx simple-git-hooks',
    'lint': 'eslint . --max-warnings=0',
    'lint:fix': 'pnpm lint --fix',
    'format': 'prettier **/* --ignore-unknown',
    'format:write': 'pnpm format --write',
    ...optional(config.ts, {
      'check': 'tsc -p ./tsconfig.json',
      'build': 'rimraf ./output && tsc -p ./tsconfig.build.json',
      'build:watch': 'pnpm build --watch',
    }),
  });

  packageJsonFactory.set('devDependencies', {
    '@skarab/eslint-config': '^4.1.0',
    '@skarab/prettier-config': '^1.2.2',
    'eslint': '^8.56.0',
    'lint-staged': '^15.2.0',
    'prettier': '^3.1.1',
    'rimraf': '^5.0.5',
    'simple-git-hooks': '^2.9.0',
    ...optional(config.ts, {
      'typescript': '^5.3.3',
      '@skarab/typescript-config': '^3.1.0',
    }),
  });

  packageJsonFactory.set('packageManager', `pnpm@${config.versions.pnpm}`);
  packageJsonFactory.set('engines', {
    node: `>=${config.versions.node}`,
    pnpm: `>=${config.versions.pnpm}`,
  });

  packageJsonFactory.set('prettier', '@skarab/prettier-config');
  packageJsonFactory.set('eslintConfig', { extends: '@skarab/eslint-config/recommended' });
  packageJsonFactory.set('simple-git-hooks', { 'pre-commit': 'pnpm lint-staged' });
  packageJsonFactory.set('lint-staged', {
    '*': ['pnpm eslint-staged --fix --max-warnings=0', 'pnpm prettier --write --ignore-unknown'],
  });

  packageJsonFactory.write();

  return success(true);
}
