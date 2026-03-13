import React from "react";
import clsx from "clsx";
import "./ui.css";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx("select", className)} {...props} />;
}
