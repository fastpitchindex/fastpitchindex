import { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
  topBar?: boolean;
};

export default function Card({
  children,
  hover = false,
  topBar = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-card border border-border ${hover ? "card-hover" : ""} ${className}`}
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      {...props}
    >
      {topBar && <div style={{ height: "6px", backgroundColor: "#f26144" }} />}
      {children}
    </div>
  );
}
