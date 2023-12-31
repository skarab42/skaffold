/* eslint-disable unicorn/no-process-exit */
/* eslint-disable n/no-process-exit */
/* eslint-disable no-console */
import { isFailure, unwrap } from '../lib/result.js';
import { skaffold } from '../lib/skaffold.js';

const skaffoldResult = await skaffold({
  overwrite: true,
  projectName: '@prout/in-the-wild',
  projectPath: `.skaffolded/@prout/in-the-wild`,
  funding: 'https://github.com/sponsors/skarab42',
  homepage: 'https://github.com/skarab42/skaffold',
  repository: 'https://github.com/skarab42/skaffold',
  bugs: 'https://github.com/skarab42/skaffold/issues',
});

if (isFailure(skaffoldResult)) {
  const errors = unwrap(skaffoldResult);
  console.error('> error:', errors);
  process.exit(1);
}

const { config, build } = unwrap(skaffoldResult);

console.log('> build:', config);

build();

console.log('> Done!');
