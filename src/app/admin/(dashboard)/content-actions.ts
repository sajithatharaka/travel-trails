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
}

/** Bust the cached site-settings read after an admin edit. */
export async function revalidateSettingsCache() {
  await requireSession();
  revalidateTag(SETTINGS_TAG, "max");
  revalidatePath("/", "layout");
}
