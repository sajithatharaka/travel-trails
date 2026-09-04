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
 * Verify a Cloudflare Turnstile token server-side. Fail-closed: if the secret
 * isn't configured, verification fails.
 */
export async function verifyTurnstile(
  token: string,
  remoteip: string | null,
): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";
  if (!secret) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
  );
  const result = await res.json().catch(() => ({ success: false }));
  return result.success === true;
}

/**
 * Fire the notify-admin-events function server-to-server using the service role
 * key as the bearer (that function has verify_jwt = true). Best-effort: a
 * failure here never blocks the form submission.
 */
export async function invokeNotify(body: Record<string, unknown>): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) return;
  try {
    await fetch(`${url}/functions/v1/notify-admin-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("invokeNotify failed:", e);
  }
}
