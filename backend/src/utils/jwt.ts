import jwt, { Secret } from "jsonwebtoken";

export type JwtRole = "USER" | "COMPANY" | "ADMIN";

export type JwtPayload = {
  userId: string;
  role: JwtRole;
};
const JWT_SECRET: Secret = (() => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
})();

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }

  const p = decoded as jwt.JwtPayload;

  const userId = p.userId;
  const role = p.role;

  if (typeof userId !== "string") throw new Error("Invalid token payload: userId");
if (role !== "USER" && role !== "COMPANY" && role !== "ADMIN") {
  throw new Error("Invalid token payload: role");
}
  return { userId, role };
}