/** Alineado con RachasBack `semver.util.ts` (compararSemver). */
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const parse = (version: string) =>
    version
      .trim()
      .replace(/^v/i, '')
      .split('.')
      .map((part) => Number.parseInt(part, 10) || 0);

  const av = parse(a);
  const bv = parse(b);
  const len = Math.max(av.length, bv.length, 3);

  for (let i = 0; i < len; i += 1) {
    const diff = (av[i] ?? 0) - (bv[i] ?? 0);
    if (diff !== 0) {
      return diff < 0 ? -1 : 1;
    }
  }
  return 0;
}

export function isVersionLessThan(appVersion: string, other: string): boolean {
  return compareSemver(appVersion, other) < 0;
}
