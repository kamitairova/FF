import React from "react";
import clsx from "clsx";
import "./ui.css";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx("textarea", className)} {...props} />;
}
