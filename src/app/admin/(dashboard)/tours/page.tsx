"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidateToursCache } from "./actions";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { TourRow } from "@/lib/supabase/database.types";

const supabase = createClient();

async function fetchTours(): Promise<TourRow[]> {
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export default function AdminToursPage() {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: tours = [], isLoading, error } = useQuery({
    queryKey: ["admin-tours"],
    queryFn: fetchTours,
  });

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ["admin-tours"] });
    revalidateToursCache().catch(() => {});
  };

  const togglePublish = useMutation({
    mutationFn: async (tour: TourRow) => {
      const { error } = await supabase
        .from("tours")
        .update({ is_published: !tour.is_published })
        .eq("id", tour.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const makeFeatured = useMutation({
    mutationFn: async (tour: TourRow) => {
      // Only one featured tour at a time.
      const { error: clearErr } = await supabase
        .from("tours")
        .update({ is_featured: false })
        .neq("id", tour.id);
      if (clearErr) throw clearErr;
      const { error } = await supabase
        .from("tours")
        .update({ is_featured: true, is_published: true })
        .eq("id", tour.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Featured tour updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: async ({ tour, dir }: { tour: TourRow; dir: -1 | 1 }) => {
      const sorted = [...tours].sort(
        (a, b) => a.display_order - b.display_order,
      );
      const idx = sorted.findIndex((t) => t.id === tour.id);
      const swapWith = sorted[idx + dir];
      if (!swapWith) return;
      const a = supabase
        .from("tours")
        .update({ display_order: swapWith.display_order })
        .eq("id", tour.id);
      const b = supabase
        .from("tours")
        .update({ display_order: tour.display_order })
        .eq("id", swapWith.id);
      const [ra, rb] = await Promise.all([a, b]);
      if (ra.error) throw ra.error;
      if (rb.error) throw rb.error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tours").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast.success("Tour deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toDelete = tours.find((t) => t.id === deleteId);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Tours</h1>
          <p className="mt-1 text-sm text-earth/60">
            Tour packages shown on the site. The featured tour drives the homepage.
          </p>
        </div>
        <Button asChild className="bg-forest hover:bg-canopy">
          <Link href="/admin/tours/new">
            <Plus className="mr-2 h-4 w-4" />
            New tour
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-forest" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&rsquo;t load tours: {(error as Error).message}. The database may
          not be set up yet — run the migrations (see checklist).
        </div>
      ) : tours.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-earth/60">
          No tours yet. Create your first one to replace the homepage placeholder.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-earth/60">
              <tr>
                <th className="px-4 py-3">Tour</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Price from</th>
                <th className="px-4 py-3 text-right">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...tours]
                .sort((a, b) => a.display_order - b.display_order)
                .map((tour, i, arr) => (
                  <tr key={tour.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-forest">{tour.title}</div>
                      <div className="text-xs text-earth/50">/{tour.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          className={
                            tour.is_published
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {tour.is_published ? "Published" : "Draft"}
                        </Badge>
                        {tour.is_featured && (
                          <Badge className="bg-amber-100 text-amber-800">
                            <Star className="mr-1 h-3 w-3" />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-earth/70">
                      {tour.price_from_usd != null
                        ? `$${Math.round(tour.price_from_usd).toLocaleString("en-US")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={i === 0 || reorder.isPending}
                          onClick={() => reorder.mutate({ tour, dir: -1 })}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={i === arr.length - 1 || reorder.isPending}
                          onClick={() => reorder.mutate({ tour, dir: 1 })}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={tour.is_featured ? "Featured" : "Make featured"}
                          disabled={makeFeatured.isPending}
                          onClick={() => makeFeatured.mutate(tour)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              tour.is_featured
                                ? "fill-amber-400 text-amber-500"
                                : "text-earth/40"
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={tour.is_published ? "Unpublish" : "Publish"}
                          disabled={togglePublish.isPending}
                          onClick={() => togglePublish.mutate(tour)}
                        >
                          {tour.is_published ? (
                            <EyeOff className="h-4 w-4 text-earth/60" />
                          ) : (
                            <Eye className="h-4 w-4 text-earth/60" />
                          )}
                        </Button>
                        {tour.is_published && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <a
                              href={`/tours/${tour.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View on site"
                            >
                              <ExternalLink className="h-4 w-4 text-earth/60" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link href={`/admin/tours/${tour.id}`} title="Edit">
                            <Pencil className="h-4 w-4 text-earth/60" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-earth/40 hover:bg-red-50 hover:text-red-500"
                          onClick={() => setDeleteId(tour.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this tour?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{toDelete?.title}</strong> and its day-by-day plan and
              route will be permanently removed. This can&rsquo;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && remove.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
