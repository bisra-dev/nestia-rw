import { cookies } from "next/headers";
import { verifyAdminToken, type AdminSession } from "./auth";

const COOKIE_NAME = "admin_session";

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

export const CLIENT_COOKIE_NAME = "client_session";