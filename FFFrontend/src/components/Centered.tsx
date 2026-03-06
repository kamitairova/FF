import React from "react";
import "./ui.css";

export function Centered({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="container" style={{ padding: "40px 16px" }}>
      <div className="card card-pad" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        {title && <h1 className="h1" style={{ marginBottom: 10 }}>{title}</h1>}
        <div className="p">{children}</div>
      </div>
    </div>
  );
}
