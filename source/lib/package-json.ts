import path from 'node:path';

import fs from 'fs-extra';

type Author =
  | string
  | {
      name?: string | undefined;
      email?: string | undefined;
    };

export type PackageJson = {
  'name'?: string;
  'author'?: Author;
  'version'?: string;
  'description'?: string;
  'license'?: string;
  'funding'?: string;
  'homepage'?: string;
  'repository'?: string;
  'bugs'?: string;
  'type'?: 'module' | 'commonjs';
  'module'?: string;
  'types'?: string;
  'private'?: boolean;
  'publishConfig'?: {
    access: 'public' | 'restricted';
  };
  'files'?: string[];
  'keywords'?: string[] | undefined;
  'scripts'?: Record<string, string>;
  'dependencies'?: Record<string, string>;
  'devDependencies'?: Record<string, string>;
  'engines'?: Record<string, string>;
  'packageManager'?: string;
  'prettier'?: string;
  'eslintConfig'?: Record<string, string>;
  'lint-staged'?: Record<string, string[]>;
  'simple-git-hooks'?: Record<string, string>;
};

export type PackageJsonRootKey = keyof PackageJson;

export function conditional<Value extends object>(condition: boolean, returnValue: Value): Value | undefined {
  return condition ? returnValue : undefined;
}

export class PackageJsonFactory {
  #outputJson: PackageJson;
  #outputPath: string;

  constructor(outputPath: string) {
    this.#outputJson = {};
    this.#outputPath = path.join(outputPath, 'package.json');
  }

  set<Key extends PackageJsonRootKey>(key: Key, value: PackageJson[Key]): void {
    this.#outputJson[key] = value;
  }

  optional<Key extends PackageJsonRootKey>(key: Key, value: PackageJson[Key]): void {
    value && this.set(key, value);
  }

  conditional<Key extends PackageJsonRootKey>(condition: unknown, key: Key, value: PackageJson[Key]): void {
    condition && this.set(key, value);
  }

  write(): void {
    fs.outputJSONSync(this.#outputPath, this.#outputJson, { spaces: 2 });
  }
}
