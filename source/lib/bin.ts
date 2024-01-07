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

export async function runBin(file: string, argv: string[], path: string, verbose = false): Promise<void> {
  verbose && process.stdout.write(`run: ${file} ${argv.join(' ')}\n`);

  const childProcess = execa(file, argv, { cwd: path });

  verbose && childProcess.stdout?.pipe(process.stdout);

  await childProcess;
}
