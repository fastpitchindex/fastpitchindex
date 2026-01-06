"use client";

import Layout from "@/components/Layout";
import Container from "@/components/Container";
import Link from "next/link";
import Image from "next/image";
import { LuRefreshCw, LuSlidersHorizontal, LuShieldCheck, LuChevronRight } from "react-icons/lu";

const featureCards = [
  {
    title: "REGULAR UPDATES",
    description:
      "We check tournament sources regularly to make sure listings are current, accurate, and up to date.",
    Icon: LuRefreshCw,
  },
  {
    title: "SMART FILTERS",
    description:
      "Filter by age group, location, and date range to find exactly what your team needs.",
    Icon: LuSlidersHorizontal,
  },
  {
    title: "TRUSTED LISTINGS",
    description: "We confirm each tournament against its official listing so you can plan with confidence.",
    Icon: LuShieldCheck,
  },
];

export default function HomePage() {
  return (
    <Layout>
      <section id="top" className="relative h-screen max-h-[100dvh] flex items-center gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-coral/30 blur-3xl animate-float"
            style={{ animationDelay: "-3s" }}
          />
        </div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="font-display text-5xl sm:text-6xl md:text-6xl lg:text-7xl text-white mb-6 animate-slide-up leading-tight mt-0 md:mt-[-3rem] lg:mt-[-2.5rem]"
            >
              FIND YOUR NEXT
              <br />
              <span className="text-coral">MICHIGAN FASTPITCH TOURNAMENT</span>
            </h1>
            <ul
              className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in space-y-2"
              style={{ animationDelay: "0.2s" }}
            >
              <li>Find the right weekend fast.</li>
              <li>Compare entry fees and formats.</li>
              <li>Shortlist tournaments with one click.</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Link
                href="/tournaments?openSearch=true"
                className="group w-full sm:w-auto flex items-center gap-4 rounded-full border border-white bg-white px-5 py-3 text-left text-primary shadow-coral-glow transition-transform duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1533]"
                style={{ backgroundColor: "#ffffff" }}
              >
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center ring-1 ring-primary/10">
                  <Image src="/logo.png" alt="" width={20} height={20} className="object-contain opacity-100" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="text-xs uppercase tracking-[0.2em] text-primary/70 block">Find Your Next Tournament</span>
                  <span className="font-display text-lg text-primary block truncate">Search by age, date, and location</span>
                </span>
                <LuChevronRight className="w-5 h-5 text-primary/70 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-white/70 text-sm mt-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              We regularly check official tournament sources.
            </p>
          </div>
        </div>
      </section>

      <section id="why" className="py-16 md:py-28 bg-muted/50 mt-6 md:mt-0">
        <Container>
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-3 md:mb-4">
              WHY <span className="text-secondary">FASTPITCH INDEX</span>?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              We built the tool we wished existed - a single source of truth for tournament planning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8">
            {featureCards.map((card, index) => (
              <div
                key={card.title}
                className="bg-card rounded-xl p-5 md:p-8 shadow-card card-hover border border-border"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4 md:mb-5">
                  <div className="w-14 h-14 rounded-xl gradient-coral flex items-center justify-center shadow-coral-glow">
                    <card.Icon className="text-white" size={28} />
                  </div>
                  <h3 className="font-display text-lg md:text-2xl text-foreground tracking-wide">{card.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

    </Layout>
  );
}
