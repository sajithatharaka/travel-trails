// src/app/privacy/page.jsx
import LegalLayout from "@/components/LegalLayout";
import { siteConfig } from "../../../config";

const { brand, enquiry } = siteConfig;
const email = enquiry.contactDetails[0]?.label;

export const metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="August 6, 2026">
      <h2>1. Who we are</h2>
      <p>
        {brand.name} ("we", "us", "our") plans private, boutique travel
        itineraries in Sri Lanka. This policy explains what information we
        collect through this website (the "Site"), how we use it, and the
        choices you have.
      </p>

      <h2>2. Information we collect</h2>
      <p>
        We only collect information you give us directly. When you submit
        the trip enquiry form, we receive your name, email address, travel
        dates, number of travellers and any message you include. We don't
        run a database or backend of our own — form submissions are emailed
        to us directly via our form provider, Web3Forms.
      </p>
      <p>
        We also use a small amount of local browser storage to remember
        your cookie preference (see our{" "}
        <a href="/cookie-policy">Cookie Policy</a>) — this stays on your
        device and isn't sent to us.
      </p>

      <h2>3. How we use your information</h2>
      <ul>
        <li>To respond to your trip enquiry and plan your itinerary.</li>
        <li>To communicate with you about your booking.</li>
        <li>To improve the content and accuracy of this Site.</li>
      </ul>
      <p>We do not sell or rent your personal information to third parties.</p>

      <h2>4. How your information is shared</h2>
      <p>
        Enquiry details are shared only with our form provider (Web3Forms)
        for the purpose of delivering your message to our inbox, and, once
        you confirm a booking, with the accommodation and transport
        partners needed to arrange your trip.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We keep enquiry and booking correspondence for as long as needed to
        provide our services and meet accounting or legal requirements,
        after which it's deleted.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can ask us to access, correct or delete the personal
        information we hold about you at any time by emailing{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>7. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The "Last
        updated" date at the top of this page reflects the latest revision.
      </p>

      <h2>8. Contact us</h2>
      <p>
        Questions about this policy? Email us at{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </LegalLayout>
  );
}
