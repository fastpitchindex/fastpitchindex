"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { supabase } from "@/lib/supabaseClient";
import { sanitizePassword } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we have a valid reset token in the URL hash fragment
    // Supabase sends the token in the hash fragment like: #access_token=...&type=recovery
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash.substring(1);
    if (!hash) {
      setError("Invalid or missing reset token. Please request a new password reset.");
      return;
    }
    
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (!accessToken || type !== 'recovery') {
      setError("Invalid or missing reset token. Please request a new password reset.");
      return;
    }
    
    // Listen for auth state changes - Supabase will process the hash and fire this event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setHasToken(true);
        // Clear the hash from the URL for security
        window.history.replaceState(null, '', window.location.pathname);
      }
    });
    
    // The onAuthStateChange listener above will handle existing sessions
    // We avoid getSession() to prevent CORS issues on mobile
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!hasToken) {
      setError("Invalid or missing reset token. Please request a new password reset.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);

    // Sanitize passwords
    const sanitizedPassword = sanitizePassword(password);
    const sanitizedConfirmPassword = sanitizePassword(confirmPassword);

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      setError("Passwords do not match.");
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

    // Supabase automatically uses the token from the hash fragment
    // We just need to call updateUser with the new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: sanitizedPassword,
    });

    if (updateError) {
      setError(updateError.message || "Failed to reset password. The link may have expired.");
    } else {
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <Container className="max-w-md py-16">
        <PageHeader title="Reset Password" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold">New Password</span>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Confirm Password</span>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-green-700">{message}</p> : null}
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full" 
            disabled={loading || !hasToken}
          >
            {loading ? "Resetting..." : "Reset password"}
          </Button>
        </form>
        {!hasToken && (
          <p className="mt-4 text-sm">
            <Link href="/forgot-password" className="underline">Request a new password reset</Link>
          </p>
        )}
        <p className="mt-4 text-sm">
          <Link href="/login" className="underline">Back to log in</Link>
        </p>
      </Container>
    </Layout>
  );
}
