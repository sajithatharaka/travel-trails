import "server-only";
import { unstable_cache } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";
import type {
  TourRow,
  TourDayRow,
  TourRouteStopRow,
} from "@/lib/supabase/database.types";

export type TourWithChildren = TourRow & {
  days: TourDayRow[];
  route_stops: TourRouteStopRow[];
};

export const TOURS_TAG = "tours";

/**
 * Cached read of every published tour with its day-by-day plan and route.
 * Admin mutations call `revalidateTag(TOURS_TAG, "max")` to refresh this.
 */
const loadPublishedTours = unstable_cache(
  async (): Promise<TourWithChildren[]> => {
    const { data, error } = await supabasePublic
      .from("tours")
      .select("*, days:tour_days(*), route_stops:tour_route_stops(*)")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      // Table missing / project not linked yet — degrade to an empty list so
      // the marketing site still renders during Phase 0/1 bring-up.
      console.error("[tours] loadPublishedTours:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as TourWithChildren[]).map(sortChildren);
  },
  ["published-tours"],
  { tags: [TOURS_TAG], revalidate: 3600 },
);

function sortChildren<T extends TourWithChildren>(tour: T): T {
  return {
    ...tour,
    days: [...(tour.days ?? [])].sort((a, b) => a.display_order - b.display_order),
    route_stops: [...(tour.route_stops ?? [])].sort(
      (a, b) => a.display_order - b.display_order,
    ),
  };
}

export async function listPublishedTours(): Promise<TourWithChildren[]> {
  return loadPublishedTours();
}

export async function getFeaturedTour(): Promise<TourWithChildren | null> {
  const tours = await loadPublishedTours();
  return tours.find((t) => t.is_featured) ?? tours[0] ?? null;
}

/**
 * Up to `limit` published tours for the homepage grid: any `is_featured`
 * tours first, then the rest in `display_order`, capped at `limit`.
 */
export async function listFeaturedTrails(
  limit = 4,
): Promise<TourWithChildren[]> {
  const tours = await loadPublishedTours();
  const featured = tours.filter((t) => t.is_featured);
  const rest = tours.filter((t) => !t.is_featured);
  return [...featured, ...rest].slice(0, limit);
}

export async function getTourBySlug(
  slug: string,
): Promise<TourWithChildren | null> {
  const tours = await loadPublishedTours();
  return tours.find((t) => t.slug === slug) ?? null;
}

export { formatPriceFrom } from "@/lib/format";
