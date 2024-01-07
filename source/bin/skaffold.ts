/* eslint-disable no-console */
import { isFailure, skaffold, type SkaffoldConfig, unwrap } from '../lib/index.js';

const config: SkaffoldConfig = {
  outputDirectory: './@skarab/life',
  project: {
    name: '@skarab/life',
    namespace: '@skarab',
    identifier: 'life',
  },
  user: {
    name: 'skarab42',
    email: 'contact@skarab42.dev',
  },
  type: 'module',
  features: ['bin', 'test', 'coverage', 'release'],
  nodeVersions: ['18', '20'],
  pnpmVersion: '8.13.1',
  overwrite: false,
};

const result = await skaffold(config);

if (isFailure(result)) {
  console.error('error:', unwrap(result));
} else {
  console.log('info: Done!');
}
