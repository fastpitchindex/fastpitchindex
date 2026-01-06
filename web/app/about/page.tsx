import Link from "next/link";
import Layout from "@/components/Layout";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";

export default function AboutPage() {
  return (
    <Layout>
      <>
      <section className="gradient-hero pt-16 pb-16 md:pt-20 md:pb-20">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-6xl text-white mb-6">
              We make fastpitch tournament planning feel effortless.
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl">
              Fastpitch Index brings Michigan youth fastpitch tournaments into one reliable, always up-to-date index so
              coaches and parents can plan seasons with confidence.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 -mt-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Our Mission",
                description:
                  "Cut through the noise and connect teams with the tournaments that fit their calendar, budget, and goals.",
              },
              {
                title: "Michigan First",
                description:
                  "We start with Michigan because that is where our fastpitch journey started. Additional states will be added in the future.",
              },
              {
                title: "Always Fresh",
                description:
                  "We check tournament sources regularly so the listings you see are current and reliable.",
              },
            ].map((card) => (
              <Card key={card.title} className="p-6 md:p-8">
                <h3 className="font-display text-xl text-foreground mb-4">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{card.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 md:p-8">
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">Why it exists</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Finding tournaments shouldn&apos;t require digging through scattered websites and Facebook posts. Fastpitch Index
                was built for busy coaches who need to make fast decisions with trustworthy information.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We bring listings together, keep them clean, and make it easy to filter by age group, date, and location.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16 bg-muted/40">
        <Container>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-2">Common Questions</h2>
            <p className="text-muted-foreground">A quick look at how Fastpitch Index works.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Where do listings come from?",
                body: "We pull from trusted tournament organizers and official event sources across Michigan.",
              },
              {
                title: "How often is data refreshed?",
                body: "Sources are checked daily, so updates surface quickly.",
              },
              {
                title: "Is this just for travel teams?",
                body: "Yes, Fastpitch Index is focused on travel and tournament play.",
              },
              {
                title: "Can I submit a tournament?",
                body: "We&apos;re adding a submit flow soon. For now, contact us and we&apos;ll get it added.",
              },
            ].map((item) => (
              <Card key={item.title} className="p-6">
                <h3 className="font-display text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl md:text-4xl mb-3">Ready to plan your season?</h2>
              <p className="text-primary-foreground/70">
                Browse Michigan tournaments and find the best fit for your team.
              </p>
            </div>
            <Link
              href="/tournaments"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-coral text-white hover:bg-coral-dark shadow-coral-glow h-11 px-6"
            >
              Browse Tournaments
            </Link>
          </div>
        </Container>
      </section>
      </>
    </Layout>
  );
}
