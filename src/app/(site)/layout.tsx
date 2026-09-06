import Script from "next/script";
import { siteConfig } from "@/config";
import { getSiteSettings } from "@/lib/settings";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";
import { HAS_TURNSTILE } from "@/lib/turnstile";

const { cookieConsent } = siteConfig;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      {children}
      {HAS_TURNSTILE && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      )}
      <WhatsAppButton
        number={settings.whatsapp_number}
        message={settings.whatsapp_message}
      />
      <CookieConsent config={cookieConsent} />
    </>
  );
}
