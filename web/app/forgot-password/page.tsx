"use client";

import Layout from "@/components/Layout";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";

export default function ForgotPasswordPage() {
  return (
    <Layout>
      <Container className="max-w-md py-16">
        <PageHeader title="Forgot Password" />
        <p>Password reset flow not implemented yet.</p>
      </Container>
    </Layout>
  );
}
