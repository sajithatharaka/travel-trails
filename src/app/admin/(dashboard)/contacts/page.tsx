"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import type { ContactSubmissionRow } from "@/lib/supabase/database.types";

const supabase = createClient();

export default function AdminContactsPage() {
  const qc = useQueryClient();
  const [viewing, setViewing] = useState<ContactSubmissionRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin-contact-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContactSubmissionRow[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contact-submissions"] });
      setDeleteId(null);
      toast.success("Message deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const fmt = (d: string) => format(new Date(d), "d MMM yyyy, HH:mm");

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">Contacts</h1>
        <p className="mt-1 text-sm text-earth/60">
          Messages from the contact form.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-forest" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&rsquo;t load messages: {(error as Error).message}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-earth/60">
          No messages yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-earth/60">
              <tr>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-forest">{r.name}</div>
                    <div className="text-xs text-earth/50">{r.email}</div>
                  </td>
                  <td className="px-4 py-3 text-earth/70">{r.subject}</td>
                  <td className="px-4 py-3 text-earth/60">{fmt(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewing(r)}
                      >
                        <Eye className="h-4 w-4 text-earth/60" />
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.subject}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <p className="text-earth/70">
                <strong className="text-forest">{viewing.name}</strong> ·{" "}
                <a
                  href={`mailto:${viewing.email}`}
                  className="text-forest hover:underline"
                >
                  {viewing.email}
                </a>
                {viewing.phone && ` · ${viewing.phone}`}
              </p>
              <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-earth/80">
                {viewing.message}
              </p>
              <a
                href={`mailto:${viewing.email}?subject=Re: ${encodeURIComponent(
                  viewing.subject,
                )}`}
                className="block text-center text-sm font-medium text-forest hover:underline"
              >
                Reply by email →
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the message. It cannot be undone.
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
