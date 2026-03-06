import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { candidatesApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import { Link, useSearchParams } from "react-router-dom";
import "../../components/ui.css";

function buildQs(sp: URLSearchParams) {
  const next = new URLSearchParams();
  next.set("page", sp.get("page") ?? "1");
  next.set("pageSize", sp.get("pageSize") ?? "10");
  for (const k of ["q","location","experienceLevel","skills"]) {
    const v = sp.get(k);
    if (v) next.set(k, v);
  }
  return `?${next.toString()}`;
}

export function CompanyCandidatesPage() {
  const { token } = useAuth();
  const [sp, setSp] = useSearchParams();
  const [qDraft, setQDraft] = useState(sp.get("q") ?? "");

  const qs = useMemo(() => buildQs(sp), [sp]);

  const q = useQuery({
    queryKey: ["candidates", qs],
    queryFn: () => candidatesApi.search(token!, qs),
    enabled: !!token
  });

  const setField = (k: string, v: string) => {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v);
    else next.delete(k);
    next.set("page","1");
    if (!next.get("pageSize")) next.set("pageSize", "10");
    setSp(next);
  };

  if (q.isLoading) return <Centered><Spinner /></Centered>;
  if (q.isError) return <Centered title="Ошибка">{(q.error as any)?.message ?? "Не удалось загрузить кандидатов."}</Centered>;

  const data = q.data!;
  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <div className="split">
          <div>
            <h1 className="h1">Поиск кандидатов</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Фильтры: keyword (name/headline/skills), location, experience, skills/tags — согласно ТЗ.
            </p>
          </div>
          <div className="surface" style={{ padding: 10, display:"flex", gap:10, alignItems:"center" }}>
            <Input value={qDraft} onChange={(e)=>setQDraft(e.target.value)} placeholder="react, backend, analyst..." />
            <Button variant="primary" onClick={() => setField("q", qDraft.trim())}>Найти</Button>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: 12 }}>
          <div>
            <label className="label">Локация</label>
            <Input value={sp.get("location") ?? ""} onChange={(e) => setField("location", e.target.value)} />
          </div>
          <div>
            <label className="label">Уровень</label>
            <Select value={sp.get("experienceLevel") ?? ""} onChange={(e) => setField("experienceLevel", e.target.value)}>
              <option value="">Любой</option>
              <option value="intern">intern</option>
              <option value="junior">junior</option>
              <option value="middle">middle</option>
              <option value="senior">senior</option>
              <option value="lead">lead</option>
            </Select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Skills (через запятую)</label>
            <Input value={sp.get("skills") ?? ""} onChange={(e) => setField("skills", e.target.value)} placeholder="react, typescript, sql" />
          </div>
        </div>
      </div>

      {data.data.length === 0 ? (
        <div className="card card-pad">
          <h2 className="h2">Ничего не найдено</h2>
          <p className="p" style={{ marginTop: 6 }}>Измените фильтры и попробуйте снова.</p>
        </div>
      ) : (
        <div className="grid">
          {data.data.map((c) => (
            <Link key={c.id} to={`/company/candidates/${c.id}`} className="card card-pad">
              <div className="split">
                <div>
                  <div style={{ fontWeight: 900 }}>{c.fullName}</div>
                  <div className="small">{c.location} · {c.experienceLevel ?? "—"}</div>
                  <div className="badges" style={{ marginTop: 8 }}>
                    {(c.skills ?? []).slice(0, 10).map((s) => <span key={s} className="badge">{s}</span>)}
                  </div>
                </div>
                <div className="badge badge-blue">Открыть</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
