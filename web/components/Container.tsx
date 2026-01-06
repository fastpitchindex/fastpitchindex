import { HTMLAttributes, ReactNode } from "react";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Container({
  children,
  className = "",
  ...props
}: ContainerProps) {
  return (
    <div className={`container mx-auto px-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
