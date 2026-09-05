import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { listPublishedPosts } from "@/lib/content";
import ImageSlot from "@/components/ImageSlot";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Sri Lanka travel guides, itineraries and tips from the Travel Trails team.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();

  return (
    <main>
      <Header />
      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-14 max-w-[640px] text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
              Journal
            </p>
            <h1 className="mt-2.5 font-serif text-[clamp(30px,3.6vw,44px)] leading-tight text-ink">
              The Travel Trails Blog
            </h1>
            <p className="mt-3.5 text-lg leading-relaxed text-ink-soft">
              Guides, tips and stories from the road across Sri Lanka.
            </p>
          </div>

          {posts.length === 0 ? (
            <p
              className="mx-auto max-w-[520px] rounded-2xl border border-line bg-section-tint px-6 py-14 text-center text-ink-soft"
              data-testid="blog-empty"
            >
              No posts published yet — check back soon.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  data-testid="blog-card"
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <ImageSlot
                      src={post.image_url}
                      alt={post.title}
                      placeholder={post.title}
                      imgClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[.08em] text-ink-soft">
                      <span>{post.category}</span>
                      <span aria-hidden>·</span>
                      <time dateTime={post.published_date}>
                        {format(new Date(post.published_date), "d MMM yyyy")}
                      </time>
                    </div>
                    <h2 className="mb-2 font-serif text-[21px] leading-tight text-ink">
                      {post.title}
                    </h2>
                    <p className="flex-1 text-[14.5px] leading-relaxed text-ink-soft">
                      {post.excerpt}
                    </p>
                    <span className="mt-4 text-[14px] font-semibold text-terracotta group-hover:underline">
                      Read more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
