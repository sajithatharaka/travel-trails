// verify_jwt = true. Called by submit-booking / submit-contact (service-role
// bearer) for new_booking / new_inquiry, and by the admin (admin JWT) for
// booking_status_changed. Reads active recipients, sends one Resend email,
// and records the dispatch (dedupe_key makes retries idempotent).
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildBookingHtml, buildInquiryHtml } from "./template.ts";
import {
  isUuid,
  dedupeKeyFor,
  subjectFor,
  type NotifyEvent as NotifyBody,
} from "../_shared/pure.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

async function sendResend(args: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
}) {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: args.from,
      to: args.to,
      subject: args.subject,
      html: args.html,
    }),
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(
      (body as { message?: string }).message ?? "Resend send failed",
    );
  }
  return body;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: NotifyBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!body?.event_type) return json({ error: "event_type is required" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const from = Deno.env.get("NOTIFICATION_FROM_EMAIL") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Supabase service env vars missing" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  if (body.event_type === "new_booking" && !isUuid(body.booking_id ?? "")) {
    return json({ error: "booking_id must be a UUID" }, 400);
  }
  if (
    body.event_type === "new_inquiry" &&
    !isUuid(body.contact_submission_id ?? "")
  ) {
    return json({ error: "contact_submission_id must be a UUID" }, 400);
  }

  if (body.event_type === "booking_status_changed") {
    if (!isUuid(body.booking_id ?? "")) {
      return json({ error: "booking_id must be a UUID" }, 400);
    }
    if (!["confirmed", "cancelled"].includes(body.status)) {
      return json({ error: "status must be confirmed or cancelled" }, 400);
    }
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const asCaller = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
      error: authErr,
    } = await asCaller.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);
    // Any signed-in team member may trigger a status-change email.
  }

  const dedupeKey = dedupeKeyFor(body);

  // Missing email config would otherwise fail silently: the submit-* functions
  // call this best-effort and never surface a 500. Record it as a failed
  // dispatch so /admin sees why no email went out.
  if (!resendApiKey || !from) {
    const reason =
      "RESEND_API_KEY or NOTIFICATION_FROM_EMAIL is not configured";
    await admin.from("notification_dispatch_logs").upsert(
      {
        dedupe_key: dedupeKey,
        event_type: body.event_type,
        status: "failed",
        details: { error: reason, reason: "missing_email_config" },
      },
      { onConflict: "dedupe_key" },
    );
    return json({ error: reason }, 500);
  }

  const { data: existing } = await admin
    .from("notification_dispatch_logs")
    .select("id, status")
    .eq("dedupe_key", dedupeKey)
    .maybeSingle();
  if (existing?.status === "sent") {
    return json({ success: true, deduped: true });
  }

  const { data: recipients, error: recErr } = await admin
    .from("notification_recipients")
    .select("email")
    .eq("is_active", true);
  if (recErr) return json({ error: recErr.message }, 500);

  const to = ((recipients ?? []) as { email: string }[])
    .map((r) => r.email?.trim())
    .filter((v): v is string => Boolean(v));

  if (to.length === 0) {
    await admin.from("notification_dispatch_logs").upsert(
      {
        dedupe_key: dedupeKey,
        event_type: body.event_type,
        status: "skipped",
        details: { reason: "no_active_recipients" },
      },
      { onConflict: "dedupe_key" },
    );
    return json({ success: true, skipped: true });
  }

  let subject = subjectFor(body);
  let html = "";

  if (
    body.event_type === "new_booking" ||
    body.event_type === "booking_status_changed"
  ) {
    const { data: booking, error } = await admin
      .from("booking_requests")
      .select(
        "id, first_name, last_name, email, phone, tour_title, tour_slug, travel_date, travellers, adults, children, message, status",
      )
      .eq("id", body.booking_id)
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!booking) return json({ error: "Booking request not found" }, 404);

    const heading =
      body.event_type === "booking_status_changed"
        ? `Booking request ${body.status}`
        : "New tour enquiry";
    if (body.event_type === "booking_status_changed") {
      subject = `Booking request ${body.status} — Travel Trails`;
    }
    html = buildBookingHtml(booking as Record<string, unknown>, heading);
  }

  if (body.event_type === "new_inquiry") {
    const { data: inquiry, error } = await admin
      .from("contact_submissions")
      .select("id, name, email, phone, subject, message")
      .eq("id", body.contact_submission_id)
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!inquiry) return json({ error: "Inquiry not found" }, 404);
    html = buildInquiryHtml(inquiry as Record<string, unknown>);
  }

  try {
    const resend = await sendResend({ apiKey: resendApiKey, from, to, subject, html });
    await admin.from("notification_dispatch_logs").upsert(
      {
        dedupe_key: dedupeKey,
        event_type: body.event_type,
        status: "sent",
        details: { recipient_count: to.length, resend },
      },
      { onConflict: "dedupe_key" },
    );
    return json({ success: true, recipient_count: to.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "send failed";
    await admin.from("notification_dispatch_logs").upsert(
      {
        dedupe_key: dedupeKey,
        event_type: body.event_type,
        status: "failed",
        details: { error: message },
      },
      { onConflict: "dedupe_key" },
    );
    return json({ error: message }, 502);
  }
});
