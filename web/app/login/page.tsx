"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useAuth } from "@/lib/auth";
import { sanitizePassword, sanitizeEmail } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizePassword(password);
    
    const { error: signInError } = await signIn(sanitizedEmail, sanitizedPassword);
    
    if (signInError) {
      setError(signInError.message || "Failed to log in. Please check your email and password.");
    }
    
    setLoading(false);
  };

  return (
    <Layout>
      <Container className="max-w-md py-16">
      <PageHeader title="Log in" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Password</span>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            maxLength={128}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Don&apos;t have an account? <Link href="/signup" className="underline">Sign up</Link>
      </p>
      <p className="mt-2 text-sm">
        <Link href="/forgot-password" className="underline">Forgot password?</Link>
      </p>
    </Container>
    </Layout>
  );
}
