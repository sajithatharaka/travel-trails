export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

/**
 * The Cloudflare-assigned action the widget renders with. Must match
 * `TURNSTILE_ACTION` in `src/lib/turnstile.ts`.
 */
const TURNSTILE_ACTION = "travel-trails-form";

/** Loopback hosts `siteverify` reports for a challenge solved on a dev machine. */
const LOCALHOST_HOSTNAMES = ["localhost", "127.0.0.1", "::1"];

/**
 * Hostnames the `siteverify` response is allowed to report. The production set
 * comes from the comma-separated `TURNSTILE_ALLOWED_HOSTNAMES` secret and must
 * never list `localhost`. For local development set `TURNSTILE_ALLOW_LOCALHOST=true`
 * instead — it adds the loopback hosts to the allowlist so a dev machine passes
 * without weakening the production allowlist. Never enable it in production.
 */
function allowedHostnames(): Set<string> {
  const hosts = (Deno.env.get("TURNSTILE_ALLOWED_HOSTNAMES") ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  if (Deno.env.get("TURNSTILE_ALLOW_LOCALHOST") === "true") {
    hosts.push(...LOCALHOST_HOSTNAMES);
  }
  return new Set(hosts);
}

interface SiteverifyResult {
  success?: boolean;
  action?: string;
  hostname?: string;
}

/**
 * Verify a Cloudflare Turnstile token server-side. Fail-closed: rejects unless
 * the secret is configured, the token is well-formed, and the `siteverify`
 * response reports all three of `success` / the expected `action` / a hostname
 * on the allowlist (`TURNSTILE_ALLOWED_HOSTNAMES`, plus the loopback hosts when
 * `TURNSTILE_ALLOW_LOCALHOST=true` for local dev) — Cloudflare's own guidance.
 */
export async function verifyTurnstile(
  token: string,
  remoteip: string | null,
): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";
  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY is not set — rejecting");
    return false;
  }

  const hostnames = allowedHostnames();
  if (hostnames.size === 0) {
    console.warn(
      "[turnstile] no hostname allowlist — set TURNSTILE_ALLOWED_HOSTNAMES " +
        "(or TURNSTILE_ALLOW_LOCALHOST=true for local dev) — rejecting",
    );
    return false;
  }
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    console.warn(
      `[turnstile] malformed token (length ${
        typeof token === "string" ? token.length : "n/a"
      }) — rejecting`,
    );
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);

  let result: SiteverifyResult & { "error-codes"?: string[] };
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) {
      console.warn(`[turnstile] siteverify HTTP ${res.status} — rejecting`);
      return false;
    }
    result = await res.json();
  } catch (e) {
    console.warn("[turnstile] siteverify request failed — rejecting:", e);
    return false;
  }

  if (result.success !== true) {
    console.warn(
      "[turnstile] siteverify success=false, error-codes:",
      result["error-codes"] ?? [],
    );
    return false;
  }
  if (result.action !== TURNSTILE_ACTION) {
    console.warn(
      `[turnstile] action mismatch: got ${JSON.stringify(
        result.action,
      )}, expected ${JSON.stringify(TURNSTILE_ACTION)} — rejecting`,
    );
    return false;
  }
  if (
    typeof result.hostname !== "string" ||
    !hostnames.has(result.hostname)
  ) {
    console.warn(
      `[turnstile] hostname ${JSON.stringify(
        result.hostname,
      )} not in allowlist [${[...hostnames].join(", ")}] — rejecting`,
    );
    return false;
  }
  return true;
}

/**
 * Fire the notify-admin-events function server-to-server using the service role
 * key as the bearer (that function has verify_jwt = true). Best-effort: a
 * failure here never blocks the form submission, but every failure mode is
 * logged with an `[invokeNotify]` prefix so a silently missing email can be
 * traced from the submit-* function logs.
 */
export async function invokeNotify(body: Record<string, unknown>): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) {
    console.error(
      "[invokeNotify] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — " +
        "admin notification not sent",
    );
    return;
  }
  try {
    const res = await fetch(`${url}/functions/v1/notify-admin-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `[invokeNotify] notify-admin-events returned HTTP ${res.status}: ` +
          detail.slice(0, 500),
      );
    }
  } catch (e) {
    console.error("[invokeNotify] request failed:", e);
  }
}
