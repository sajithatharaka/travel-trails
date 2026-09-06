import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  listPublishedPosts,
  getPostBySlug,
  listRelatedPosts,
} from "@/lib/content";
import { siteConfig } from "@/config";
import { resolveImage } from "@/lib/resolveImage";
import {
  blogPostingSchema,
  breadcrumbSchema,
} from "@/lib/seo/structuredData";
import { SITE_OG_IMAGE } from "@/lib/seo/openGraph";
import JsonLd from "@/components/JsonLd";

// Final fallback when a post has no meta_description and no excerpt — a page
// must never ship without a <meta name="description">.
const FALLBACK_DESCRIPTION =
  "Sri Lanka travel guides, itineraries and tips from the Travel Trails team.";
import ImageSlot from "@/components/ImageSlot";
import Markdown from "@/components/Markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  const title = post.meta_title || post.title;
  const description =
    post.meta_description || post.excerpt || FALLBACK_DESCRIPTION;
  // Next merges neither openGraph nor twitter across segments, so both are set
  // in full here — otherwise the Twitter card keeps the generic site values.
  const images = [post.image_url ? { url: post.image_url } : SITE_OG_IMAGE];
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      siteName: siteConfig.brand.name,
      locale: "en_US",
      publishedTime: post.published_date,
      modifiedTime: post.updated_at || post.published_date,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await listRelatedPosts(slug, 3);

  const graph = [
    blogPostingSchema(post, resolveImage("travel-trails-logo")),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ];

  return (
    <main>
      <JsonLd data={graph} />
      <Header />

      <article className="bg-surface px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[760px]">
          <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[.08em] text-terracotta">
            <span>{post.category}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.published_date}>
              {format(new Date(post.published_date), "d MMMM yyyy")}
            </time>
          </div>
          <h1 className="mb-6 font-serif text-[clamp(30px,4vw,46px)] leading-tight text-ink">
            {post.title}
          </h1>
          {post.image_url && (
            <div className="mb-10 aspect-[16/9] overflow-hidden rounded-[20px]">
              <ImageSlot src={post.image_url} alt={post.title} priority />
            </div>
          )}
          <Markdown>{post.content || post.excerpt}</Markdown>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-section-tint px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-[1180px]">
            <h2 className="mb-8 font-serif text-[clamp(22px,2.6vw,30px)] text-ink">
              More Articles
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <ImageSlot
                      src={r.image_url}
                      alt={r.title}
                      placeholder={r.title}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-1.5 font-serif text-[17px] leading-tight text-ink">
                      {r.title}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-ink-soft">
                      {r.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
