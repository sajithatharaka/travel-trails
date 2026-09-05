"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import RequireRole from "@/components/admin/RequireRole";
import type { NotificationRecipientRow } from "@/lib/supabase/database.types";

const supabase = createClient();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function NotificationsInner() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ["admin-notification-recipients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_recipients")
        .select("id, created_at, email, is_active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as NotificationRecipientRow[];
    },
  });

  const normalized = useMemo(() => email.trim().toLowerCase(), [email]);
  const valid = EMAIL_RE.test(normalized);
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["admin-notification-recipients"] });

  const add = useMutation({
    mutationFn: async (value: string) => {
      const { error } = await supabase
        .from("notification_recipients")
        .insert({ email: value, is_active: true });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setEmail("");
      toast.success("Recipient added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("notification_recipients")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notification_recipients")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Recipient removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">Notifications</h1>
        <p className="mt-1 text-sm text-earth/60">
          Emails that receive alerts for new booking enquiries, contact messages
          and confirmed / cancelled bookings.
        </p>
      </div>

      <section className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <Mail className="h-4 w-4 text-forest" />
          <h2 className="font-semibold text-forest">Add recipient</h2>
        </div>
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <Label htmlFor="recipient-email">Email</Label>
            <Input
              id="recipient-email"
              data-testid="recipient-email"
              type="email"
              placeholder="alerts@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            onClick={() => add.mutate(normalized)}
            disabled={!valid || add.isPending}
            className="bg-forest hover:bg-canopy"
            data-testid="recipient-add"
          >
            {add.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add
          </Button>
        </div>
        {email && !valid && (
          <p className="mt-2 text-xs text-destructive">Enter a valid email address.</p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-forest">Recipients</h2>
          <p className="text-xs text-earth/60">{recipients.length} total</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-forest" />
          </div>
        ) : recipients.length === 0 ? (
          <p className="py-10 text-center text-sm text-earth/60">
            No recipients yet — no one is being emailed.
          </p>
        ) : (
          <div className="space-y-2" data-testid="recipient-list">
            {recipients.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-forest">
                    {r.email}
                  </p>
                </div>
                <Badge
                  className={
                    r.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }
                >
                  {r.is_active ? "Active" : "Inactive"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toggle.mutate({ id: r.id, is_active: !r.is_active })
                  }
                >
                  {r.is_active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => remove.mutate(r.id)}
                  aria-label={`Remove ${r.email}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminNotificationsPage() {
  return (
    <RequireRole adminOnly>
      <NotificationsInner />
    </RequireRole>
  );
}
