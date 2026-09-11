"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidateSettingsCache } from "../content-actions";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const supabase = createClient();

const FIELDS: {
  key: string;
  label: string;
  hint?: string;
  multiline?: boolean;
}[] = [
  { key: "brand_name", label: "Brand name" },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "contact_address", label: "Contact address" },
  {
    key: "whatsapp_number",
    label: "WhatsApp number",
    hint: "Digits only — country code, no +, spaces or leading zero.",
  },
  { key: "whatsapp_message", label: "WhatsApp pre-filled message", multiline: true },
  { key: "footer_description", label: "Footer description", multiline: true },
  { key: "footer_group_note", label: "Footer group note", multiline: true },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");
      if (error) throw error;
      return data as { key: string; value: unknown }[];
    },
  });

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const row of data) {
      next[row.key] = typeof row.value === "string" ? row.value : "";
    }
    setValues(next);
  }, [data]);

  async function handleSave() {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const rows = FIELDS.map((f) => ({
        key: f.key,
        value: values[f.key] ?? "",
        updated_at: now,
      }));
      const { error } = await supabase
        .from("site_settings")
        .upsert(rows, { onConflict: "key" });
      if (error) throw error;
      await revalidateSettingsCache().catch(() => {});
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Site Settings</h1>
          <p className="mt-1 text-sm text-earth/60">
            Brand and contact details shown across the public site.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || isLoading}
          className="bg-forest hover:bg-canopy"
          data-testid="settings-save"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
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
      ) : (
        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.multiline ? (
                <Textarea
                  id={f.key}
                  data-testid={`settings-${f.key}`}
                  rows={2}
                  value={values[f.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.key]: e.target.value }))
                  }
                />
              ) : (
                <Input
                  id={f.key}
                  data-testid={`settings-${f.key}`}
                  value={values[f.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.key]: e.target.value }))
                  }
                />
              )}
              {f.hint && <p className="text-xs text-earth/50">{f.hint}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
