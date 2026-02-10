"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("./prisma");
const app = (0, express_1.default)();
const PORT = 5000;
app.use(express_1.default.json());
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
app.get("/api/db-check", async (_req, res) => {
    // простой запрос к БД, чтобы убедиться, что всё реально работает
    const result = await prisma_1.prisma.user.findMany();
    res.json({ ok: true, usersCount: result.length });
});
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
