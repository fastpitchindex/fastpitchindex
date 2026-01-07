"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { supabase } from "@/lib/supabaseClient";
import { sanitizeEmail } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);
    
    if (!sanitizedEmail) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5175';
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
      redirectTo: `${origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message || "Failed to send password reset email.");
    } else {
      setMessage("Check your email for a password reset link.");
    }

    setLoading(false);
  };

  return (
    <Layout>
      <Container className="max-w-md py-16">
        <PageHeader title="Forgot Password" />
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
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-green-700">{message}</p> : null}
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
        <p className="mt-4 text-sm">
          Remember your password? <Link href="/login" className="underline">Log in</Link>
        </p>
      </Container>
    </Layout>
  );
}
