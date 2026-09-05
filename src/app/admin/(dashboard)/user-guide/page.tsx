import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const GUIDE: { title: string; body: string }[] = [
  {
    title: "Tours",
    body: "Create and edit the tour packages shown on the site. The tour marked “Featured” drives the homepage hero, route and day-by-day itinerary. Use the day and route sub-editors inside a tour; “Publish” makes it live, and reorder controls set the order on /tours.",
  },
  {
    title: "Booking Requests",
    body: "Enquiries from the tour and homepage forms land here. Open one to see the full message, then Confirm or Cancel — that saves the status and emails the traveller (via Notifications recipients).",
  },
  {
    title: "Contacts",
    body: "Messages from the /contact form. Open to read, reply by email, or delete.",
  },
  {
    title: "Gallery",
    body: "Photos in the homepage gallery ticker. Upload, set alt text, reorder, hide/show, or delete.",
  },
  {
    title: "Blog",
    body: "Write posts in Markdown with a live preview. Set a cover image, excerpt and SEO fields. Drafts stay hidden until you toggle “Published”.",
  },
  {
    title: "FAQs",
    body: "Questions shown on the homepage FAQ section and in FAQ structured data. Reorder and hide/show individual entries.",
  },
  {
    title: "Welcome Section",
    body: "The homepage “About” block. The first active variant is used; any empty field falls back to the built-in copy.",
  },
  {
    title: "Reviews",
    body: "Traveller reviews for the homepage testimonials. Set the rating, source and location; hide any you don’t want shown.",
  },
  {
    title: "Site Settings",
    body: "Brand name, contact details and footer copy shown across the public site. Changes appear within a minute of saving.",
  },
  {
    title: "Notifications (admin only)",
    body: "Email addresses that receive alerts for new enquiries, contact messages and booking status changes. Deactivate an address to stop emailing it without deleting it.",
  },
  {
    title: "Users (admin only)",
    body: "Add teammates and set their role. Admins can do everything; tour designers can do everything except Users, Notifications and Technical Notes.",
  },
];

export default function UserGuidePage() {
  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">User Guide</h1>
        <p className="mt-1 text-sm text-earth/60">
          What each section does and how it maps to the public site.
        </p>
      </div>
      <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-4">
        {GUIDE.map((g) => (
          <AccordionItem key={g.title} value={g.title}>
            <AccordionTrigger className="text-left text-sm font-semibold text-forest">
              {g.title}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-earth/70">
              {g.body}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
