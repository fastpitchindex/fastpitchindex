import Layout from "@/components/Layout";
import Container from "@/components/Container";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";

export default function AdminPage() {
  return (
    <Layout>
      <section className="py-8 md:py-12">
        <Container>
          <PageHeader
            title="Admin Dashboard"
            subtitle="Manage sources, runs, and candidates"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold mb-2">Sources</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Manage data sources and adapters
              </p>
              <p className="text-xs text-muted-foreground">Placeholder - TODO: Implement source management</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold mb-2">Runs</h3>
              <p className="text-muted-foreground text-sm mb-4">
                View and monitor ingestion runs
              </p>
              <p className="text-xs text-muted-foreground">Placeholder - TODO: Implement run monitoring</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold mb-2">Candidates</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Review extracted candidates
              </p>
              <p className="text-xs text-muted-foreground">Placeholder - TODO: Implement candidate review</p>
            </Card>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
