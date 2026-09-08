import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);

export const adminRoles = ["boss", "shopmanager", "frame", "carpenter"] as const;

export type AdminRole = (typeof adminRoles)[number];

export type AdminSession = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

export async function signAdminToken(payload: AdminSession) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (
      typeof payload.id !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      !adminRoles.includes(payload.role as AdminRole)
    ) {
      return null;
    }

    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}