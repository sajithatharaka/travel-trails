import { requireSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireSession();
  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
