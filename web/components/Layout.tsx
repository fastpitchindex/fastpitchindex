"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type LayoutProps = {
  children: ReactNode;
};

// Icon components - placeholder until we add react-icons
const LuMenu = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"></line>
    <line x1="4" y1="6" x2="20" y2="6"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);

const LuX = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const LuUser = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default function Layout({ children }: LayoutProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  // Close menus when route changes
  useEffect(() => {
    setNavOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    if (!navOpen && !accountOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      
      if (navOpen && headerRef.current && !headerRef.current.contains(target)) {
        setNavOpen(false);
      }
      
      if (accountOpen && accountRef.current && !accountRef.current.contains(target)) {
        setAccountOpen(false);
      }
    };
    
    // Use mousedown instead of click to avoid conflicts
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navOpen, accountOpen]);

  // TODO: Replace with actual auth check when authentication is implemented
  const user = null;
  const isPro = false;
  const isProLoading = false;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border backdrop-blur-none"
        style={{ backgroundColor: "#ffffff", opacity: 1, mixBlendMode: "normal" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center group">
              <div className="h-8 w-8 group-hover:scale-105 transition-transform flex items-center justify-center relative">
                <Image
                  src="/logo.png"
                  alt="Fastpitch Index Logo"
                  width={32}
                  height={32}
                  className="object-contain h-full w-auto"
                  priority
                />
              </div>
              <span className="font-display text-3xl tracking-wide ml-2">
                <span className="text-primary">Fastpitch</span>{" "}
                <span className="text-secondary">Index</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative inline-flex items-center gap-2" ref={accountRef}>
                  <button
                    className="inline-flex items-center justify-center h-8 w-8 text-foreground hover:text-secondary transition-colors"
                    onClick={() => setAccountOpen((open) => !open)}
                    aria-haspopup="menu"
                    aria-expanded={accountOpen}
                    aria-label="Account menu"
                  >
                    <LuUser size={18} />
                  </button>
                  {!isProLoading && isPro && (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full bg-coral px-2.5 py-1 text-xs font-semibold text-white h-6"
                      onClick={() => setAccountOpen((open) => !open)}
                      aria-label="Account menu"
                    >
                      Pro
                    </button>
                  )}
                  {accountOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-60 rounded-md border border-border shadow-md z-50 overflow-hidden bg-card"
                      style={{ backgroundColor: "#ffffff", opacity: 1 }}
                    >
                      {!isProLoading && isPro && (
                        <Link
                          className="block px-4 py-2 text-sm hover:bg-muted/30 text-foreground"
                          href="/account"
                          onClick={() => setAccountOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link
                        className="block px-4 py-2 text-sm hover:bg-muted/30 text-foreground"
                        href="/account/profile"
                        onClick={() => setAccountOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-muted/30 whitespace-nowrap text-foreground"
                        onClick={() => {
                          setAccountOpen(false);
                          // TODO: Implement sign out when auth is ready
                          window.location.href = "/login";
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link className="text-sm font-semibold text-foreground hover:text-secondary transition-colors" href="/login">
                  Log in
                </Link>
              )}
              <button
                type="button"
                className="h-8 w-8 inline-flex items-center justify-center text-foreground hover:text-secondary transition-colors"
                onClick={() => setNavOpen((open) => !open)}
                aria-label="Toggle menu"
                aria-expanded={navOpen}
              >
                {navOpen ? <LuX size={24} /> : <LuMenu size={24} />}
              </button>
            </div>
          </div>
          <div
            className={`py-4 border-t border-border bg-white ${
              navOpen ? "block" : "hidden"
            }`}
          >
            <nav className="flex flex-col md:flex-row gap-4">
              <Link
                className="font-medium py-2 transition-colors text-muted-foreground hover:text-foreground"
                href="/tournaments"
                onClick={() => setNavOpen(false)}
              >
                Search
              </Link>
              <Link
                className="font-medium py-2 transition-colors text-muted-foreground hover:text-foreground"
                href="/pricing"
                onClick={() => setNavOpen(false)}
              >
                Pricing
              </Link>
              <Link
                className="font-medium py-2 transition-colors text-muted-foreground hover:text-foreground"
                href="/about"
                onClick={() => setNavOpen(false)}
              >
                About
              </Link>
              <Link
                className="font-medium py-2 transition-colors text-muted-foreground hover:text-foreground"
                href="/contact"
                onClick={() => setNavOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16 md:pt-20">{children}</main>

      <footer className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="md:col-span-2">
              <p className="text-primary-foreground/70 max-w-md">
                Your trusted source for Michigan travel softball tournaments. We aggregate listings from across the state so
                coaches and parents can plan seasons without the hassle.
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/50 text-sm">
              © {new Date().getFullYear()} Fastpitch Index. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-primary-foreground/50">
              <Link className="hover:text-coral transition-colors" href="/privacy">
                Privacy
              </Link>
              <Link className="hover:text-coral transition-colors" href="/terms">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
