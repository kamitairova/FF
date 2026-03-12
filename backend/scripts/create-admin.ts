import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = bcrypt.hashSync("12345678", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      role: "ADMIN",
      isDisabled: false,
      password: hash,
    },
    create: {
      email: "admin@example.com",
      password: hash,
      role: "ADMIN",
      isDisabled: false,
    },
  });

  console.log("Admin ready:", user.email, user.role);
}

main()
  .catch((e) => {
    console.error("Create admin failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });