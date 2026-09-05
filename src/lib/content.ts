import "server-only";
import { unstable_cache } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";
import type {
  BlogRow,
  FaqRow,
  GalleryRow,
  ReviewRow,
  WelcomeSectionRow,
} from "@/lib/supabase/database.types";

export const CONTENT_TAG = "content";

function cached<T>(key: string, fn: () => Promise<T>) {
  return unstable_cache(fn, [key], { tags: [CONTENT_TAG], revalidate: 3600 });
}

async function safe<T>(
  label: string,
  fn: () => PromiseLike<{
    data: T[] | null;
    error: { message: string } | null;
  }>,
  fallback: T[] = [],
): Promise<T[]> {
  try {
    const { data, error } = await fn();
    if (error) {
      console.error(`[content] ${label}:`, error.message);
      return fallback;
    }
    return data ?? fallback;
  } catch (e) {
    console.error(`[content] ${label}:`, e);
    return fallback;
  }
}

// ── Reviews ──────────────────────────────────────────────────
export const listReviews = cached("reviews", () =>
  safe<ReviewRow>("reviews", () =>
    supabasePublic
      .from("reviews")
      .select("*")
      .eq("is_visible", true)
      .order("display_order", { ascending: true }),
  ),
);

// ── FAQ ──────────────────────────────────────────────────────
const loadFaqs = cached("faqs", () =>
  safe<FaqRow>("faqs", () =>
    supabasePublic
      .from("faqs")
      .select("*")
      .eq("is_visible", true)
      .order("display_order", { ascending: true }),
  ),
);

/** Site-wide FAQ (no tour attached). */
export async function listSiteFaqs(): Promise<FaqRow[]> {
  return (await loadFaqs()).filter((f) => !f.tour_id);
}

export async function listTourFaqs(tourId: string): Promise<FaqRow[]> {
  return (await loadFaqs()).filter((f) => f.tour_id === tourId);
}

// ── Gallery ──────────────────────────────────────────────────
const loadGallery = cached("gallery", () =>
  safe<GalleryRow>("gallery", () =>
    supabasePublic
      .from("gallery")
      .select("*")
      .eq("is_visible", true)
      .order("display_order", { ascending: true }),
  ),
);

export async function listGallery(): Promise<GalleryRow[]> {
  return (await loadGallery()).filter((g) => g.image_url);
}

// ── Welcome section ──────────────────────────────────────────
export const getActiveWelcomeSection = cached("welcome", async () => {
  const rows = await safe<WelcomeSectionRow>("welcome_sections", () =>
    supabasePublic
      .from("welcome_sections")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(1),
  );
  return rows[0] ?? null;
});

// ── Blog ─────────────────────────────────────────────────────
export const listPublishedPosts = cached("blogs", () =>
  safe<BlogRow>("blogs", () =>
    supabasePublic
      .from("blogs")
      .select("*")
      .eq("is_published", true)
      .order("published_date", { ascending: false }),
  ),
);

export async function getPostBySlug(slug: string): Promise<BlogRow | null> {
  const posts = await listPublishedPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function listRelatedPosts(
  slug: string,
  limit = 3,
): Promise<BlogRow[]> {
  const posts = await listPublishedPosts();
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}
