// Turns raw Postgres / PostgREST errors from the notification_recipients
// mutations into sentences an admin can read and act on. The unique index is on
// lower(trim(email)) (see 20260902000001_notifications.sql), so re-adding an
// existing address — even with different casing or whitespace — comes back as a
// 23505 unique_violation whose default text is
// `duplicate key value violates unique constraint "..."`.

const UNIQUE_VIOLATION = "23505";
const RECIPIENT_EMAIL_UNIQUE_IDX = "notification_recipients_email_unique_idx";
const RLS_VIOLATION = "42501";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";
const PERMISSION_MESSAGE =
  "You don't have permission to change the recipients list.";

type MaybePostgrestError = {
  code?: string | null;
  message?: string | null;
};

function duplicateMessage(email?: string): string {
  return email
    ? `${email} is already on the notifications list.`
    : "That email is already on the notifications list.";
}

/**
 * @param error  the thrown PostgREST error (or anything)
 * @param email  the address the admin was adding, so the message can name it
 */
export function recipientErrorMessage(error: unknown, email?: string): string {
  const e = (error ?? {}) as MaybePostgrestError;
  const message = typeof e.message === "string" ? e.message : "";

  if (e.code === UNIQUE_VIOLATION || message.includes(RECIPIENT_EMAIL_UNIQUE_IDX)) {
    return duplicateMessage(email);
  }
  if (e.code === RLS_VIOLATION || /row-level security|permission denied/i.test(message)) {
    return PERMISSION_MESSAGE;
  }
  return FALLBACK_MESSAGE;
}
