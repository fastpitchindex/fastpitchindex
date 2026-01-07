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
import { sanitizePassword, sanitizeEmail, sanitizeText } from "@/lib/utils";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    // Sanitize all inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizePassword(password);
    const sanitizedDisplayName = sanitizeText(displayName, 100);
    
    if (!sanitizedDisplayName) {
      setError("Display name is required.");
      setLoading(false);
      return;
    }
    
    if (!sanitizedEmail) {
      setError("Email is required.");
      setLoading(false);
      return;
    }
    
    if (sanitizedPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }
    
    if (sanitizedPassword.length > 128) {
      setError("Password must be 128 characters or less.");
      setLoading(false);
      return;
    }
    
    const { error: signUpError } = await signUp(sanitizedEmail, sanitizedPassword, sanitizedDisplayName);
    
    if (signUpError) {
      setError(signUpError.message || "Failed to create account. Please try again.");
    } else {
      setMessage("Account created! Please check your email to confirm your account before logging in.");
      // Don't auto-redirect - let them read the message
    }
    
    setLoading(false);
  };

  return (
    <Layout>
      <Container className="max-w-md py-16">
      <PageHeader title="Sign up" />
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
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
          />
          <p className="text-xs text-muted-foreground">Password must be 8-128 characters long.</p>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Display Name</span>
          <Input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            autoComplete="name"
            placeholder="Enter your display name"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <Link href="/login" className="underline">Log in</Link>
      </p>
    </Container>
    </Layout>
  );
}
