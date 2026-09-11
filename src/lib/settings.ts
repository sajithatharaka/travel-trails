import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";
import { siteConfig } from "@/config";
import { mergeSettings, parseHeroImages } from "@/lib/format";

export const SETTINGS_TAG = "site-settings";

/** Free-text keys managed by the admin form, merged over config.ts defaults. */
export type SiteSettingsText = {
  brand_name: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  whatsapp_number: string;
  whatsapp_message: string;
  footer_description: string;
  footer_group_note: string;
};

export type SiteSettings = SiteSettingsText & {
  /** Homepage hero slideshow — public image URLs, in display order. */
  hero_images: string[];
};

/** The string keys the admin form manages, with config.ts as the fallback. */
export const SETTINGS_TEXT_DEFAULTS: SiteSettingsText = {
  brand_name: siteConfig.brand.name,
  contact_email: siteConfig.contact.email,
  contact_phone: siteConfig.contact.phone,
  contact_address: siteConfig.contact.addressLine,
  whatsapp_number: siteConfig.enquiry.whatsappNumber,
  whatsapp_message: siteConfig.enquiry.whatsappMessage,
  footer_description: siteConfig.footer.description,
  footer_group_note: siteConfig.footer.groupNote,
};

export const SETTINGS_DEFAULTS: SiteSettings = {
  ...SETTINGS_TEXT_DEFAULTS,
  hero_images: [],
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
  return {
    ...mergeSettings(SETTINGS_TEXT_DEFAULTS, raw),
    hero_images: parseHeroImages(raw.hero_images),
  };
});
