import React from "react";

export function Spinner() {
  return (
    <div aria-label="loading" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          border: "2px solid var(--border)",
          borderTopColor: "var(--primary)",
          animation: "spin 0.8s linear infinite"
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ color: "var(--muted)", fontWeight: 700 }}>Загрузка…</span>
    </div>
  );
}
