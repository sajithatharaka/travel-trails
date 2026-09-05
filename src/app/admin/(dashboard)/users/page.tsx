"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/admin/AuthProvider";
import RequireRole from "@/components/admin/RequireRole";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ProfileRow, Role } from "@/lib/supabase/database.types";

const supabase = createClient();

async function callManageUsers(body: object) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { data, error } = await supabase.functions.invoke("manage-users", {
    body,
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined,
  });
  const fnError = (data as { error?: string } | null)?.error;
  if (error || fnError) throw new Error(fnError || error?.message || "Request failed");
  return data;
}

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  tour_designer: "Tour designer",
};

function UsersInner() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "tour_designer" as Role,
  });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ProfileRow[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-profiles"] });

  const createUser = useMutation({
    mutationFn: () => callManageUsers({ action: "create", ...form }),
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      setForm({ email: "", full_name: "", password: "", role: "tour_designer" });
      toast.success("User created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRole = useMutation({
    mutationFn: ({ user_id, role }: { user_id: string; role: Role }) =>
      callManageUsers({ action: "update-role", user_id, role }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: (user_id: string) =>
      callManageUsers({ action: "delete", user_id }),
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast.success("User deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toDelete = profiles.find((p) => p.user_id === deleteId);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Users</h1>
          <p className="mt-1 text-sm text-earth/60">
            Team accounts and roles. Admins can manage everything; tour designers
            can do everything except this page, notifications and technical notes.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-forest hover:bg-canopy"
          data-testid="user-new"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add user
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-forest" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-earth/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map((p) => {
                const isSelf = p.user_id === user?.id;
                return (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        {p.full_name || <span className="italic text-earth/40">—</span>}
                        {isSelf && (
                          <Badge variant="secondary" className="py-0 text-xs">
                            You
                          </Badge>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-earth/70">{p.email}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={p.role}
                        disabled={isSelf || updateRole.isPending}
                        onValueChange={(role) =>
                          updateRole.mutate({ user_id: p.user_id, role: role as Role })
                        }
                      >
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">{ROLE_LABEL.admin}</SelectItem>
                          <SelectItem value="tour_designer">
                            {ROLE_LABEL.tour_designer}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-earth/40 hover:bg-red-50 hover:text-red-500"
                        disabled={isSelf}
                        onClick={() => setDeleteId(p.user_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                data-testid="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                data-testid="user-name"
                value={form.full_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, full_name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                data-testid="user-password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Min. 6 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(role) =>
                  setForm((f) => ({ ...f, role: role as Role }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tour_designer">
                    Tour designer — everything except user management
                  </SelectItem>
                  <SelectItem value="admin">
                    Admin — full access
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-forest hover:bg-canopy"
              disabled={
                createUser.isPending ||
                !form.email ||
                form.password.length < 6
              }
              onClick={() => createUser.mutate()}
              data-testid="user-create"
            >
              {createUser.isPending ? "Creating…" : "Create user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <strong>{toDelete?.email}</strong> and
              revokes their access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteUser.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireRole adminOnly>
      <UsersInner />
    </RequireRole>
  );
}
