import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthCard } from "./AuthCard";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { useAuth } from "../../auth/AuthProvider";
import { FieldError } from "../../components/FieldError";
import { ApiError, UserRole } from "../../api/types";

export function RegisterPage() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>("JOB_SEEKER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <AuthCard title="Создание аккаунта">
      <div className="grid">
        <div>
          <label className="label">Роль</label>
          <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="JOB_SEEKER">Соискатель</option>
            <option value="COMPANY">Компания / рекрутер</option>
          </Select>
        </div>

        <div>
          <label className="label">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <FieldError error={err?.details?.email} />
        </div>

        <div>
          <label className="label">Пароль</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Не менее 6 символов" />
          <FieldError error={err?.details?.password} />
        </div>

        {err && !err.details && <div className="badge">{err.message}</div>}

        <Button
          variant="primary"
          onClick={async () => {
            setLoading(true);
            setErr(null);
            try {
              await register(email.trim(), password, role);
              nav("/", { replace: true });
            } catch (e: any) {
              setErr(e);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Создаём…" : "Создать аккаунт"}
        </Button>

        <div className="small">
          Уже есть аккаунт? <Link to="/login" style={{ color: "#fff", fontWeight: 800 }}>Войти</Link>
        </div>
      </div>
    </AuthCard>
  );
}
