import Script from "next/script";
import { siteConfig } from "@/config";
import { getSiteSettings } from "@/lib/settings";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";

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
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
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
