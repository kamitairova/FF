import React from "react";
import { Button } from "./Button";

export function Pagination({
  page,
  pageSize,
  total,
  onPage
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < pages;
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", paddingTop: 10 }}>
      <div style={{ color: "var(--muted)", fontWeight: 700, fontSize: 13 }}>
        Страница <b style={{ color: "var(--text)" }}>{page}</b> из <b style={{ color: "var(--text)" }}>{pages}</b>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button disabled={!canPrev} onClick={() => onPage(page - 1)}>Назад</Button>
        <Button disabled={!canNext} onClick={() => onPage(page + 1)}>Вперёд</Button>
      </div>
    </div>
  );
}
