"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCrudCollection } from "@/lib/admin/useCrudCollection";
import { revalidateContentCache } from "../content-actions";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageUpload from "@/components/admin/ImageUpload";
import type { GalleryRow } from "@/lib/supabase/database.types";

export default function AdminGalleryPage() {
  const { rows, isLoading, error, save, remove, toggleVisible, reorder } =
    useCrudCollection<GalleryRow>({
      table: "gallery",
      queryKey: "admin-gallery",
      visibleField: "is_visible",
      revalidate: revalidateContentCache,
    });

  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [category, setCategory] = useState("General");

  const sorted = [...rows].sort((a, b) => a.display_order - b.display_order);

  const submit = () => {
    if (!imageUrl) {
      toast.error("Upload an image first.");
      return;
    }
    save.mutate(
      {
        values: {
          image_url: imageUrl,
          alt_text: alt,
          category: category || "General",
          is_visible: true,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setImageUrl(null);
          setAlt("");
          setCategory("General");
          toast.success("Photo added");
        },
      },
    );
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Gallery</h1>
          <p className="mt-1 text-sm text-earth/60">
            Photos in the homepage gallery ticker.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-forest hover:bg-canopy"
          data-testid="gallery-new"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add photo
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
      ) : sorted.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-earth/60">
          No photos yet.
        </div>
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="gallery-grid"
        >
          {sorted.map((g, i) => (
            <div
              key={g.id}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              <div className="aspect-[4/3] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {g.image_url && (
                  <img
                    src={g.image_url}
                    alt={g.alt_text}
                    className={`h-full w-full object-cover ${
                      g.is_visible ? "" : "opacity-40"
                    }`}
                  />
                )}
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="truncate px-1 text-xs text-earth/60">
                  {g.alt_text || g.category}
                </span>
                <div className="flex items-center">
                  <button
                    className="p-1.5 text-earth/40 hover:text-forest disabled:opacity-30"
                    disabled={i === 0}
                    onClick={() => reorder.mutate({ row: g, dir: -1 })}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 text-earth/40 hover:text-forest disabled:opacity-30"
                    disabled={i === sorted.length - 1}
                    onClick={() => reorder.mutate({ row: g, dir: 1 })}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 text-earth/40 hover:text-forest"
                    onClick={() => toggleVisible.mutate(g)}
                  >
                    {g.is_visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    className="p-1.5 text-earth/40 hover:text-red-500"
                    onClick={() =>
                      remove.mutate(g.id, {
                        onSuccess: () => toast.success("Photo removed"),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUpload
              label="Photo"
              value={imageUrl}
              onChange={setImageUrl}
              folder="gallery"
            />
            <div className="space-y-1.5">
              <Label>Alt text</Label>
              <Input
                data-testid="gallery-alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Describe the photo for accessibility & SEO"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input
                data-testid="gallery-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-forest hover:bg-canopy"
              disabled={save.isPending || !imageUrl}
              onClick={submit}
              data-testid="gallery-save"
            >
              {save.isPending ? "Saving…" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
