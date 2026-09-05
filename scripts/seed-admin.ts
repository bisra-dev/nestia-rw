import bcrypt from "bcryptjs";
import { db } from "../database/drizzle";
import { admins } from "../database/schema";

async function seed() {
  const passwordHash = await bcrypt.hash("RWANDA@2026", 10);

  await db.insert(admins).values({
    name: "Israel Habimana",
    email: "admin@nestia.com",
    passwordHash,
    role: "admin",
  });

  console.log("Admin created.");
}

seed();