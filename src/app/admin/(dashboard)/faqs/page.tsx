"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
import type { FaqRow } from "@/lib/supabase/database.types";

const supabase = createClient();

type Form = {
  question: string;
  answer: string;
  category: string;
  is_visible: boolean;
};
const EMPTY: Form = { question: "", answer: "", category: "General", is_visible: true };

export default function AdminFaqsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FaqRow | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as FaqRow[];
    },
  });

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ["admin-faqs"] });
    revalidateContentCache().catch(() => {});
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!form.question.trim() || !form.answer.trim())
        throw new Error("Question and answer are required.");
      if (editing) {
        const { error } = await supabase
          .from("faqs")
          .update(form)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("faqs")
          .insert({ ...form, display_order: rows.length });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      setOpen(false);
      toast.success(editing ? "FAQ updated" : "FAQ added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (row: FaqRow) => {
      const { error } = await supabase
        .from("faqs")
        .update({ is_visible: !row.is_visible })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: async ({ row, dir }: { row: FaqRow; dir: -1 | 1 }) => {
      const sorted = [...rows].sort((a, b) => a.display_order - b.display_order);
      const idx = sorted.findIndex((r) => r.id === row.id);
      const swap = sorted[idx + dir];
      if (!swap) return;
      await Promise.all([
        supabase.from("faqs").update({ display_order: swap.display_order }).eq("id", row.id),
        supabase.from("faqs").update({ display_order: row.display_order }).eq("id", swap.id),
      ]);
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast.success("FAQ deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };
  const openEdit = (row: FaqRow) => {
    setEditing(row);
    setForm({
      question: row.question,
      answer: row.answer,
      category: row.category,
      is_visible: row.is_visible,
    });
    setOpen(true);
  };

  const sorted = [...rows].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">FAQs</h1>
          <p className="mt-1 text-sm text-earth/60">
            Shown on the homepage FAQ section and in FAQ structured data.
          </p>
        </div>
        <Button onClick={openNew} className="bg-forest hover:bg-canopy" data-testid="faq-new">
          <Plus className="mr-2 h-4 w-4" />
          New FAQ
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
          No FAQs yet.
        </div>
      ) : (
        <div className="space-y-2" data-testid="faq-list">
          {sorted.map((row, i) => (
            <div
              key={row.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex flex-col pt-1">
                <button
                  className="text-earth/30 hover:text-forest disabled:opacity-30"
                  disabled={i === 0}
                  onClick={() => reorder.mutate({ row, dir: -1 })}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  className="text-earth/30 hover:text-forest disabled:opacity-30"
                  disabled={i === sorted.length - 1}
                  onClick={() => reorder.mutate({ row, dir: 1 })}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-forest">{row.question}</p>
                  {!row.is_visible && (
                    <Badge className="bg-gray-100 text-gray-600">Hidden</Badge>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-earth/60">{row.answer}</p>
              </div>
              <div className="flex items-center gap-1">
                <Switch
                  checked={row.is_visible}
                  onCheckedChange={() => toggle.mutate(row)}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
                  <Pencil className="h-4 w-4 text-earth/60" />
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
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit FAQ" : "New FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Question</Label>
              <Input
                data-testid="faq-question"
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Answer</Label>
              <Textarea
                data-testid="faq-answer"
                rows={4}
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <Label>Category</Label>
                <Input
                  data-testid="faq-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 pt-6 text-sm">
                <Switch
                  checked={form.is_visible}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_visible: v }))}
                />
                Visible
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-forest hover:bg-canopy"
              disabled={save.isPending}
              onClick={() => save.mutate()}
              data-testid="faq-save"
            >
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
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
