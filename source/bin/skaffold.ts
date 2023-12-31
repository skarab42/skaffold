/* eslint-disable unicorn/no-process-exit */
/* eslint-disable n/no-process-exit */
/* eslint-disable no-console */
import { isFailure, unwrap } from '../lib/result.js';
import { skaffold } from '../lib/skaffold.js';

const overwrite = true;
const projectName = '@prout/in-the-wild';
const projectPath = `.skaffolded/${projectName}`;

const skaffoldResult = await skaffold({ overwrite, projectName, projectPath });

if (isFailure(skaffoldResult)) {
  const errors = unwrap(skaffoldResult);
  console.error('> error:', errors);
  process.exit(1);
}

const { config, build } = unwrap(skaffoldResult);

console.log('> build:', config);

build();

console.log('> Done!');
