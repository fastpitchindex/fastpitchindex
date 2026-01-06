"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Layout from "@/components/Layout";
import Container from "@/components/Container";

const navItems = [
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/runs", label: "Runs" },
  { href: "/admin/review", label: "Review" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Layout>
      <div
        className="w-screen max-w-none px-6 py-6 text-left"
        style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
      >
        <Container>
        <div className="flex flex-col md:flex-row gap-6 min-w-0">
          <aside className="w-full md:w-64 md:max-w-64 md:flex-none shrink-0">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="px-2 pb-2 text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
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
    </div>
    </Layout>
  );
}
