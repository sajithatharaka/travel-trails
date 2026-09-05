"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import { revalidateContentCache } from "../../content-actions";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/admin/ImageUpload";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import type { BlogRow } from "@/lib/supabase/database.types";

const supabase = createClient();

type Form = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published_date: string;
  image_url: string | null;
  is_published: boolean;
  meta_title: string;
  meta_description: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY: Form = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Sri Lanka",
  published_date: today(),
  image_url: null,
  is_published: false,
  meta_title: "",
  meta_description: "",
};

export default function BlogEditorPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";

  const [form, setForm] = useState<Form>(EMPTY);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-blog", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as BlogRow;
    },
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      published_date: data.published_date,
      image_url: data.image_url,
      is_published: data.is_published,
      meta_title: data.meta_title ?? "",
      meta_description: data.meta_description ?? "",
    });
    setSlugEdited(true);
  }, [data]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const effectiveSlug = useMemo(
    () => (slugEdited ? form.slug : slugify(form.title)),
    [slugEdited, form.slug, form.title],
  );

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Give the post a title.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: slugify(effectiveSlug || form.title),
        excerpt: form.excerpt.trim(),
        content: form.content,
        category: form.category.trim() || "Sri Lanka",
        published_date: form.published_date || today(),
        image_url: form.image_url,
        is_published: form.is_published,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (isNew) {
        const { error } = await supabase.from("blogs").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blogs").update(payload).eq("id", id);
        if (error) throw error;
      }
      await revalidateContentCache().catch(() => {});
      toast.success(isNew ? "Post created" : "Post saved");
      router.push("/admin/blog");
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/blog")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-forest">
            {isNew ? "New post" : "Edit post"}
          </h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-forest hover:bg-canopy"
          data-testid="blog-save"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isNew ? "Create post" : "Save changes"}
        </Button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              data-testid="blog-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>URL slug</Label>
            <Input
              data-testid="blog-slug"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugEdited(true);
                set("slug", e.target.value);
              }}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Published date</Label>
            <Input
              type="date"
              value={form.published_date}
              onChange={(e) => set("published_date", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Excerpt</Label>
          <Textarea
            data-testid="blog-excerpt"
            rows={2}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
          />
        </div>
        <ImageUpload
          label="Cover image"
          value={form.image_url}
          onChange={(url) => set("image_url", url)}
          folder="blog"
        />
        <div className="space-y-1.5">
          <Label>Content</Label>
          <MarkdownEditor
            value={form.content}
            onChange={(v) => set("content", v)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Meta title</Label>
            <Input
              value={form.meta_title}
              onChange={(e) => set("meta_title", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Meta description</Label>
            <Input
              value={form.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={form.is_published}
            onCheckedChange={(v) => set("is_published", v)}
          />
          Published
        </label>
      </div>
    </div>
  );
}
