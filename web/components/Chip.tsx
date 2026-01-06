import { ButtonHTMLAttributes, ReactNode } from "react";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  active?: boolean;
};

export default function Chip({
  children,
  active = false,
  className = "",
  ...props
}: ChipProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
        active
          ? "border-secondary text-secondary"
          : "border-border text-foreground hover:border-secondary"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
