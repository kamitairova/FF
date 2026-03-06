import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../api/endpoints";
import { useAuth } from "../../auth/AuthProvider";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Spinner } from "../../components/Spinner";
import { Centered } from "../../components/Centered";
import "../../components/ui.css";

type Item = { id: string; name: string };

function CrudBlock({
  title,
  listKey,
  list,
  create,
  update,
  del
}: {
  title: string;
  listKey: string;
  list: () => Promise<{ data: Item[] } | any>;
  create: (name: string) => Promise<any>;
  update: (id: string, name: string) => Promise<any>;
  del: (id: string) => Promise<any>;
}) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: [listKey],
    queryFn: list
  });

  const [newName, setNewName] = useState("");

  const createMut = useMutation({
    mutationFn: async () => create(newName.trim()),
    onSuccess: () => {
      setNewName("");
      qc.invalidateQueries({ queryKey: [listKey] });
    }
  });

  const updMut = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => update(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: [listKey] })
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => del(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [listKey] })
  });

  if (q.isLoading) return <div className="card card-pad"><Spinner /></div>;
  if (q.isError) return <div className="card card-pad">Ошибка: {(q.error as any)?.message}</div>;

  const items: Item[] = (q.data?.data ?? q.data ?? []).data ?? q.data?.data ?? q.data?.items ?? q.data?.data ?? q.data?.data?.data ?? q.data?.data;
  const normalized = Array.isArray(items) ? items : (q.data?.data ?? []);

  return (
    <div className="card card-pad">
      <div className="split">
        <div>
          <h2 className="h2">{title}</h2>
          <p className="p" style={{ marginTop: 6 }}>CRUD по админским эндпоинтам.</p>
        </div>
        <div className="toolbar">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Название" style={{ width: 220 }} />
          <Button variant="primary" disabled={!newName.trim() || createMut.isPending} onClick={() => createMut.mutate()}>
            Добавить
          </Button>
        </div>
      </div>

      <div className="hr" style={{ margin: "14px 0" }} />

      <div className="grid" style={{ gap: 10 }}>
        {normalized.length === 0 ? (
          <div className="small">Пока пусто.</div>
        ) : normalized.map((it) => (
          <TaxRow
            key={it.id}
            item={it}
            onSave={(name) => updMut.mutate({ id: it.id, name })}
            onDelete={() => delMut.mutate(it.id)}
            busy={updMut.isPending || delMut.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function TaxRow({ item, onSave, onDelete, busy }: { item: Item; onSave: (name: string) => void; onDelete: () => void; busy: boolean }) {
  const [name, setName] = useState(item.name);
  useEffect(() => setName(item.name), [item.name]);
  return (
    <div className="surface" style={{ padding: 12, display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ flex: 1, display: "flex", gap: 10, alignItems: "center" }}>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <span className="small" style={{ minWidth: 140 }}>id: {item.id.slice(0, 8)}…</span>
      </div>
      <div className="toolbar">
        <Button disabled={busy || name.trim() === item.name} onClick={() => onSave(name.trim())}>Сохранить</Button>
        <Button variant="danger" disabled={busy} onClick={onDelete}>Удалить</Button>
      </div>
    </div>
  );
}

export function AdminTaxonomyPage() {
  const { token } = useAuth();
  if (!token) return <Centered title="Нет токена">Войдите как админ.</Centered>;

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="surface card-pad">
        <h1 className="h1">Категории и теги</h1>
        <p className="p" style={{ marginTop: 6 }}>
          Управление таксономией через /api/admin/categories и /api/admin/tags.
        </p>
      </div>

      <CrudBlock
        title="Категории"
        listKey="adminCategories"
        list={() => adminApi.listCategories(token)}
        create={(name) => adminApi.createCategory(token, { name })}
        update={(id, name) => adminApi.updateCategory(token, id, { name })}
        del={(id) => adminApi.deleteCategory(token, id)}
      />

      <CrudBlock
        title="Теги"
        listKey="adminTags"
        list={() => adminApi.listTags(token)}
        create={(name) => adminApi.createTag(token, { name })}
        update={(id, name) => adminApi.updateTag(token, id, { name })}
        del={(id) => adminApi.deleteTag(token, id)}
      />
    </div>
  );
}
