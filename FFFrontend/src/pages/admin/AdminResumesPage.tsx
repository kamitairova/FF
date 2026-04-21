import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import { useAuth } from "../../auth/AuthProvider";

type Resume = {
  id: number;
  title: string;
  desiredPosition?: string | null;
  status: string;
  skills?: string[];
  seekerProfile: {
    firstName: string;
    lastName?: string | null;
    location?: string | null;
  };
};

export default function AdminResumesPage() {
  const { token } = useAuth();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;

    setLoading(true);

    const res = await apiFetch<{ data: Resume[] }>(
      `/admin/resumes?status=${status}`,
      { token }
    );

    setResumes(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [status]);

  const approve = async (id: number) => {
    await apiFetch(`/admin/resumes/${id}/approve`, {
      method: "PATCH",
      token,
    });
    load();
  };

  const reject = async (id: number) => {
    await apiFetch(`/admin/resumes/${id}/reject`, {
      method: "PATCH",
      token,
    });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить резюме?")) return;

    await apiFetch(`/admin/resumes/${id}`, {
      method: "DELETE",
      token,
    });
    load();
  };

  if (loading) return <div className="surface card-pad">Загрузка...</div>;

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* HEADER КАК У ВАКАНСИЙ */}
      <div className="surface card-pad">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1>Модерация резюме</h1>
            <p>
              Pending — очередь на проверку. Approved — опубликованные. Rejected —
              отклонённые.
            </p>
          </div>

          <div>
            <label className="label">Раздел</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </div>
        </div>
      </div>

      {/* СПИСОК */}
      {resumes.map((r) => (
        <div key={r.id} className="surface card-pad">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3>{r.title}</h3>

              <p>{r.seekerProfile.location || "Без города"}</p>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 999,
                  display: "inline-block",
                  background: "#e2e8f0",
                }}
              >
                {r.status}
              </div>

              <p style={{ marginTop: 10 }}>
                {(r.skills || []).join(", ")}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              {/* PENDING */}
              {status === "PENDING" && (
                <>
                  <button className="btn-outline" onClick={() => approve(r.id)}>
                    Approve
                  </button>

                  <button className="btn-outline" onClick={() => reject(r.id)}>
                    Reject
                  </button>

                  <button className="btn-danger" onClick={() => remove(r.id)}>
                    Remove
                  </button>
                </>
              )}

              {/* APPROVED */}
              {status === "APPROVED" && (
                <>
                  <button className="btn-outline" onClick={() => reject(r.id)}>
                    Reject
                  </button>

                  <button className="btn-danger" onClick={() => remove(r.id)}>
                    Remove
                  </button>
                </>
              )}

              {/* REJECTED */}
              {status === "REJECTED" && (
                <>
                  <button className="btn-outline" onClick={() => approve(r.id)}>
                    Approve
                  </button>

                  <button className="btn-danger" onClick={() => remove(r.id)}>
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {!resumes.length && (
        <div className="surface card-pad">
          Ничего нет в этом разделе
        </div>
      )}
    </div>
  );
}