import Link from "next/link";
import { Map, CalendarCheck, MessageSquare, Images, Star, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function safeCount(
  fn: () => PromiseLike<{ count: number | null }>,
): Promise<number | null> {
  try {
    const { count } = await fn();
    return count ?? 0;
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [tours, publishedTours] = await Promise.all([
    safeCount(() =>
      supabase.from("tours").select("id", { count: "exact", head: true }),
    ),
    safeCount(() =>
      supabase
        .from("tours")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
    ),
  ]);

  const cards = [
    {
      label: "Tours",
      value: tours,
      hint: publishedTours != null ? `${publishedTours} published` : undefined,
      icon: Map,
      href: "/admin/tours",
      color: "text-forest",
    },
    { label: "Booking Requests", value: null, icon: CalendarCheck, href: "#", color: "text-amber-600", hint: "Phase 2" },
    { label: "Contact Messages", value: null, icon: MessageSquare, href: "#", color: "text-teal-600", hint: "Phase 2" },
    { label: "Gallery Photos", value: null, icon: Images, href: "#", color: "text-blue-600", hint: "Phase 3" },
    { label: "Published Posts", value: null, icon: BookOpen, href: "#", color: "text-purple-600", hint: "Phase 3" },
    { label: "Reviews", value: null, icon: Star, href: "#", color: "text-sand", hint: "Phase 3" },
  ];

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-forest">Dashboard</h1>
        <p className="mt-1 text-sm text-earth">
          Overview of your Travel Trails content
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, hint, icon: Icon, href, color }) => {
          const body = (
            <Card className={href === "#" ? "opacity-60" : "transition-shadow hover:shadow-md"}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm font-medium text-earth">
                  {label}
                  <Icon className={`h-4 w-4 ${color}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${color}`}>
                  {value ?? "—"}
                </p>
                {hint && <p className="mt-1 text-xs text-earth/60">{hint}</p>}
              </CardContent>
            </Card>
          );
          return href === "#" ? (
            <div key={label}>{body}</div>
          ) : (
            <Link key={label} href={href}>
              {body}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
