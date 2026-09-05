"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";
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
import type { ReviewRow } from "@/lib/supabase/database.types";

type Form = {
  reviewer_name: string;
  rating: number;
  review_text: string;
  source: string;
  location: string;
  is_visible: boolean;
};
const EMPTY: Form = {
  reviewer_name: "",
  rating: 5,
  review_text: "",
  source: "Google",
  location: "",
  is_visible: true,
};

export default function AdminReviewsPage() {
  const { rows, isLoading, error, save, remove, toggleVisible } =
    useCrudCollection<ReviewRow>({
      table: "reviews",
      queryKey: "admin-reviews",
      visibleField: "is_visible",
      revalidate: revalidateContentCache,
    });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ReviewRow | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };
  const openEdit = (r: ReviewRow) => {
    setEditing(r);
    setForm({
      reviewer_name: r.reviewer_name,
      rating: r.rating,
      review_text: r.review_text,
      source: r.source,
      location: r.location ?? "",
      is_visible: r.is_visible,
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.reviewer_name.trim() || !form.review_text.trim()) {
      toast.error("Name and review text are required.");
      return;
    }
    save.mutate(
      { id: editing?.id, values: { ...form, location: form.location || null } },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success(editing ? "Review updated" : "Review added");
        },
      },
    );
  };

  const sorted = [...rows].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Reviews</h1>
          <p className="mt-1 text-sm text-earth/60">
            Feeds the homepage &ldquo;What Our Guests Say&rdquo; section.
          </p>
        </div>
        <Button onClick={openNew} className="bg-forest hover:bg-canopy" data-testid="review-new">
          <Plus className="mr-2 h-4 w-4" />
          New review
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
          No reviews yet.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2" data-testid="review-list">
          {sorted.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-forest">{r.reviewer_name}</span>
                  {r.location && (
                    <span className="text-xs text-earth/50">{r.location}</span>
                  )}
                  {!r.is_visible && (
                    <Badge className="bg-gray-100 text-gray-600">Hidden</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="line-clamp-3 text-sm text-earth/70">{r.review_text}</p>
              <div className="mt-2 flex items-center justify-end gap-1">
                <Switch
                  checked={r.is_visible}
                  onCheckedChange={() => toggleVisible.mutate(r)}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                  <Pencil className="h-4 w-4 text-earth/60" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-earth/40 hover:bg-red-50 hover:text-red-500"
                  onClick={() => setDeleteId(r.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit review" : "New review"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Reviewer name</Label>
                <Input
                  data-testid="review-name"
                  value={form.reviewer_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reviewer_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Location / country</Label>
                <Input
                  data-testid="review-location"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Review</Label>
              <Textarea
                data-testid="review-text"
                rows={4}
                value={form.review_text}
                onChange={(e) =>
                  setForm((f) => ({ ...f, review_text: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Input
                  data-testid="review-source"
                  value={form.source}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, source: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rating (1–5)</Label>
                <Input
                  data-testid="review-rating"
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      rating: Math.min(5, Math.max(1, Number(e.target.value) || 5)),
                    }))
                  }
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.is_visible}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_visible: v }))}
              />
              Visible
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
              data-testid="review-save"
            >
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
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
                    toast.success("Review deleted");
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
