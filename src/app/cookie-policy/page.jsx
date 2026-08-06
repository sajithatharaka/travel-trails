// src/app/cookie-policy/page.jsx
import LegalLayout from "@/components/LegalLayout";
import { siteConfig } from "../../../config";

const { enquiry } = siteConfig;
const email = enquiry.contactDetails[0]?.label;

export const metadata = {
  title: "Cookie Policy",
  alternates: { canonical: "/cookie-policy" },
};

export default function CookiePolicyPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="August 6, 2026">
      <h2>1. What are cookies?</h2>
      <p>
        Cookies (and similar local browser storage) are small pieces of
        data stored on your device that let a website remember information
        between visits.
      </p>

      <h2>2. What we use</h2>
      <p>This Site keeps things deliberately minimal:</p>
      <ul>
        <li>
          <strong>Essential local storage</strong> — remembers whether
          you've accepted or declined this cookie notice, so it doesn't
          show again on your next visit.
        </li>
      </ul>
      <p>
        We don't run advertising cookies or third-party tracking scripts.
        If that changes in the future, this page will be updated to say so
        before anything new is added.
      </p>

      <h2>3. Third-party services</h2>
      <p>
        When you submit the trip enquiry form, your submission is sent
        directly to our form provider, Web3Forms, to deliver it to our
        inbox. Their use of cookies is governed by their own policy, not
        this one.
      </p>

      <h2>4. Managing your preference</h2>
      <p>
        You can accept or decline the cookie notice shown on your first
        visit. To change your choice later, clear your browser's local
        storage for this Site, or use your browser's cookie settings —
        the notice will then appear again.
      </p>

      <h2>5. Contact us</h2>
      <p>
        Questions about this policy? Email us at{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </LegalLayout>
  );
}
