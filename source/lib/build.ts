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
  packageJsonFactory.set('author', config.author);

  packageJsonFactory.write();

  return success(true);
}
