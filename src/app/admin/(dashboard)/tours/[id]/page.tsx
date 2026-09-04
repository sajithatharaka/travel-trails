"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidateToursCache } from "../actions";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/admin/ImageUpload";
import type {
  TourRow,
  TourDayRow,
  TourRouteStopRow,
} from "@/lib/supabase/database.types";

const supabase = createClient();

type DayForm = {
  day_label: string;
  title: string;
  description: string;
  experiences_label: string;
  experiencesText: string;
  note: string;
  anchor: string;
  image_url: string | null;
};

type StopForm = {
  name: string;
  description: string;
  anchor: string;
};

type TourForm = {
  title: string;
  slug: string;
  summary: string;
  hero_eyebrow: string;
  hero_headline: string;
  hero_subheadline: string;
  price_from_usd: string;
  duration_days: string;
  destination_count: string;
  cover_image_url: string | null;
  route_map_image_url: string | null;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  is_featured: boolean;
};

const EMPTY_TOUR: TourForm = {
  title: "",
  slug: "",
  summary: "",
  hero_eyebrow: "",
  hero_headline: "",
  hero_subheadline: "",
  price_from_usd: "",
  duration_days: "",
  destination_count: "",
  cover_image_url: null,
  route_map_image_url: null,
  meta_title: "",
  meta_description: "",
  is_published: false,
  is_featured: false,
};

const emptyDay = (): DayForm => ({
  day_label: "",
  title: "",
  description: "",
  experiences_label: "",
  experiencesText: "",
  note: "",
  anchor: "",
  image_url: null,
});

const emptyStop = (): StopForm => ({ name: "", description: "", anchor: "" });

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function TourEditorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const isNew = id === "new";

  const [form, setForm] = useState<TourForm>(EMPTY_TOUR);
  const [days, setDays] = useState<DayForm[]>([]);
  const [stops, setStops] = useState<StopForm[]>([]);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tour", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tours")
        .select("*, days:tour_days(*), route_stops:tour_route_stops(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as TourRow & {
        days: TourDayRow[];
        route_stops: TourRouteStopRow[];
      };
    },
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title ?? "",
      slug: data.slug ?? "",
      summary: data.summary ?? "",
      hero_eyebrow: data.hero_eyebrow ?? "",
      hero_headline: data.hero_headline ?? "",
      hero_subheadline: data.hero_subheadline ?? "",
      price_from_usd: data.price_from_usd?.toString() ?? "",
      duration_days: data.duration_days?.toString() ?? "",
      destination_count: data.destination_count?.toString() ?? "",
      cover_image_url: data.cover_image_url,
      route_map_image_url: data.route_map_image_url,
      meta_title: data.meta_title ?? "",
      meta_description: data.meta_description ?? "",
      is_published: data.is_published,
      is_featured: data.is_featured,
    });
    setSlugEdited(true);
    setDays(
      [...(data.days ?? [])]
        .sort((a, b) => a.display_order - b.display_order)
        .map((d) => ({
          day_label: d.day_label,
          title: d.title,
          description: d.description ?? "",
          experiences_label: d.experiences_label ?? "",
          experiencesText: (d.experiences ?? []).join("\n"),
          note: d.note ?? "",
          anchor: d.anchor ?? "",
          image_url: d.image_url,
        })),
    );
    setStops(
      [...(data.route_stops ?? [])]
        .sort((a, b) => a.display_order - b.display_order)
        .map((s) => ({
          name: s.name,
          description: s.description ?? "",
          anchor: s.anchor ?? "",
        })),
    );
  }, [data]);

  const set = <K extends keyof TourForm>(key: K, val: TourForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const effectiveSlug = useMemo(
    () => (slugEdited ? form.slug : slugify(form.title)),
    [slugEdited, form.slug, form.title],
  );

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Give the tour a title.");
      return;
    }
    const slug = slugify(effectiveSlug || form.title);
    setSaving(true);
    try {
      const tourPayload = {
        title: form.title.trim(),
        slug,
        summary: form.summary.trim(),
        hero_eyebrow: form.hero_eyebrow.trim() || null,
        hero_headline: form.hero_headline.trim() || form.title.trim(),
        hero_subheadline: form.hero_subheadline.trim() || null,
        price_from_usd: form.price_from_usd ? Number(form.price_from_usd) : null,
        duration_days: form.duration_days ? Number(form.duration_days) : null,
        destination_count: form.destination_count
          ? Number(form.destination_count)
          : null,
        cover_image_url: form.cover_image_url,
        route_map_image_url: form.route_map_image_url,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        is_published: form.is_published,
        is_featured: form.is_featured,
        updated_at: new Date().toISOString(),
      };

      let tourId = isNew ? null : id;

      if (isNew) {
        const { data: created, error } = await supabase
          .from("tours")
          .insert({ ...tourPayload, display_order: Date.now() % 100000 })
          .select("id")
          .single();
        if (error) throw error;
        tourId = created.id;
      } else {
        const { error } = await supabase
          .from("tours")
          .update(tourPayload)
          .eq("id", id);
        if (error) throw error;
      }

      if (!tourId) throw new Error("No tour id after save");

      if (form.is_featured) {
        await supabase
          .from("tours")
          .update({ is_featured: false })
          .neq("id", tourId);
      }

      // Replace children.
      await supabase.from("tour_days").delete().eq("tour_id", tourId);
      await supabase.from("tour_route_stops").delete().eq("tour_id", tourId);

      if (days.length) {
        const { error } = await supabase.from("tour_days").insert(
          days.map((d, i) => ({
            tour_id: tourId,
            day_label: d.day_label.trim() || `Day ${i + 1}`,
            title: d.title.trim() || `Day ${i + 1}`,
            description: d.description.trim(),
            experiences_label: d.experiences_label.trim() || null,
            experiences: d.experiencesText
              .split("\n")
              .map((x) => x.trim())
              .filter(Boolean),
            note: d.note.trim() || null,
            anchor: d.anchor.trim() || null,
            image_url: d.image_url,
            display_order: i,
          })),
        );
        if (error) throw error;
      }

      if (stops.length) {
        const { error } = await supabase.from("tour_route_stops").insert(
          stops.map((s, i) => ({
            tour_id: tourId,
            num: i + 1,
            name: s.name.trim() || `Stop ${i + 1}`,
            description: s.description.trim() || null,
            anchor: s.anchor.trim() || null,
            display_order: i,
          })),
        );
        if (error) throw error;
      }

      await revalidateToursCache().catch(() => {});
      toast.success(isNew ? "Tour created" : "Tour saved");
      router.push("/admin/tours");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!isNew && isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/tours")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-forest">
            {isNew ? "New tour" : "Edit tour"}
          </h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-forest hover:bg-canopy"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isNew ? "Create tour" : "Save changes"}
        </Button>
      </div>

      <div className="space-y-8">
        {/* Basics */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-forest">Basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="The 7-Day Sri Lanka Escape"
              />
            </Field>
            <Field label="URL slug">
              <Input
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugEdited(true);
                  set("slug", e.target.value);
                }}
                placeholder="the-7-day-sri-lanka-escape"
              />
            </Field>
          </div>
          <Field label="Summary" hint="One or two sentences for cards and the tour page.">
            <Textarea
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              rows={2}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price from (USD)">
              <Input
                type="number"
                inputMode="numeric"
                value={form.price_from_usd}
                onChange={(e) => set("price_from_usd", e.target.value)}
                placeholder="980"
              />
            </Field>
            <Field label="Duration (days)">
              <Input
                type="number"
                inputMode="numeric"
                value={form.duration_days}
                onChange={(e) => set("duration_days", e.target.value)}
                placeholder="7"
              />
            </Field>
            <Field label="Destinations">
              <Input
                type="number"
                inputMode="numeric"
                value={form.destination_count}
                onChange={(e) => set("destination_count", e.target.value)}
                placeholder="5"
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.is_published}
                onCheckedChange={(v) => set("is_published", v)}
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => set("is_featured", v)}
              />
              Featured on homepage
            </label>
          </div>
        </section>

        {/* Hero */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-forest">Hero</h2>
          <Field label="Eyebrow">
            <Input
              value={form.hero_eyebrow}
              onChange={(e) => set("hero_eyebrow", e.target.value)}
              placeholder="Travel Trails · Private Sri Lanka Journeys"
            />
          </Field>
          <Field label="Headline" hint="Defaults to the tour title if left blank.">
            <Input
              value={form.hero_headline}
              onChange={(e) => set("hero_headline", e.target.value)}
            />
          </Field>
          <Field label="Sub-headline">
            <Textarea
              value={form.hero_subheadline}
              onChange={(e) => set("hero_subheadline", e.target.value)}
              rows={2}
            />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <ImageUpload
              label="Cover image"
              value={form.cover_image_url}
              onChange={(url) => set("cover_image_url", url)}
            />
            <ImageUpload
              label="Route map image"
              value={form.route_map_image_url}
              onChange={(url) => set("route_map_image_url", url)}
              folder="tours/route"
            />
          </div>
        </section>

        {/* Route */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-forest">Route stops</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStops((s) => [...s, emptyStop()])}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add stop
            </Button>
          </div>
          {stops.length === 0 && (
            <p className="text-sm text-earth/50">No route stops yet.</p>
          )}
          <div className="space-y-3">
            {stops.map((stop, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex flex-col items-center pt-2 text-earth/30">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-xs font-semibold">{i + 1}</span>
                </div>
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Name (e.g. Sigiriya)"
                    value={stop.name}
                    onChange={(e) =>
                      setStops((arr) =>
                        arr.map((x, xi) =>
                          xi === i ? { ...x, name: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="Short description"
                    value={stop.description}
                    onChange={(e) =>
                      setStops((arr) =>
                        arr.map((x, xi) =>
                          xi === i
                            ? { ...x, description: e.target.value }
                            : x,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="Anchor (optional, e.g. day-sigiriya)"
                    value={stop.anchor}
                    onChange={(e) =>
                      setStops((arr) =>
                        arr.map((x, xi) =>
                          xi === i ? { ...x, anchor: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-earth/40 hover:text-red-500"
                  onClick={() =>
                    setStops((arr) => arr.filter((_, xi) => xi !== i))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Days */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-forest">Day-by-day itinerary</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDays((d) => [...d, emptyDay()])}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add day
            </Button>
          </div>
          {days.length === 0 && (
            <p className="text-sm text-earth/50">No days yet.</p>
          )}
          <div className="space-y-4">
            {days.map((day, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-earth/50">
                    Entry {i + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-earth/40 hover:text-red-500"
                    onClick={() =>
                      setDays((arr) => arr.filter((_, xi) => xi !== i))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Day label (e.g. Day 1 & 2)"
                    value={day.day_label}
                    onChange={(e) =>
                      setDays((arr) =>
                        arr.map((x, xi) =>
                          xi === i ? { ...x, day_label: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="Title"
                    value={day.title}
                    onChange={(e) =>
                      setDays((arr) =>
                        arr.map((x, xi) =>
                          xi === i ? { ...x, title: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
                <Textarea
                  placeholder="Description"
                  rows={2}
                  value={day.description}
                  onChange={(e) =>
                    setDays((arr) =>
                      arr.map((x, xi) =>
                        xi === i ? { ...x, description: e.target.value } : x,
                      ),
                    )
                  }
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Experiences heading (optional)"
                    value={day.experiences_label}
                    onChange={(e) =>
                      setDays((arr) =>
                        arr.map((x, xi) =>
                          xi === i
                            ? { ...x, experiences_label: e.target.value }
                            : x,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="Anchor (optional)"
                    value={day.anchor}
                    onChange={(e) =>
                      setDays((arr) =>
                        arr.map((x, xi) =>
                          xi === i ? { ...x, anchor: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
                <Textarea
                  placeholder="Experiences — one per line"
                  rows={3}
                  value={day.experiencesText}
                  onChange={(e) =>
                    setDays((arr) =>
                      arr.map((x, xi) =>
                        xi === i
                          ? { ...x, experiencesText: e.target.value }
                          : x,
                      ),
                    )
                  }
                />
                <Input
                  placeholder="Note (optional italic line)"
                  value={day.note}
                  onChange={(e) =>
                    setDays((arr) =>
                      arr.map((x, xi) =>
                        xi === i ? { ...x, note: e.target.value } : x,
                      ),
                    )
                  }
                />
                <ImageUpload
                  label="Day image"
                  value={day.image_url}
                  onChange={(url) =>
                    setDays((arr) =>
                      arr.map((x, xi) =>
                        xi === i ? { ...x, image_url: url } : x,
                      ),
                    )
                  }
                  folder="tours/days"
                />
              </div>
            ))}
          </div>
        </section>

        {/* SEO */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-forest">SEO</h2>
          <Field label="Meta title" hint="Defaults to the tour title.">
            <Input
              value={form.meta_title}
              onChange={(e) => set("meta_title", e.target.value)}
            />
          </Field>
          <Field label="Meta description" hint="Defaults to the summary.">
            <Textarea
              value={form.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
              rows={2}
            />
          </Field>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-earth/50">{hint}</p>}
    </div>
  );
}
