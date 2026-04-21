import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({
  children,
  className = "",
  style,
  ...props
}: SelectProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <select
        {...props}
        className={className}
        style={{
          width: "100%",
          height: 44,
          padding: "0 40px 0 12px",
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          background: "#fff",
          color: "#0f172a",
          fontSize: 14,
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          cursor: "pointer",
          ...style,
        }}
      >
        {children}
      </select>

      <span
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "#64748b",
          fontSize: 14,
          lineHeight: 1,
        }}
      >
        ▼
      </span>
    </div>
  );
}