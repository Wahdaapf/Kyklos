import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white text-zinc-900 shadow-sm ${className}`}
      {...props}
    />
  );
}
