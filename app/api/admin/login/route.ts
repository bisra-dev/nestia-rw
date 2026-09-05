import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/database/drizzle"; // adjust to your actual db client export
import { admins } from "@/database/schema";
import { signAdminToken } from "@/lib/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);

  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatches) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signAdminToken({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });

  const res = NextResponse.json({
    success: true,
    admin: { id: admin.id, name: admin.name, role: admin.role },
  });

  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}