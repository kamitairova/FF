import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { AuthCard } from "./AuthCard";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useAuth } from "../../auth/AuthProvider";
import { FieldError } from "../../components/FieldError";
import { ApiError } from "../../api/types";

export function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const from = loc?.state?.from ?? "/";

  return (
    <AuthCard title="Вход">
      <div className="grid">
        <div>
          <label className="label">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <FieldError err={err} field="email" />
        </div>
        <div>
          <label className="label">Пароль</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <FieldError err={err} field="password" />
        </div>

        {err && !err.details && (
          <div style={{ color: "var(--danger)", fontWeight: 800 }}>{err.message}</div>
        )}

        <Button
          variant="primary"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setErr(null);
            try {
              await login(email.trim(), password);
              nav(from, { replace: true });
            } catch (e: any) {
              setErr(e);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Входим…" : "Войти"}
        </Button>

        <div className="small">
          Нет аккаунта? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 800 }}>Зарегистрироваться</Link>
        </div>
      </div>
    </AuthCard>
  );
}
