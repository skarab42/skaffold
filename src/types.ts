import type { SemVer } from 'semver';

export interface NPMUser {
  name: string;
}

export interface GITUser {
  name: string;
  email: string;
}

export interface Options {
  packageName: string;
  packageVersion?: string;
  description?: string;
  npmUser: NPMUser;
  gitUser: GITUser;
  nodeVersion: SemVer;
  pnpmVersion: SemVer;
}
