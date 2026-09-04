// src/lib/getInitials.js
// ------------------------------------------------------------
// Turns a display name into a 1-2 letter initials string for
// avatar placeholders (e.g. "Stacy" -> "ST", "Hannah & Tom" -> "HT").
// ------------------------------------------------------------

export function getInitials(name = ""): string {
  const words = name.trim().split(/\s+/).filter((w) => w && w !== "&");
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
