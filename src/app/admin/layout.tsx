import type { Metadata } from "next";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/admin/AuthProvider";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Travel Trails Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
