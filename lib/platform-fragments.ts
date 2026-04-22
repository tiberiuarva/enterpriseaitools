function normalizePlatformFragment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getPlatformFragmentId(value: string) {
  const fragmentId = normalizePlatformFragment(value);

  if (!fragmentId) {
    throw new Error(`Platform id must resolve to a non-empty fragment: ${JSON.stringify(value)}`);
  }

  return fragmentId;
}

export function assertUniquePlatformFragmentIds(values: string[]) {
  const seen = new Set<string>();

  values.forEach((value) => {
    const fragmentId = getPlatformFragmentId(value);

    if (seen.has(fragmentId)) {
      throw new Error(`Duplicate platform fragment id generated: ${fragmentId}`);
    }

    seen.add(fragmentId);
  });
}
