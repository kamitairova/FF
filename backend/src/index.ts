import express from "express";
import { prisma } from "./prisma";


const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/db-check", async (_req, res) => {
  // простой запрос к БД, чтобы убедиться, что всё реально работает
  const result = await prisma.user.findMany();
  res.json({ ok: true, usersCount: result.length });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
