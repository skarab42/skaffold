import path from 'node:path';
import url from 'node:url';

export function metaDirname(meta: ImportMeta): string {
  return path.dirname(url.fileURLToPath(meta.url));
}

export function metaFilename(meta: ImportMeta): string {
  return path.basename(url.fileURLToPath(meta.url));
}
