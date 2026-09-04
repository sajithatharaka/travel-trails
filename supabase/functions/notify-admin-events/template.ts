// Styled HTML emails for admin notifications. Travel Trails jungle/terracotta.
const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const nl2br = (v: unknown) => esc(v).replace(/\n/g, "<br>");

function shell(emoji: string, heading: string, sub: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1ea;padding:32px 0;"><tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px -12px rgba(20,58,43,0.18);">
  <tr><td style="background:linear-gradient(135deg,#143a2b 0%,#1f6b43 100%);padding:38px 40px 30px;text-align:center;">
    <div style="font-size:19px;font-weight:800;color:#fff;letter-spacing:-0.02em;margin-bottom:20px;">Travel Trails</div>
    <div style="font-size:42px;line-height:1;margin-bottom:14px;">${emoji}</div>
    <h1 style="font-size:23px;font-weight:800;color:#fff;margin:0 0 8px;letter-spacing:-0.02em;">${esc(heading)}</h1>
    <p style="font-size:14px;color:rgba(255,255,255,0.85);margin:0;">${esc(sub)}</p>
  </td></tr>
  ${inner}
  <tr><td style="padding:22px 40px 30px;text-align:center;">
    <p style="font-size:11px;color:#9aa39c;margin:0;">Sent automatically from the Travel Trails website.</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function row(label: string, value: string, alt = false): string {
  return `<tr><td style="padding:13px 20px;border-bottom:1px solid #e3ddcf;${alt ? "background:#f7f5ef;" : ""}">
    <p style="font-size:10px;font-weight:700;color:#8a9188;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 3px;">${esc(label)}</p>
    <p style="font-size:15px;font-weight:600;color:#23302a;margin:0;">${value}</p>
  </td></tr>`;
}

export function buildBookingHtml(
  b: Record<string, unknown>,
  heading: string,
): string {
  const name = `${esc(b.first_name)} ${esc(b.last_name)}`.trim();
  const party = `${esc(b.adults ?? 1)} adults · ${esc(b.children ?? 0)} children`;
  const travellers = b.travellers ? `${esc(b.travellers)} travellers` : party;
  const inner = `
  <tr><td style="padding:30px 40px 0;">
    <p style="font-size:10px;font-weight:700;color:#1f6b43;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 14px;">Enquiry</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e3ddcf;border-radius:12px;overflow:hidden;">
      ${row("Name", name, true)}
      ${row("Email", `<a href="mailto:${esc(b.email)}" style="color:#1f6b43;text-decoration:none;">${esc(b.email)}</a>`)}
      ${row("Phone", b.phone ? `<a href="tel:${esc(b.phone)}" style="color:#23302a;text-decoration:none;">${esc(b.phone)}</a>` : "—", true)}
      ${row("Tour", esc(b.tour_title) || "Not specified")}
      ${row("Travel date", esc(b.travel_date) || "Flexible", true)}
      ${row("Party", travellers)}
      ${row("Status", esc(b.status), true)}
    </table>
  </td></tr>
  <tr><td style="padding:22px 40px 4px;">
    <p style="font-size:10px;font-weight:700;color:#1f6b43;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">Message</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f5ef;border-left:3px solid #1f6b43;border-radius:0 10px 10px 0;padding:16px 20px;">
      <tr><td style="font-size:14px;color:#3b463f;line-height:1.7;">${nl2br(b.message) || "<em>No message</em>"}</td></tr>
    </table>
  </td></tr>
  <tr><td align="center" style="padding:22px 40px 8px;">
    <a href="mailto:${esc(b.email)}" style="background:#c9682f;color:#fff;text-decoration:none;padding:13px 34px;border-radius:10px;font-size:14px;font-weight:600;display:inline-block;">Reply to traveller →</a>
  </td></tr>`;
  return shell("🧭", heading, "A traveller submitted the enquiry form.", inner);
}

export function buildInquiryHtml(i: Record<string, unknown>): string {
  const inner = `
  <tr><td style="padding:30px 40px 0;">
    <p style="font-size:10px;font-weight:700;color:#1f6b43;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 14px;">Sender</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e3ddcf;border-radius:12px;overflow:hidden;">
      ${row("Name", esc(i.name), true)}
      ${row("Email", `<a href="mailto:${esc(i.email)}" style="color:#1f6b43;text-decoration:none;">${esc(i.email)}</a>`)}
      ${row("Phone", i.phone ? esc(i.phone) : "—", true)}
      ${row("Subject", esc(i.subject))}
    </table>
  </td></tr>
  <tr><td style="padding:22px 40px 4px;">
    <p style="font-size:10px;font-weight:700;color:#1f6b43;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">Message</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f5ef;border-left:3px solid #1f6b43;border-radius:0 10px 10px 0;padding:16px 20px;">
      <tr><td style="font-size:14px;color:#3b463f;line-height:1.75;">${nl2br(i.message)}</td></tr>
    </table>
  </td></tr>
  <tr><td align="center" style="padding:22px 40px 8px;">
    <a href="mailto:${esc(i.email)}" style="background:#c9682f;color:#fff;text-decoration:none;padding:13px 34px;border-radius:10px;font-size:14px;font-weight:600;display:inline-block;">Reply to sender →</a>
  </td></tr>`;
  return shell("📩", "New contact message", "Someone messaged through the site.", inner);
}
