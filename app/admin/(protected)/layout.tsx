import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/session";
import AdminLayoutClient from "./AdminLayoutClient";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifyAdminToken(token) : null;

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminLayoutClient role={session?.role ?? null}>{children}</AdminLayoutClient>;
}