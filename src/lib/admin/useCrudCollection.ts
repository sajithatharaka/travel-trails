"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/sonner";

// This hook operates on a table name chosen at runtime, so the generated
// Database types can't narrow it — use an untyped client here on purpose.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createClient() as any;

type Row = { id: string; display_order?: number };

/**
 * Shared list + create/update/delete/toggle/reorder wiring for the simple
 * admin content collections (FAQ, reviews, gallery, welcome sections).
 */
export function useCrudCollection<T extends Row>(opts: {
  table: string;
  queryKey: string;
  orderBy?: string;
  visibleField?: "is_visible" | "is_active";
  revalidate?: () => Promise<unknown>;
}) {
  const { table, queryKey, orderBy = "display_order", visibleField } = opts;
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderBy, { ascending: true });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });

  const rows = list.data ?? [];

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: [queryKey] });
    opts.revalidate?.().catch(() => {});
  };

  const save = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: Record<string, unknown>;
    }) => {
      if (id) {
        const { error } = await supabase.from(table).update(values).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .insert({ ...values, [orderBy]: rows.length });
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleVisible = useMutation({
    mutationFn: async (row: T) => {
      if (!visibleField) return;
      const { error } = await supabase
        .from(table)
        .update({ [visibleField]: !(row as Record<string, unknown>)[visibleField] })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: async ({ row, dir }: { row: T; dir: -1 | 1 }) => {
      const sorted = [...rows].sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
      );
      const idx = sorted.findIndex((r) => r.id === row.id);
      const swap = sorted[idx + dir];
      if (!swap) return;
      await Promise.all([
        supabase
          .from(table)
          .update({ [orderBy]: swap.display_order })
          .eq("id", row.id),
        supabase
          .from(table)
          .update({ [orderBy]: row.display_order })
          .eq("id", swap.id),
      ]);
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...list, rows, save, remove, toggleVisible, reorder, invalidate };
}
