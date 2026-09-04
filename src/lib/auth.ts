import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow, Role } from "@/lib/supabase/database.types";

export type SessionContext = {
  user: User;
  profile: ProfileRow | null;
  role: Role;
  isAdmin: boolean;
};

/** Current auth user, or null. */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/** Resolve the signed-in user + their profile row. Null if not signed in. */
export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const role: Role =
    profile?.role ??
    ((user.app_metadata?.role as Role | undefined) ?? "tour_designer");

  return { user, profile: profile ?? null, role, isAdmin: role === "admin" };
}

/** Require any signed-in team member. Redirects to the login page otherwise. */
export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Require an admin. Non-admins are bounced to the dashboard. */
export async function requireAdmin(): Promise<SessionContext> {
  const session = await requireSession();
  if (!session.isAdmin) redirect("/admin");
  return session;
}
