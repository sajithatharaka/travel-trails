// ------------------------------------------------------------
// /llms.txt — a plain-text map of the site for LLM / generative-engine
// crawlers (GEO). Mirrors sitemap.xml in spirit but is human/AI readable and
// summarises each tour and blog post. Regenerated from the same cached DB
// readers the pages use.
// ------------------------------------------------------------

import { siteConfig } from "@/config";
import { listPublishedTours } from "@/lib/tours";
import { listPublishedPosts } from "@/lib/content";

const SITE_URL = siteConfig.brand.siteUrl.replace(/\/$/, "");

export const revalidate = 3600;

function line(title: string, url: string, summary?: string | null): string {
  const desc = summary?.trim().replace(/\s+/g, " ");
  return `- [${title}](${url})${desc ? `: ${desc}` : ""}`;
}

export async function GET(): Promise<Response> {
  const [tours, posts] = await Promise.all([
    listPublishedTours(),
    listPublishedPosts(),
  ]);

  const body = [
    `# ${siteConfig.brand.name}`,
    "",
    "> Private, boutique journeys across Sri Lanka. Planned by locals, for",
    "> travellers who want more than a checklist. Travel Trails operates under",
    "> the Tree Trails Sigiriya hospitality brand and designs tailored",
    "> itineraries spanning the cultural triangle, hill country and south coast.",
    "",
    "## Key pages",
    line("Home", `${SITE_URL}/`),
    line("Tours", `${SITE_URL}/tours`, "All published Sri Lanka itineraries."),
    line("Blog", `${SITE_URL}/blog`, "Sri Lanka travel guides and tips."),
    line("Contact", `${SITE_URL}/contact`, "Enquire about a trip."),
    "",
    "## Tours",
    ...(tours.length > 0
      ? tours.map((t) =>
          line(t.title, `${SITE_URL}/tours/${t.slug}`, t.summary),
        )
      : ["- (none published yet)"]),
    "",
    "## Blog",
    ...(posts.length > 0
      ? posts.map((p) =>
          line(p.title, `${SITE_URL}/blog/${p.slug}`, p.excerpt),
        )
      : ["- (none published yet)"]),
    "",
    "## Policies",
    line("Privacy Policy", `${SITE_URL}/privacy`),
    line("Terms & Conditions", `${SITE_URL}/terms`),
    line("Cookie Policy", `${SITE_URL}/cookie-policy`),
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
