import Link from "next/link";
import { LuCalendarDays } from "react-icons/lu";

type UpgradeCardProps = {
  hiddenCount?: number | null;
  ctaHref?: string;
};

export default function UpgradeCard({ hiddenCount, ctaHref = "/pricing" }: UpgradeCardProps) {
  const subline =
    typeof hiddenCount === "number" && hiddenCount > 0
      ? `See ${hiddenCount} more tournaments`
      : "See more tournaments";

  return (
    <div className="mt-8 rounded-3xl border border-border/70 bg-muted/40 p-6 md:p-7 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <LuCalendarDays className="h-4 w-4 text-secondary" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Plan your full season</h2>
          <p className="text-sm md:text-base text-foreground/80">{subline}</p>
          <p className="text-xs text-muted-foreground">
            Pro unlocks future tournaments, saved events, and alerts so you don't miss registration windows.
          </p>
        </div>
      </div>
      <div className="mt-5">
        <Link
          href={`${ctaHref}#pro`}
          className="inline-flex w-full items-center justify-center rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white shadow-coral-glow transition-colors hover:bg-coral-dark sm:w-auto"
        >
          Upgrade to Pro
        </Link>
        <p className="mt-2 text-center text-xs text-muted-foreground">Cancel anytime • No commitment</p>
      </div>
    </div>
  );
}
