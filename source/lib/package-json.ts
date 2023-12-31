import path from 'node:path';

import fs from 'fs-extra';

type Author =
  | string
  | {
      name?: string | undefined;
      email?: string | undefined;
    };

export type PackageJson = {
  name?: string;
  author?: Author;
};

export type PackageJsonRootKey = keyof PackageJson;

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

  write(): void {
    fs.outputJSONSync(this.#outputPath, this.#outputJson, { spaces: 2 });
  }
}
