import fs from 'fs-extra';

import { type SkaffoldConfig } from './config/index.js';
import { PackageJsonFactory } from './package-json.js';
import { type Result, success } from './result.js';

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
  packageJsonFactory.set('types', './output/index.d.ts');

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
    'check': 'tsc -p ./tsconfig.json',
    'build': 'rimraf ./output && tsc -p ./tsconfig.build.json',
    'build:watch': 'pnpm build --watch',
  });

  packageJsonFactory.set('devDependencies', {
    '@skarab/eslint-config': '^4.1.0',
    '@skarab/prettier-config': '^1.2.2',
    '@skarab/typescript-config': '^3.1.0',
    'eslint': '^8.56.0',
    'lint-staged': '^15.2.0',
    'prettier': '^3.1.1',
    'rimraf': '^5.0.5',
    'simple-git-hooks': '^2.9.0',
    'typescript': '^5.3.3',
  });

  packageJsonFactory.write();

  return success(true);
}
