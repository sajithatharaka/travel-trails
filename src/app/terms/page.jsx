// src/app/terms/page.jsx
import LegalLayout from "@/components/LegalLayout";
import { siteConfig } from "../../../config";

const { brand, enquiry } = siteConfig;
const email = enquiry.contactDetails[0]?.label;

export const metadata = {
  title: "Terms & Conditions",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" lastUpdated="August 6, 2026">
      <h2>1. Booking your trip</h2>
      <p>
        Submitting an enquiry through this Site does not confirm a booking.
        A trip is confirmed once we've agreed your itinerary and dates and
        received the required deposit.
      </p>

      <h2>2. Pricing</h2>
      <p>
        Package prices shown on this Site are per person and based on the
        inclusions listed for each tier. Prices can change until a deposit
        is paid; once your booking is confirmed, the agreed price is
        locked in.
      </p>

      <h2>3. Payment</h2>
      <p>
        A deposit is required to secure your travel dates, with the
        remaining balance due before departure. Payment instructions are
        sent to you directly once your trip is confirmed.
      </p>

      <h2>4. Cancellations</h2>
      <ul>
        <li>More than 30 days before departure: deposit is refundable, less any non-recoverable costs already paid to third parties (hotels, transport).</li>
        <li>15–30 days before departure: 50% of the total trip cost is non-refundable.</li>
        <li>Less than 15 days before departure: the full trip cost is non-refundable.</li>
      </ul>
      <p>
        We recommend travel insurance that covers trip cancellation for
        unforeseen circumstances.
      </p>

      <h2>5. Changes to your itinerary</h2>
      <p>
        We'll always try to accommodate itinerary changes where possible.
        Changes requested close to departure may not be possible without
        additional cost, depending on availability with our accommodation
        and transport partners.
      </p>

      <h2>6. Your responsibilities</h2>
      <p>
        You're responsible for holding a valid passport, any required visa
        or Electronic Travel Authorization, and appropriate travel
        insurance for the duration of your trip.
      </p>

      <h2>7. Our liability</h2>
      <p>
        We take care in selecting our accommodation, transport and
        experience partners, but we aren't liable for circumstances beyond
        our reasonable control, including weather, government action, or
        acts of third parties.
      </p>

      <h2>8. Governing law</h2>
      <p>
        These terms are governed by the laws of Sri Lanka. {brand.name} is
        based in Colombo, Sri Lanka.
      </p>

      <h2>9. Contact us</h2>
      <p>
        Questions about these terms? Email us at{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </LegalLayout>
  );
}
