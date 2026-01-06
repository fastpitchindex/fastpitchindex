import { HTMLAttributes, ReactNode } from "react";

type PageHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  actions,
  className = "",
  ...props
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${className}`} {...props}>
      <div>
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">
          {title}
        </h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
