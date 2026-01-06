import { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export default function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-muted rounded animate-pulse ${className}`}
      {...props}
    />
  );
}
