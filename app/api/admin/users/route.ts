import { NextRequest, NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/database/drizzle";
import { admins } from "@/database/schema";
import { adminRoles } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";

async function requireBoss() {
  try {
    const session = await requireAdmin();
    return session.role === "boss" ? session : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await requireBoss();
  if (!session) return NextResponse.json({ error: "Boss access required" }, { status: 403 });

  const users = await db
    .select({ id: admins.id, name: admins.name, email: admins.email, role: admins.role, createdAt: admins.createdAt })
    .from(admins)
    .orderBy(admins.createdAt);

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await requireBoss();
  if (!session) return NextResponse.json({ error: "Boss access required" }, { status: 403 });

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role;

  if (!name || !email || !password || !adminRoles.includes(role)) {
    return NextResponse.json({ error: "Name, email, password, and a valid role are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const [existing] = await db.select({ id: admins.id }).from(admins).where(eq(admins.email, email)).limit(1);
  if (existing) return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(admins)
    .values({ name, email, passwordHash, role })
    .returning({ id: admins.id, name: admins.name, email: admins.email, role: admins.role });

  return NextResponse.json({ user }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await requireBoss();
  if (!session) return NextResponse.json({ error: "Boss access required" }, { status: 403 });

  const body = await req.json();
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "User id is required" }, { status: 400 });
  if (id === session.id) return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });

  const deleted = await db.delete(admins).where(and(eq(admins.id, id), ne(admins.id, session.id))).returning({ id: admins.id });
  if (!deleted.length) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}