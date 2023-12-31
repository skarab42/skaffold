/* eslint-disable no-console */
import { isFailure, unwrap } from '../lib/result.js';
import { skaffold } from '../lib/skaffold.js';

const projectName = undefined;
const projectPath = undefined;

const result = skaffold({ projectName, projectPath });

if (isFailure(result)) {
  const errors = unwrap(result);
  console.error('> error:', errors);
  process.exitCode = 1;
} else {
  console.log('> Done!');
}
