import fs from 'fs-extra';

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
