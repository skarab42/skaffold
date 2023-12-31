/* eslint-disable no-console */
import { createConfig, validateConfig } from './config/index.js';
import { failure, isFailure, type Result, success, unwrap } from './result.js';

export type SkaffoldOptions = {
  projectName?: string | undefined;
  projectPath?: string | undefined;
};

export function skaffold(options: SkaffoldOptions = {}): Result<true, string[]> {
  const configResult = validateConfig(createConfig(options));

  if (isFailure(configResult)) {
    return failure(unwrap(configResult));
  }

  const config = unwrap(configResult);

  console.log('>>> config:', config);

  return success(true);
}
