"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Eye, Trash2, Check, Ban } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { notifyBookingStatusChange } from "@/lib/notify";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/components/admin/AuthProvider";
import type {
  BookingRequestRow,
  BookingStatus,
} from "@/lib/supabase/database.types";

const supabase = createClient();

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const FILTERS: (BookingStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "cancelled",
];

export default function AdminBookingsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [viewing, setViewing] = useState<BookingRequestRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["admin-booking-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookingRequestRow[];
    },
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered =
    filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const setStatus = useMutation({
    mutationFn: async ({
      row,
      status,
    }: {
      row: BookingRequestRow;
      status: Extract<BookingStatus, "confirmed" | "cancelled">;
    }) => {
      const { error } = await supabase
        .from("booking_requests")
        .update({
          status,
          handled_by: user?.id ?? null,
          handled_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (error) throw error;
      try {
        await notifyBookingStatusChange(row.id, status);
      } catch (e) {
        toast.warning(
          `Status saved, but the email failed: ${
            e instanceof Error ? e.message : "unknown error"
          }`,
        );
      }
    },
    onSuccess: (_d, { status }) => {
      qc.invalidateQueries({ queryKey: ["admin-booking-requests"] });
      setViewing(null);
      toast.success(`Marked ${status}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("booking_requests")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-booking-requests"] });
      setDeleteId(null);
      toast.success("Deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const fmtDate = (d: string | null) =>
    d ? format(new Date(d), "d MMM yyyy") : "—";

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">Booking Requests</h1>
        <p className="mt-1 text-sm text-earth/60">
          Enquiries from the tour and homepage forms. Confirm or cancel to email
          the traveller.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm capitalize transition-colors ${
              filter === f
                ? "bg-forest text-cream"
                : "bg-muted text-earth/70 hover:bg-muted/70"
            }`}
          >
            {f} {counts[f] != null && <span className="opacity-60">({counts[f]})</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-forest" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&rsquo;t load booking requests: {(error as Error).message}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-earth/60">
          No {filter === "all" ? "" : filter} booking requests.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-earth/60">
              <tr>
                <th className="px-4 py-3">Traveller</th>
                <th className="px-4 py-3">Tour</th>
                <th className="px-4 py-3">Travel date</th>
                <th className="px-4 py-3">Party</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-forest">
                      {r.first_name} {r.last_name}
                    </div>
                    <div className="text-xs text-earth/50">{r.email}</div>
                  </td>
                  <td className="px-4 py-3 text-earth/70">
                    {r.tour_title || "—"}
                  </td>
                  <td className="px-4 py-3 text-earth/70">
                    {fmtDate(r.travel_date)}
                  </td>
                  <td className="px-4 py-3 text-earth/70">
                    {r.travellers ?? r.adults + r.children}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_STYLES[r.status]}>{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-earth/60">
                    {fmtDate(r.created_at)}
                  </td>
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
            <DialogTitle>
              {viewing?.first_name} {viewing?.last_name}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <Detail label="Email" value={viewing.email} />
              <Detail label="Phone" value={viewing.phone || "—"} />
              <Detail label="Tour" value={viewing.tour_title || "Not specified"} />
              <Detail label="Travel date" value={fmtDate(viewing.travel_date)} />
              <Detail
                label="Party"
                value={
                  viewing.travellers
                    ? `${viewing.travellers} travellers`
                    : `${viewing.adults} adults · ${viewing.children} children`
                }
              />
              <Detail label="Status" value={viewing.status} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-earth/50">
                  Message
                </p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-earth/80">
                  {viewing.message || "—"}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={setStatus.isPending || viewing.status === "confirmed"}
                  onClick={() =>
                    setStatus.mutate({ row: viewing, status: "confirmed" })
                  }
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  disabled={setStatus.isPending || viewing.status === "cancelled"}
                  onClick={() =>
                    setStatus.mutate({ row: viewing, status: "cancelled" })
                  }
                >
                  <Ban className="mr-1.5 h-4 w-4" />
                  Cancel
                </Button>
              </div>
              <a
                href={`mailto:${viewing.email}`}
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
            <AlertDialogTitle>Delete this booking request?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the enquiry. It cannot be undone.
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-earth/50">
        {label}
      </span>
      <span className="text-right text-earth/80">{value}</span>
    </div>
  );
}
