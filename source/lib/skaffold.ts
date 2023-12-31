import { build } from './build.js';
import { createConfig, type SkaffoldConfig, validateConfig } from './config/index.js';
import { type PackageJson } from './package-json.js';
import { failure, isFailure, type Result, success, unwrap } from './result.js';

export type SkaffoldOptions = {
  overwrite?: boolean | undefined;
  projectName?: string | undefined;
  projectPath?: string | undefined;
  description?: string | undefined;
  license?: string | undefined;
  author?: PackageJson['author'] | undefined;
  funding?: string | undefined;
  homepage?: string | undefined;
  repository?: string | undefined;
  bugs?: string | undefined;
  type?: 'module' | 'commonjs' | undefined;
};

export type SkaffoldSuccess = {
  config: SkaffoldConfig;
  build: () => Result<boolean, string[]>;
};

export type SkaffoldResult = Result<SkaffoldSuccess, string[]>;

export async function skaffold(options: SkaffoldOptions = {}): Promise<SkaffoldResult> {
  const configResult = validateConfig(await createConfig(options));

  if (isFailure(configResult)) {
    return failure(unwrap(configResult));
  }

  const config = unwrap(configResult);

  return success({
    config,
    build: () => {
      const buildResult = build(config);

      if (isFailure(buildResult)) {
        return failure(unwrap(buildResult));
      }

      return success(true);
    },
  });
}
