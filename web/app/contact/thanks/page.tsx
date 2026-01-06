import Link from "next/link";
import Layout from "@/components/Layout";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";

export default function ContactThanksPage() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
      <Container className="max-w-2xl">
        <PageHeader title="Thank you — your message has been received." />
        <p className="text-muted-foreground mb-8">
          If a response is required, we will follow up using the email address you provided.
        </p>

        <Card className="p-4 mb-8">
          <p className="font-semibold mb-2">In the meantime:</p>
          <p className="text-muted-foreground">
            You can return to Fastpitch Index to continue finding and planning fastpitch softball tournaments by age, date,
            and location.
          </p>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link href="/tournaments">
            <Button variant="primary">Find Tournaments</Button>
          </Link>
          <Link href="/contact">
            <Button variant="secondary">Submit Another Request</Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          If you need to add additional details, you may also contact us directly at fastpitchindex@gmail.com.
        </p>
      </Container>
    </section>
    </Layout>
  );
}
