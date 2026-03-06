import React from "react";
import clsx from "clsx";
import "./ui.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger" | "ghost";
};

export function Button({ variant = "default", className, ...props }: Props) {
  return (
    <button
      className={clsx(
        "btn",
        variant === "primary" && "btn-primary",
        variant === "danger" && "btn-danger",
        variant === "ghost" && "btn-ghost",
        className
      )}
      {...props}
    />
  );
}
