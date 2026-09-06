"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { CONTENT_TAG } from "@/lib/content";
import { SETTINGS_TAG } from "@/lib/settings";
import { requireSession } from "@/lib/auth";

/** Bust the cached public content reads after an admin edit. */
export async function revalidateContentCache() {
  await requireSession();
  revalidateTag(CONTENT_TAG, "max");
  revalidatePath("/");
  revalidatePath("/blog");
  // Machine-readable route maps that list every published post — statically
  // rendered, so bust them explicitly rather than trusting tag propagation.
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
}

/** Bust the cached site-settings read after an admin edit. */
export async function revalidateSettingsCache() {
  await requireSession();
  revalidateTag(SETTINGS_TAG, "max");
  revalidatePath("/", "layout");
}
