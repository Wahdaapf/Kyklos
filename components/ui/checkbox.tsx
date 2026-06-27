import * as React from "react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={`h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 accent-indigo-600 cursor-pointer ${className}`}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";
