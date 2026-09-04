"use client";

import { ShieldOff } from "lucide-react";
import { useAuth } from "@/components/admin/AuthProvider";

/**
 * Client guard for admin-only pages. The server layout already blocks
 * signed-out users; this hides admin-only screens from a tour_designer.
 */
export default function RequireRole({
  adminOnly = false,
  children,
}: {
  adminOnly?: boolean;
  children: React.ReactNode;
}) {
  const { loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-forest" />
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-earth">
        <ShieldOff className="h-10 w-10 text-earth/40" />
        <h2 className="text-lg font-semibold">Access restricted</h2>
        <p className="text-sm text-earth/60">This page is only available to administrators.</p>
      </div>
    );
  }

  return <>{children}</>;
}
