export function normalizeName(raw: string): { display: string; norm: string } {
  const display = raw.trim().replaceAll(/\s+/g, " ");
  const norm = display.toLocaleLowerCase();
  return { display, norm };
}

export function normalizeTitle(raw: string): { display: string; norm: string } {
  const display = raw.trim().replaceAll(/\s+/g, " ");
  const norm = display.toLocaleLowerCase();
  return { display, norm };
}
