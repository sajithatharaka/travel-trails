// src/lib/edgeFunctionError.ts
// ------------------------------------------------------------
// Turns a Supabase `functions.invoke` result into a message a visitor can
// actually read.
//
// When an edge function replies with a non-2xx status, supabase-js resolves
// with `data: null` and `error` as a `FunctionsHttpError` whose `.message` is
// the fixed string "Edge Function returned a non-2xx status code". The real
// `{ error: "..." }` JSON body is only reachable through `error.context`
// (a `Response`). Rendering `error.message` directly leaks that internal
// wording to the user; a transport failure ("Failed to fetch") is just as
// unhelpful. This resolver reads the function body when it can, maps the few
// known server strings to friendly copy, and otherwise returns the caller's
// generic fallback.
// ------------------------------------------------------------

interface InvokeResult {
  data: unknown;
  error: unknown;
}

/** Friendly copy for the verification / validation strings the forms' edge
 *  functions can return. Anything not listed falls back to the generic message. */
const FRIENDLY_BY_SERVER_MESSAGE: Record<string, string> = {
  "Missing verification token":
    "Please complete the verification challenge and try again.",
  "Verification failed":
    "We couldn't verify that you're human. Please refresh the page and try again.",
  "Bad request": "Please check the details you entered and try again.",
  "travel_date must be in the future":
    "Please choose a travel date in the future.",
  "first_name and email are required":
    "Please enter your name and email, then try again.",
  "name, email and message are required":
    "Please fill in your name, email and message, then try again.",
};

function friendlyFor(serverMessage: string, fallback: string): string {
  const trimmed = serverMessage.trim();
  return FRIENDLY_BY_SERVER_MESSAGE[trimmed] ?? fallback;
}

function hasResponseBody(context: unknown): context is Response {
  return (
    typeof context === "object" &&
    context !== null &&
    typeof (context as Response).json === "function"
  );
}

/**
 * Resolve a user-facing error string from an `invoke` result, or `null` when
 * the call succeeded.
 *
 * @param result   the `{ data, error }` returned by `supabase.functions.invoke`
 * @param fallback  shown for transport failures and any unrecognised server error
 */
export async function resolveEdgeFunctionError(
  result: InvokeResult,
  fallback: string,
): Promise<string | null> {
  const { data, error } = result;

  // Happy path: some functions return `{ error }` in a 200 body.
  const bodyError = (data as { error?: string } | null)?.error;
  if (bodyError) return friendlyFor(bodyError, fallback);

  if (!error) return null;

  // Non-2xx: the useful message is in the Response attached as `error.context`.
  const context = (error as { context?: unknown }).context;
  if (hasResponseBody(context)) {
    try {
      const parsed = (await context.clone().json()) as { error?: string };
      if (parsed?.error) return friendlyFor(parsed.error, fallback);
    } catch {
      // fall through to the generic fallback
    }
  }

  return fallback;
}
