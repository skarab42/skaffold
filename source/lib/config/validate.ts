import fs from 'node:fs';

import validateNpmPackageName from 'validate-npm-package-name';

import { failure, isFailure, type Result, success, unwrap } from '../result.js';
import { isDirectoryEmpty } from '../utils.js';
import type { SkaffoldConfig } from './create.js';

export function validateProjectName(projectName: string): Result<string, string[]> {
  const errors: string[] = [];

  const { validForNewPackages, errors: packageNameErrors } = validateNpmPackageName(projectName);

  if (validForNewPackages === false) {
    errors.push(`Invalid project name '${projectName}'.`);

    if (packageNameErrors !== undefined && packageNameErrors.length > 0) {
      errors.push(...packageNameErrors.map((error) => ` - Project ${error}.`));
    }
  }

  return errors.length > 0 ? failure(errors) : success(projectName);
}

export function validateProjectPath(projectPath: string): Result<string, string[]> {
  const errors: string[] = [];

  if (fs.existsSync(projectPath) === true && isDirectoryEmpty(projectPath) === false) {
    errors.push(
      `The project path '${projectPath}' already exists and is not an empty directory.`,
      ` - You can choose another project name/path or you can rename/move/delete the destination directory.`,
    );
  }

  return errors.length > 0 ? failure(errors) : success(projectPath);
}

export function validateConfig(config: SkaffoldConfig): Result<SkaffoldConfig, string[]> {
  const errors: string[] = [];

  const projectNameResult = validateProjectName(config.projectName);
  const projectPathResult = validateProjectPath(config.projectPath);

  if (isFailure(projectNameResult)) {
    errors.push(...unwrap(projectNameResult));
  }

  if (isFailure(projectPathResult)) {
    errors.push(...unwrap(projectPathResult));
  }

  return errors.length > 0 ? failure(errors) : success(config);
}
