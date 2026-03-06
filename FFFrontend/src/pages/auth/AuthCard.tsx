import React from "react";
import "../../components/ui.css";

export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container" style={{ padding: "40px 16px" }}>
      <div className="card card-pad" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1 className="h1">{title}</h1>
        <div style={{ marginTop: 14 }}>{children}</div>
      </div>
    </div>
  );
}
