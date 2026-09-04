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
      <WhatsAppButton
        number={enquiry.whatsappNumber}
        message={enquiry.whatsappMessage}
      />
      <CookieConsent config={cookieConsent} />
    </>
  );
}
