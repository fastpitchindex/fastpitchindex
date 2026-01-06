"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Layout from "@/components/Layout";
import Container from "@/components/Container";

const navItems = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/billing", label: "Billing" },
  { href: "/account/alerts", label: "Alerts" },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Layout>
      <Container className="py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 md:max-w-64 md:flex-none shrink-0">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="px-2 pb-2 text-xs uppercase tracking-wide text-muted-foreground">Account</p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm font-semibold ${
                    isActive(item.href)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <div className="rounded-lg border border-border bg-card p-4 md:p-6 min-w-0 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </Container>
    </Layout>
  );
}
