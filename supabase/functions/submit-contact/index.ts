// Public (verify_jwt = false). Turnstile-verified contact form -> contact_submissions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS,
  jsonResponse,
  verifyTurnstile,
  invokeNotify,
} from "../_shared/turnstile.ts";

interface ContactPayload {
  turnstileToken?: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  let payload: ContactPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Bad request" }, 400);
  }

  const { turnstileToken, name, email, phone, subject, message } = payload;
  if (!turnstileToken) {
    return jsonResponse({ error: "Missing verification token" }, 400);
  }
  if (!name || !email || !message) {
    return jsonResponse({ error: "name, email and message are required" }, 400);
  }

  const verified = await verifyTurnstile(
    turnstileToken,
    req.headers.get("x-forwarded-for"),
  );
  if (!verified) return jsonResponse({ error: "Verification failed" }, 403);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const id = crypto.randomUUID();
  const { error } = await admin.from("contact_submissions").insert({
    id,
    name,
    email,
    phone: phone || null,
    subject: subject || "General Enquiry",
    message,
  });
  if (error) return jsonResponse({ error: error.message }, 500);

  await invokeNotify({ event_type: "new_inquiry", contact_submission_id: id });

  return jsonResponse({ success: true, id });
});
