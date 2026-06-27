import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]";
    
    const variantStyles = {
      default: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700",
      destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
      outline: "border border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50",
      secondary: "bg-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-200",
      ghost: "text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-900",
      link: "text-indigo-600 underline-offset-4 hover:underline",
    };
    
    const sizeStyles = {
      default: "h-9 px-4 py-2 text-sm rounded-lg",
      sm: "h-8 px-3 text-xs rounded-md",
      lg: "h-11 px-6 text-base rounded-xl",
      icon: "h-9 w-9 rounded-lg",
    };
    
    const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
    
    if (asChild && React.isValidElement(props.children)) {
      const child = props.children as React.ReactElement<any>;
      return React.cloneElement(child, {
        className: `${classes} ${child.props.className || ""}`,
        ...props,
        children: child.props.children
      });
    }
    
    return (
      <button
        className={classes}
        ref={ref}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    );
  }
);
Button.displayName = "Button";
