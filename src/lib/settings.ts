import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";
import { siteConfig } from "@/config";
import { mergeSettings } from "@/lib/format";

export const SETTINGS_TAG = "site-settings";

export type SiteSettings = {
  brand_name: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  whatsapp_number: string;
  whatsapp_message: string;
  footer_description: string;
  footer_group_note: string;
};

/** The keys the admin form manages, with config.ts as the fallback source. */
export const SETTINGS_DEFAULTS: SiteSettings = {
  brand_name: siteConfig.brand.name,
  contact_email: siteConfig.enquiry.contactDetails[0]?.label ?? "",
  contact_phone: siteConfig.enquiry.contactDetails[1]?.label ?? "",
  contact_address: siteConfig.enquiry.contactDetails[2]?.label ?? "",
  whatsapp_number: siteConfig.enquiry.whatsappNumber,
  whatsapp_message: siteConfig.enquiry.whatsappMessage,
  footer_description: siteConfig.footer.description,
  footer_group_note: siteConfig.footer.groupNote,
};

const load = unstable_cache(
  async (): Promise<Partial<Record<string, unknown>>> => {
    try {
      const { data, error } = await supabasePublic
        .from("site_settings")
        .select("key, value");
      if (error) {
        console.error("[settings]", error.message);
        return {};
      }
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    } catch (e) {
      console.error("[settings]", e);
      return {};
    }
  },
  ["site-settings"],
  { tags: [SETTINGS_TAG], revalidate: 3600 },
);

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const raw = await load();
  return mergeSettings(SETTINGS_DEFAULTS, raw);
});
