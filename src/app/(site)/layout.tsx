import Script from "next/script";
import { siteConfig } from "@/config";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";

const { enquiry, cookieConsent } = siteConfig;

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        number={enquiry.whatsappNumber}
        message={enquiry.whatsappMessage}
      />
      <CookieConsent config={cookieConsent} />
    </>
  );
}
