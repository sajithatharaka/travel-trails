// src/lib/turnstile.ts
// ------------------------------------------------------------
// Single source of truth for the Cloudflare Turnstile site key.
//
// The `.env.example` stand-in (`0x<site-key>`) is a truthy string, so a
// naive `Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)` check treats
// an unconfigured local environment as "Turnstile is on" and mounts the
// widget. Cloudflare then rejects the bogus key inside `turnstile.render()`;
// on a client-side navigation that throw reaches the route error boundary
// and blanks the page (looks like a 404 when you arrive via a `/#faq`
// style menu link). Treat any placeholder-shaped value as "not configured".
// ------------------------------------------------------------

const raw = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

const isPlaceholder =
  !raw || raw.length < 8 || raw.includes("<") || raw.includes(">");

/** The site key to hand to Cloudflare, or `undefined` when unconfigured. */
export const TURNSTILE_SITE_KEY = isPlaceholder ? undefined : raw;

/** Whether a real Turnstile site key is configured. */
export const HAS_TURNSTILE = Boolean(TURNSTILE_SITE_KEY);
