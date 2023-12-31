/* eslint-disable no-console */
import { isFailure, unwrap } from '../lib/result.js';
import { skaffold } from '../lib/skaffold.js';

const overwrite = true;
const projectName = 'prout';
const projectPath = '@prout/test';

const result = skaffold({ overwrite, projectName, projectPath });

if (isFailure(result)) {
  const errors = unwrap(result);
  console.error('> error:', errors);
  process.exitCode = 1;
} else {
  console.log('> Done!');
}
