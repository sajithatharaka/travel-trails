// src/lib/resolveImage.js
// ------------------------------------------------------------
// Looks up /public/images/<baseName>.{jpg,jpeg,png,webp} on disk and
// returns its public URL, or null if no matching file exists yet (the
// caller then falls back to a placeholder).
//
// Server-only — imported from page.jsx, which is statically prerendered
// at `next build`, so public/images always exists on disk at the point
// this runs. That's what makes fs.existsSync safe here even on hosts
// where a serverless function's filesystem wouldn't include /public.
// ------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export function resolveImage(baseName) {
  if (!baseName) return null;
  for (const ext of EXTENSIONS) {
    const file = `${baseName}.${ext}`;
    if (fs.existsSync(path.join(IMAGES_DIR, file))) {
      return `/images/${file}`;
    }
  }
  return null;
}
