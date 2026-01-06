import { HTMLAttributes, ReactNode } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: "default" | "org" | "sanction" | "secondary";
};

export default function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-muted text-muted-foreground",
    org: "bg-[#f26144] text-white",
    sanction: "bg-[#e0e0e0] text-[#1c1c1c] border border-border",
    secondary: "bg-secondary text-secondary-foreground",
  };
  
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
