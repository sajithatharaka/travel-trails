import { createClient } from "@/lib/supabase/client";
import type { BookingStatus } from "@/lib/supabase/database.types";

/**
 * Notify admin recipients that a booking request changed status. Runs from the
 * admin UI with the signed-in user's access token. Best-effort — the caller
 * surfaces failures but the status change itself has already been saved.
 */
export async function notifyBookingStatusChange(
  bookingId: string,
  status: Extract<BookingStatus, "confirmed" | "cancelled">,
): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data, error } = await supabase.functions.invoke("notify-admin-events", {
    body: {
      event_type: "booking_status_changed",
      booking_id: bookingId,
      status,
    },
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined,
  });

  const fnError = (data as { error?: string } | null)?.error;
  if (error || fnError) {
    throw new Error(fnError || error?.message || "Notification failed");
  }
}

export function shouldNotifyStatusChange(
  prev: string,
  next: string,
): next is "confirmed" | "cancelled" {
  return prev !== next && (next === "confirmed" || next === "cancelled");
}
