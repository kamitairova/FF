import React from "react";
import "./ui.css";

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="select" {...props} />;
}
