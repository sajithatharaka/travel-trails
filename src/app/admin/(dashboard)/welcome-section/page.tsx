"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import { useCrudCollection } from "@/lib/admin/useCrudCollection";
import { createClient } from "@/lib/supabase/client";
import { parseHeroImages } from "@/lib/format";
import { revalidateContentCache, revalidateSettingsCache } from "../content-actions";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/admin/ImageUpload";
import type { WelcomeSectionRow } from "@/lib/supabase/database.types";

const supabase = createClient();

const HERO_IMAGES_KEY = "hero_images";

type Img = { url: string | null; alt: string };
type Form = {
  badge_text: string;
  heading: string;
  paragraph_1: string;
  paragraph_2: string;
  image: Img;
  is_active: boolean;
};
const EMPTY: Form = {
  badge_text: "About Travel Trails",
  heading: "",
  paragraph_1: "",
  paragraph_2: "",
  image: { url: null, alt: "" },
  is_active: true,
};

function toValues(f: Form) {
  return {
    badge_text: f.badge_text,
    heading: f.heading,
    paragraph_1: f.paragraph_1,
    paragraph_2: f.paragraph_2,
    image_url: f.image.url,
    image_alt: f.image.alt,
    is_active: f.is_active,
  };
}

function toForm(w: WelcomeSectionRow): Form {
  return {
    badge_text: w.badge_text,
    heading: w.heading,
    paragraph_1: w.paragraph_1,
    paragraph_2: w.paragraph_2,
    image: { url: w.image_url, alt: w.image_alt },
    is_active: w.is_active,
  };
}

export default function AdminWelcomeSectionPage() {
  // The homepage About block only ever uses one row (the first active one,
  // see getActiveWelcomeSection in lib/content.ts) — so this page edits that
  // single record directly instead of a list you have to open a variant
  // from. `current` is that record, if one already exists.
  const { rows, isLoading, error, save } = useCrudCollection<WelcomeSectionRow>({
    table: "welcome_sections",
    queryKey: "admin-welcome-sections",
    revalidate: revalidateContentCache,
  });

  const current =
    [...rows].sort((a, b) => a.display_order - b.display_order)[0] ?? null;

  const [form, setForm] = useState<Form>(EMPTY);

  useEffect(() => {
    setForm(current ? toForm(current) : EMPTY);
  }, [current]);

  const setImage = (patch: Partial<Img>) =>
    setForm((f) => ({ ...f, image: { ...f.image, ...patch } }));

  const submit = () => {
    if (!form.heading.trim()) {
      toast.error("Heading is required.");
      return;
    }
    save.mutate(
      { id: current?.id, values: toValues(form) },
      { onSuccess: () => toast.success("Welcome section saved") },
    );
  };

  // ── Homepage hero slideshow — moved here from /admin/settings so the
  // homepage's two big imagery areas (About block above, hero banner below)
  // are managed from one place. Same site_settings.hero_images key the
  // public HeroSlider reads — see docs/requirements/homepage-hero.md.
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [savingHero, setSavingHero] = useState(false);

  const { data: heroData, isLoading: heroLoading } = useQuery({
    queryKey: ["admin-hero-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("key", HERO_IMAGES_KEY)
        .maybeSingle();
      if (error) throw error;
      return data as { key: string; value: unknown } | null;
    },
  });

  useEffect(() => {
    if (heroData === undefined) return;
    setHeroImages(parseHeroImages(heroData?.value));
  }, [heroData]);

  function moveHeroImage(index: number, dir: -1 | 1) {
    setHeroImages((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSaveHeroImages() {
    setSavingHero(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          { key: HERO_IMAGES_KEY, value: heroImages, updated_at: new Date().toISOString() },
          { onConflict: "key" },
        );
      if (error) throw error;
      await revalidateSettingsCache().catch(() => {});
      toast.success("Hero slideshow saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingHero(false);
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Welcome Section</h1>
          <p className="mt-1 text-sm text-earth/60">
            The homepage &ldquo;About&rdquo; block. Empty fields fall back to
            the built-in copy.
          </p>
        </div>
        <Button
          onClick={submit}
          disabled={save.isPending || isLoading}
          className="bg-forest hover:bg-canopy"
          data-testid="welcome-save"
        >
          {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-forest" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {(error as Error).message}
        </div>
      ) : (
        <div
          className="space-y-4 rounded-xl border border-border bg-card p-6"
          data-testid="welcome-editor"
        >
          <div className="space-y-1.5">
            <Label>Badge text</Label>
            <Input
              data-testid="welcome-badge"
              value={form.badge_text}
              onChange={(e) =>
                setForm((f) => ({ ...f, badge_text: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input
              data-testid="welcome-heading"
              value={form.heading}
              onChange={(e) =>
                setForm((f) => ({ ...f, heading: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Paragraph 1</Label>
            <Textarea
              data-testid="welcome-p1"
              rows={3}
              value={form.paragraph_1}
              onChange={(e) =>
                setForm((f) => ({ ...f, paragraph_1: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Paragraph 2</Label>
            <Textarea
              data-testid="welcome-p2"
              rows={3}
              value={form.paragraph_2}
              onChange={(e) =>
                setForm((f) => ({ ...f, paragraph_2: e.target.value }))
              }
            />
          </div>
          <div className="max-w-xs space-y-2">
            <ImageUpload
              label="Image"
              value={form.image.url}
              onChange={(url) => setImage({ url })}
              folder="welcome"
            />
            <Input
              data-testid="welcome-image-alt"
              placeholder="Image alt text"
              value={form.image.alt}
              onChange={(e) => setImage({ alt: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            />
            Active
          </label>
        </div>
      )}

      <div
        className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6"
        data-testid="settings-hero-images"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-forest">
              Homepage hero slideshow
            </h2>
            <p className="mt-1 text-xs text-earth/60">
              Add two or more images and the homepage hero rotates through
              them automatically. With none, it uses the featured tour&apos;s
              cover image.
            </p>
          </div>
          <Button
            onClick={handleSaveHeroImages}
            disabled={savingHero || heroLoading}
            className="bg-forest hover:bg-canopy"
            data-testid="settings-hero-images-save"
          >
            {savingHero && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>

        {heroLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-forest" />
          </div>
        ) : (
          <>
            {heroImages.length > 0 && (
              <ul className="space-y-2" data-testid="settings-hero-image-list">
                {heroImages.map((url, i) => (
                  <li
                    key={url}
                    className="flex items-center gap-3 rounded-lg border border-border p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Hero slide ${i + 1}`}
                      className="h-14 w-24 shrink-0 rounded object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-xs text-earth/60">
                      {url}
                    </span>
                    <div className="flex shrink-0 items-center">
                      <button
                        type="button"
                        className="p-1 text-earth/40 hover:text-forest disabled:opacity-30"
                        disabled={i === 0}
                        aria-label={`Move slide ${i + 1} up`}
                        onClick={() => moveHeroImage(i, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-earth/40 hover:text-forest disabled:opacity-30"
                        disabled={i === heroImages.length - 1}
                        aria-label={`Move slide ${i + 1} down`}
                        onClick={() => moveHeroImage(i, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-earth/40 hover:text-red-500"
                        aria-label={`Remove slide ${i + 1}`}
                        data-testid={`settings-hero-image-remove-${i}`}
                        onClick={() =>
                          setHeroImages((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <ImageUpload
              label="Add hero image"
              value={null}
              folder="hero"
              onChange={(url) => {
                if (url) setHeroImages((prev) => [...prev, url]);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
