import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Fastpitch Index - Find Your Next Tournament",
  description: "Your trusted source for Michigan travel softball tournaments. We aggregate listings from across the state so coaches and parents can plan seasons without the hassle.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${bebasNeue.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  const noop = function() {};
                  const devtools = {
                    renderers: new Map(),
                    supportsFiber: true,
                    inject: noop,
                    onCommitFiberRoot: noop,
                    onCommitFiberUnmount: noop,
                  };
                  
                  // Override the hook if it exists, or create it if it doesn't
                  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                    // If it already exists, override its methods
                    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
                    hook.inject = noop;
                    hook.onCommitFiberRoot = noop;
                    hook.onCommitFiberUnmount = noop;
                    hook.renderers = new Map();
                    Object.defineProperty(hook, 'renderers', {
                      get: function() { return new Map(); },
                      set: noop,
                      configurable: true,
                      enumerable: true,
                    });
                  } else {
                    // If it doesn't exist, create it
                    try {
                      Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
                        get: function() { return devtools; },
                        set: noop,
                        configurable: true,
                        enumerable: false,
                      });
                    } catch (e) {
                      window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = devtools;
                    }
                  }
                }
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
