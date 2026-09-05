/** "from $980" for a tour's price, or null when there's no price. */
export function formatPriceFrom(
  usd: number | null | undefined,
): string | null {
  if (usd == null || Number.isNaN(usd)) return null;
  return `from $${Math.round(usd).toLocaleString("en-US")}`;
}

/** Merge stored site-settings strings over the config-derived defaults. */
export function mergeSettings<T extends Record<string, string>>(
  defaults: T,
  raw: Partial<Record<string, unknown>>,
): T {
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const v = raw[key as string];
    if (typeof v === "string" && v.trim()) merged[key] = v as T[keyof T];
  }
  return merged;
}
