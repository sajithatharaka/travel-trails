"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useCrudCollection } from "@/lib/admin/useCrudCollection";
import { revalidateContentCache } from "../content-actions";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ImageUpload from "@/components/admin/ImageUpload";
import type { WelcomeSectionRow } from "@/lib/supabase/database.types";

type Img = { url: string | null; alt: string };
type Form = {
  badge_text: string;
  heading: string;
  paragraph_1: string;
  paragraph_2: string;
  images: [Img, Img, Img, Img];
  is_active: boolean;
};
const EMPTY: Form = {
  badge_text: "About Travel Trails",
  heading: "",
  paragraph_1: "",
  paragraph_2: "",
  images: [
    { url: null, alt: "" },
    { url: null, alt: "" },
    { url: null, alt: "" },
    { url: null, alt: "" },
  ],
  is_active: true,
};

function toValues(f: Form) {
  return {
    badge_text: f.badge_text,
    heading: f.heading,
    paragraph_1: f.paragraph_1,
    paragraph_2: f.paragraph_2,
    image_1_url: f.images[0].url,
    image_1_alt: f.images[0].alt,
    image_2_url: f.images[1].url,
    image_2_alt: f.images[1].alt,
    image_3_url: f.images[2].url,
    image_3_alt: f.images[2].alt,
    image_4_url: f.images[3].url,
    image_4_alt: f.images[3].alt,
    is_active: f.is_active,
  };
}

export default function AdminWelcomeSectionPage() {
  const { rows, isLoading, error, save, remove, toggleVisible } =
    useCrudCollection<WelcomeSectionRow>({
      table: "welcome_sections",
      queryKey: "admin-welcome-sections",
      visibleField: "is_active",
      revalidate: revalidateContentCache,
    });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WelcomeSectionRow | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };
  const openEdit = (w: WelcomeSectionRow) => {
    setEditing(w);
    setForm({
      badge_text: w.badge_text,
      heading: w.heading,
      paragraph_1: w.paragraph_1,
      paragraph_2: w.paragraph_2,
      images: [
        { url: w.image_1_url, alt: w.image_1_alt },
        { url: w.image_2_url, alt: w.image_2_alt },
        { url: w.image_3_url, alt: w.image_3_alt },
        { url: w.image_4_url, alt: w.image_4_alt },
      ],
      is_active: w.is_active,
    });
    setOpen(true);
  };

  const setImage = (i: number, patch: Partial<Img>) =>
    setForm((f) => {
      const images = [...f.images] as Form["images"];
      images[i] = { ...images[i], ...patch };
      return { ...f, images };
    });

  const submit = () => {
    if (!form.heading.trim()) {
      toast.error("Heading is required.");
      return;
    }
    save.mutate(
      { id: editing?.id, values: toValues(form) },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success(editing ? "Section updated" : "Section added");
        },
      },
    );
  };

  const sorted = [...rows].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Welcome Section</h1>
          <p className="mt-1 text-sm text-earth/60">
            The homepage &ldquo;About&rdquo; block. The first active entry wins;
            fields fall back to the built-in copy.
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-forest hover:bg-canopy"
          data-testid="welcome-new"
        >
          <Plus className="mr-2 h-4 w-4" />
          New variant
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
          No variants — the homepage uses the built-in copy.
        </div>
      ) : (
        <div className="space-y-2" data-testid="welcome-list">
          {sorted.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-terracotta">
                    {w.badge_text}
                  </span>
                  {w.is_active ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
                  )}
                </div>
                <p className="mt-0.5 font-medium text-forest">{w.heading}</p>
              </div>
              <Switch
                checked={w.is_active}
                onCheckedChange={() => toggleVisible.mutate(w)}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(w)}>
                <Pencil className="h-4 w-4 text-earth/60" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-earth/40 hover:bg-red-50 hover:text-red-500"
                onClick={() => setDeleteId(w.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit variant" : "New variant"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
            <div className="grid gap-4 sm:grid-cols-2">
              {form.images.map((img, i) => (
                <div key={i} className="space-y-2">
                  <ImageUpload
                    label={`Image ${i + 1}`}
                    value={img.url}
                    onChange={(url) => setImage(i, { url })}
                    folder="welcome"
                  />
                  <Input
                    placeholder={`Image ${i + 1} alt text`}
                    value={img.alt}
                    onChange={(e) => setImage(i, { alt: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-forest hover:bg-canopy"
              disabled={save.isPending}
              onClick={submit}
              data-testid="welcome-save"
            >
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this variant?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                deleteId &&
                remove.mutate(deleteId, {
                  onSuccess: () => {
                    setDeleteId(null);
                    toast.success("Deleted");
                  },
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
