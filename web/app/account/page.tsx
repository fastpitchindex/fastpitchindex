"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function AccountDashboardPage() {
  const { isPro, isProLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isProLoading && !isPro) {
      router.push("/account/profile");
    }
  }, [isPro, isProLoading, router]);

  if (isProLoading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isPro) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <p>Dashboard content coming soon.</p>
    </div>
  );
}
