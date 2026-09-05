"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidateContentCache } from "../content-actions";
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
import type { BlogRow } from "@/lib/supabase/database.types";

const supabase = createClient();

export default function AdminBlogPage() {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("published_date", { ascending: false });
      if (error) throw error;
      return data as BlogRow[];
    },
  });

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ["admin-blogs"] });
    revalidateContentCache().catch(() => {});
  };

  const togglePublish = useMutation({
    mutationFn: async (row: BlogRow) => {
      const { error } = await supabase
        .from("blogs")
        .update({ is_published: !row.is_published })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast.success("Post deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toDelete = rows.find((r) => r.id === deleteId);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Blog</h1>
          <p className="mt-1 text-sm text-earth/60">
            Posts on <code className="text-xs">/blog</code>.
          </p>
        </div>
        <Button asChild className="bg-forest hover:bg-canopy" data-testid="blog-new">
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New post
          </Link>
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
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-earth/60">
          No posts yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-earth/60">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-forest">{row.title}</div>
                    <div className="text-xs text-earth/50">/{row.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-earth/70">{row.category}</td>
                  <td className="px-4 py-3 text-earth/60">
                    {format(new Date(row.published_date), "d MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        row.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {row.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => togglePublish.mutate(row)}
                        title={row.is_published ? "Unpublish" : "Publish"}
                      >
                        {row.is_published ? (
                          <EyeOff className="h-4 w-4 text-earth/60" />
                        ) : (
                          <Eye className="h-4 w-4 text-earth/60" />
                        )}
                      </Button>
                      {row.is_published && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a
                            href={`/blog/${row.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 text-earth/60" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/admin/blog/${row.id}`}>
                          <Pencil className="h-4 w-4 text-earth/60" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-earth/40 hover:bg-red-50 hover:text-red-500"
                        onClick={() => setDeleteId(row.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{toDelete?.title}</strong> will be permanently removed.
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
