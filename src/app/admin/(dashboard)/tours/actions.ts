"use server";

import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { TOURS_TAG } from "@/lib/tours";
import { requireSession } from "@/lib/auth";

/**
 * Called by the admin Tours UI after a create / update / delete so the cached
 * public reads (homepage, /tours, sitemap) pick up the change.
 */
export async function revalidateToursCache() {
  await requireSession();
  revalidateTag(TOURS_TAG, "max");
  revalidatePath("/");
  revalidatePath("/tours");
}
