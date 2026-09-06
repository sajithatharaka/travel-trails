// Public (verify_jwt = false). Verifies a Cloudflare Turnstile token, then
// writes a booking_requests row with the service role and fires the admin
// notification. This is the only insert path — RLS has no public insert policy.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS,
  jsonResponse,
  verifyTurnstile,
  invokeNotify,
} from "../_shared/turnstile.ts";

interface BookingPayload {
  turnstileToken?: string;
  tour_id?: string | null;
  tour_slug?: string | null;
  tour_title?: string | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  travel_date?: string | null;
  travellers?: number | null;
  adults?: number;
  children?: number;
  message?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  let payload: BookingPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Bad request" }, 400);
  }

  const {
    turnstileToken,
    tour_id,
    tour_slug,
    tour_title,
    first_name,
    last_name,
    email,
    phone,
    travel_date,
    travellers,
    adults,
    children,
    message,
  } = payload;

  if (!turnstileToken) {
    return jsonResponse({ error: "Missing verification token" }, 400);
  }
  if (!first_name || !email) {
    return jsonResponse({ error: "first_name and email are required" }, 400);
  }
  // A travel date is optional, but when given it must be a real future date
  // (strictly after today, UTC). Mirrors `isFutureTravelDate` in
  // `src/lib/travelDate.ts`.
  if (travel_date != null && travel_date !== "") {
    const todayUtc = new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(travel_date) || travel_date <= todayUtc) {
      return jsonResponse({ error: "travel_date must be in the future" }, 400);
    }
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
  const { error } = await admin.from("booking_requests").insert({
    id,
    tour_id: tour_id || null,
    tour_slug: tour_slug || null,
    tour_title: tour_title || null,
    first_name,
    last_name: last_name ?? "",
    email,
    phone: phone || null,
    travel_date: travel_date || null,
    travellers: travellers ?? null,
    adults: adults ?? 1,
    children: children ?? 0,
    message: message || null,
    status: "pending",
  });
  if (error) return jsonResponse({ error: error.message }, 500);

  await invokeNotify({ event_type: "new_booking", booking_id: id });

  return jsonResponse({ success: true, id });
});
