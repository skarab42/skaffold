import fs from 'fs-extra';

export type RequiredStrict<T> = { [P in keyof T]-?: Exclude<T[P], undefined> };

export function randomShortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function randomProjectName(): string {
  return `my-project-${randomShortId()}`;
}

export function isDirectoryEmpty(path: string): boolean {
  let directory: fs.Dir | undefined;
  try {
    directory = fs.opendirSync(path);
    return directory.readSync() === null;
  } catch {
    return false;
  } finally {
    void directory?.close();
  }
}
