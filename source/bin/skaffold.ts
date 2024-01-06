import { skaffold, type SkaffoldConfig } from '../lib/index.js';

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
};

await skaffold(config);
