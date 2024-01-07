import { execa } from 'execa';
import { parse, type SemVer } from 'semver';

export async function getBinVersion(bin: string): Promise<string | undefined> {
  try {
    const { stdout } = await execa(bin, ['--version']);
    return stdout;
  } catch {
    return;
  }
}

export async function getBinSemVersion(bin: string): Promise<SemVer | undefined> {
  let version = await getBinVersion(bin);

  if (!version) {
    return;
  }

  version = version.replace('git version ', '');

  return parse(version) ?? undefined;
}

export async function hasBin(bin: string): Promise<boolean> {
  return Boolean(await getBinVersion(bin));
}
