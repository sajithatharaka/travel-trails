import { Server, Globe, Mail, Database, Search, Cloud } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

type Service = {
  name: string;
  icon: React.ElementType;
  description: string;
  detail: string;
};

const SERVICES: Service[] = [
  {
    name: "Supabase",
    icon: Database,
    description:
      "PostgreSQL database, authentication, file storage (the `media` bucket) and Edge Functions.",
    detail:
      "Migrations live in supabase/migrations/ and are applied with `npm run deploy:supabase` (scripts/deploy-supabase.sh) or `supabase db push`.",
  },
  {
    name: "Vercel",
    icon: Cloud,
    description: "Hosts the Next.js app; deploys on push.",
    detail:
      "Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_TURNSTILE_SITE_KEY.",
  },
  {
    name: "Cloudflare Turnstile",
    icon: Server,
    description: "Bot protection on the enquiry and contact forms.",
    detail:
      "Site key is a Vercel env var; TURNSTILE_SECRET_KEY is a Supabase Function secret (`supabase secrets set`). Fail-closed: forms reject every submission if the secret is unset.",
  },
  {
    name: "Resend",
    icon: Mail,
    description:
      "Transactional email for admin notifications (new enquiry / contact / booking status).",
    detail:
      "Secrets on Supabase: RESEND_API_KEY and NOTIFICATION_FROM_EMAIL (e.g. notification@traveltrails.agency). Recipients are managed under Notifications.",
  },
  {
    name: "Google Analytics / Search Console",
    icon: Search,
    description: "Traffic and search-performance reporting.",
    detail:
      "Reuses the shared master account software.treetrails@gmail.com.",
  },
  {
    name: "Domain registrar",
    icon: Globe,
    description: "DNS and renewal for traveltrails.agency.",
    detail: "Managed alongside the Tree Trails domains.",
  },
];

export default async function TechnicalNotesPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-forest">Technical Notes</h1>
          <Badge variant="secondary" className="text-xs">
            Admin only
          </Badge>
        </div>
        <p className="mt-1 text-earth/60">
          Third-party services and infrastructure behind the Travel Trails
          platform. Keep confidential.
        </p>
      </div>

      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
          First admin
        </p>
        <p className="font-mono text-sm font-medium text-amber-900">
          sajithatharaka@gmail.com
        </p>
        <p className="mt-1 text-xs text-amber-700">
          Seeded as admin by the profiles migration. Other accounts are created
          under Users.
        </p>
      </div>

      <div className="space-y-4">
        {SERVICES.map(({ name, icon: Icon, description, detail }) => (
          <div
            key={name}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 rounded-md bg-forest/10 p-1.5">
                <Icon className="h-4 w-4 text-forest" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-forest">{name}</p>
                <p className="mt-1 text-sm leading-relaxed text-earth/70">
                  {description}
                </p>
                <p className="mt-2 text-sm text-earth/60">{detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
