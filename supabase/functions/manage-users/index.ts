// Admin-only user management. Verifies the caller's JWT role === 'admin',
// then performs create / delete / update-role with the service role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Role = "admin" | "tour_designer";

type Action =
  | { action: "create"; email: string; password: string; full_name?: string; role: Role }
  | { action: "delete"; user_id: string }
  | { action: "update-role"; user_id: string; role: Role };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const asCaller = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const {
    data: { user },
    error: authErr,
  } = await asCaller.auth.getUser();
  if (authErr || !user) return json({ error: "Unauthorized" }, 401);
  if (user.app_metadata?.role !== "admin") {
    return json({ error: "Forbidden: admin only" }, 403);
  }

  let body: Action;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad request" }, 400);
  }

  const roles: Role[] = ["admin", "tour_designer"];

  if (body.action === "create") {
    const { email, password, full_name, role = "tour_designer" } = body;
    if (!email || !password) return json({ error: "email and password required" }, 400);
    if (!roles.includes(role)) return json({ error: "invalid role" }, 400);

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      app_metadata: { role },
      user_metadata: full_name ? { full_name } : undefined,
      email_confirm: true,
    });
    if (error) return json({ error: error.message }, 400);

    // The on_auth_user_created trigger inserts the profile; make sure the
    // role/name match what was requested (trigger defaults by email).
    await admin
      .from("profiles")
      .update({ role, full_name: full_name ?? null })
      .eq("user_id", data.user.id);
    await admin.auth.admin.updateUserById(data.user.id, {
      app_metadata: { role },
    });

    return json({ success: true, user_id: data.user.id });
  }

  if (body.action === "delete") {
    const { user_id } = body;
    if (!user_id) return json({ error: "user_id required" }, 400);
    if (user_id === user.id) return json({ error: "Cannot delete your own account" }, 400);

    const { error } = await admin.auth.admin.deleteUser(user_id);
    if (error) return json({ error: error.message }, 400);
    return json({ success: true });
  }

  if (body.action === "update-role") {
    const { user_id, role } = body;
    if (!user_id || !roles.includes(role)) return json({ error: "invalid payload" }, 400);
    if (user_id === user.id) return json({ error: "Cannot change your own role" }, 400);

    const { error } = await admin.auth.admin.updateUserById(user_id, {
      app_metadata: { role },
    });
    if (error) return json({ error: error.message }, 400);
    await admin.from("profiles").update({ role }).eq("user_id", user_id);
    return json({ success: true });
  }

  return json({ error: "Unknown action" }, 400);
});
