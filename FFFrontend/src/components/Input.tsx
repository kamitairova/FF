import React from "react";
import clsx from "clsx";
import "./ui.css";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx("input", className)} {...props} />;
}
