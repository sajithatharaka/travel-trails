"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  MessageSquare,
  Images,
  Star,
  BookOpen,
  CircleHelp,
  LayoutTemplate,
  Bell,
  Users,
  Server,
  Settings,
  BookMarked,
  LogOut,
  Menu,
  X,
  TreePine,
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/admin/AuthProvider";

type NavItem = { label: string; href: string; icon: React.ElementType; soon?: boolean };
type NavGroup = {
  label: string;
  items: NavItem[];
  adminOnly?: boolean;
  defaultOpen?: boolean;
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    defaultOpen: true,
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    defaultOpen: true,
    items: [
      { label: "Tours", href: "/admin/tours", icon: Map },
      { label: "Gallery", href: "/admin/gallery", icon: Images, soon: true },
      { label: "Blog", href: "/admin/blog", icon: BookOpen, soon: true },
      { label: "FAQs", href: "/admin/faqs", icon: CircleHelp, soon: true },
      {
        label: "Welcome Section",
        href: "/admin/welcome-section",
        icon: LayoutTemplate,
        soon: true,
      },
      { label: "Reviews", href: "/admin/reviews", icon: Star, soon: true },
    ],
  },
  {
    label: "Operations",
    defaultOpen: true,
    items: [
      { label: "Booking Requests", href: "/admin/bookings", icon: CalendarCheck },
      { label: "Contacts", href: "/admin/contacts", icon: MessageSquare },
    ],
  },
  {
    label: "Settings",
    defaultOpen: false,
    items: [
      { label: "Site Settings", href: "/admin/settings", icon: Settings, soon: true },
      { label: "Notifications", href: "/admin/notifications", icon: Bell, soon: true, },
      { label: "Users", href: "/admin/users", icon: Users, soon: true },
      {
        label: "Technical Notes",
        href: "/admin/technical-notes",
        icon: Server,
        soon: true,
      },
    ],
  },
];

const SUPPORT: NavItem[] = [
  { label: "User Guide", href: "/admin/user-guide", icon: BookMarked, soon: true },
];

function NavGroupSection({
  group,
  onNavigate,
}: {
  group: NavGroup;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(group.defaultOpen ?? true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-cream/40 transition-colors hover:text-cream/70">
        {group.label}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5">
        {group.items.map(({ label, href, icon: Icon, soon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={soon ? "#" : href}
              onClick={soon ? (e) => e.preventDefault() : onNavigate}
              aria-disabled={soon}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-cream/15 font-medium text-cream"
                  : "text-cream/60 hover:bg-cream/10 hover:text-cream"
              } ${soon ? "cursor-default opacity-40 hover:bg-transparent" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {soon && (
                <span className="text-[10px] uppercase tracking-wide text-cream/40">
                  soon
                </span>
              )}
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const Sidebar = () => (
    <>
      <nav className="flex-1 space-y-2 overflow-y-auto p-3">
        {NAV_GROUPS.map((group) => (
          <NavGroupSection
            key={group.label}
            group={group}
            onNavigate={closeMobile}
          />
        ))}
        <div className="space-y-0.5 border-t border-cream/10 pt-2">
          {SUPPORT.map(({ label, href, icon: Icon }) => (
            <span
              key={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream/40"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              <span className="ml-auto text-[10px] uppercase">soon</span>
            </span>
          ))}
        </div>
      </nav>
      <div className="border-t border-cream/10 p-3">
        <p className="mb-2 truncate px-3 text-xs text-cream/40">{email}</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-cream/60 hover:bg-cream/10 hover:text-cream"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-60 shrink-0 flex-col bg-forest text-cream md:flex">
        <div className="flex items-center gap-2 border-b border-cream/10 px-5 py-5">
          <TreePine className="h-6 w-6 text-sand" />
          <div>
            <p className="text-sm font-semibold leading-tight">Travel Trails</p>
            <p className="text-xs text-cream/50">Admin Panel</p>
          </div>
        </div>
        <Sidebar />
      </aside>

      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-cream/10 bg-forest px-4 text-cream md:hidden">
        <div className="flex items-center gap-2">
          <TreePine className="h-5 w-5 text-sand" />
          <span className="text-sm font-semibold">Travel Trails Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-1.5 text-cream/70 hover:bg-cream/10 hover:text-cream"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={closeMobile}
          />
          <aside className="fixed bottom-0 left-0 top-14 z-40 flex w-64 flex-col bg-forest text-cream shadow-xl md:hidden">
            <Sidebar />
          </aside>
        </>
      )}

      <main className="mt-14 flex-1 overflow-auto md:mt-0">{children}</main>
    </div>
  );
}
