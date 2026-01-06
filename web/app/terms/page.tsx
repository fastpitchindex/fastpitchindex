import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";

export default function TermsOfUsePage() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display text-3xl md:text-4xl text-foreground font-semibold mb-2">Terms of Use</h1>
            <p className="text-sm text-muted-foreground mb-8">Last Updated: January 5, 2026</p>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Welcome to Fastpitch Index ("we," "us," or "our"). These Terms of Use ("Terms") govern your access to and use
                of the website located at [https://www.fastpitchindex.com] (the "Site").
              </p>
              <p>
                By accessing or using the Site, you agree to be bound by these Terms. If you do not agree, you must not use
                the Site.
              </p>

              <div>
                <h2 className="text-foreground font-semibold mb-2">1. Purpose of the Site</h2>
                <p>
                  Fastpitch Index is a United States–based tournament discovery and indexing platform focused exclusively
                  on youth girls fastpitch softball tournaments held in the United States.
                </p>
                <p className="mt-3">
                  The Site is designed to help coaches, parents, tournament organizers, and other adults discover, compare,
                  and evaluate tournament opportunities more efficiently.
                </p>
                <p className="mt-3">Fastpitch Index is not a tournament operator, registration provider, or governing body.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">2. Eligibility</h2>
                <p>The Site is intended for use by individuals who are 18 years of age or older.</p>
                <p className="mt-3">By using the Site, you represent and warrant that you are legally able to enter into these Terms.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">3. User Accounts</h2>
                <p className="font-semibold text-foreground mt-3">A. Account Creation</p>
                <p>Certain features of the Site may require you to create an account. When creating an account, you agree to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Provide accurate and current information</li>
                  <li>Maintain the confidentiality of your login credentials</li>
                  <li>Accept responsibility for all activity that occurs under your account</li>
                </ul>
                <p className="mt-3">You are responsible for safeguarding your username and password.</p>

                <p className="font-semibold text-foreground mt-5">B. Account Use and Termination</p>
                <p>We reserve the right to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Suspend or terminate accounts that violate these Terms</li>
                  <li>Restrict access to features or data</li>
                  <li>Modify or discontinue account features at any time</li>
                </ul>
                <p className="mt-3">You may request account deletion at any time.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">4. Tournament Information and Accuracy</h2>
                <p>Fastpitch Index displays tournament information sourced from:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Publicly available tournament websites</li>
                  <li>Organizer-provided materials</li>
                  <li>Public announcements intended for event promotion</li>
                </ul>
                <p className="mt-3">While we strive to keep information accurate and current:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tournament details may change without notice</li>
                  <li>Information may be incomplete or outdated</li>
                  <li>Errors or omissions may occur</li>
                </ul>
                <p className="mt-3">
                  Fastpitch Index makes no warranties regarding the accuracy, completeness, or reliability of tournament
                  information.
                </p>
                <p className="mt-3">Official tournament websites and organizers remain the authoritative source for all event details.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">5. Registration and Third-Party Services</h2>
                <p>The Site may link to third-party services, including:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tournament registration platforms</li>
                  <li>Scheduling systems</li>
                  <li>Mapping services</li>
                  <li>Organizer websites</li>
                </ul>
                <p className="mt-3">
                  Fastpitch Index does not operate, control, or endorse third-party services and is not responsible for their
                  content, availability, or practices.
                </p>
                <p className="mt-3">Your interactions with third-party services are governed by their respective terms and policies.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">6. Display and Use of Contact Information</h2>
                <p>
                  Some tournaments do not use online registration systems. In those cases, Fastpitch Index may display phone
                  numbers or email addresses for tournament organizers.
                </p>
                <p className="mt-3">This contact information is provided solely to facilitate tournament-related communication.</p>
                <p className="mt-3">You agree not to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Use organizer contact information for marketing or solicitation</li>
                  <li>Harass or misuse organizer contact details</li>
                  <li>Republish contact information for unrelated purposes</li>
                </ul>
                <p className="mt-3">Tournament organizers may request correction or removal of contact information.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">7. Acceptable Use</h2>
                <p>
                  You agree to use the Site only for lawful purposes and in a manner consistent with its intended use as a
                  tournament discovery platform.
                </p>
                <p className="mt-3">You agree not to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Use the Site for any unlawful, misleading, or fraudulent purpose</li>
                  <li>Attempt to gain unauthorized access to any portion of the Site, its systems, or user accounts</li>
                  <li>Interfere with, disrupt, or degrade the operation, performance, or security of the Site</li>
                  <li>Impersonate any individual, team, tournament organizer, or organization</li>
                  <li>Submit false, misleading, or abusive information through the Site</li>
                  <li>Use the Site to harass, threaten, or misuse tournament organizers or other users</li>
                </ul>

                <p className="font-semibold text-foreground mt-5">Automated Access and Data Use</p>
                <p className="mt-3">You agree not to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    Use automated systems, scripts, bots, scraping tools, or similar technologies to extract, copy, aggregate,
                    or reuse Fastpitch Index's compiled listings, database, or site content at scale, except as expressly
                    permitted by Fastpitch Index.
                  </li>
                </ul>
                <p className="mt-3">
                  This restriction is intended to protect Fastpitch Index's original compilation, organization, and
                  presentation of data and does not apply to ordinary web browsing or to accessing publicly available
                  information directly from original source websites.
                </p>
                <p className="mt-3">We reserve the right to limit, suspend, or terminate access for violations of this section.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">8. Intellectual Property</h2>
                <p>
                  The Site, including its design, layout, structure, organization, and original content, is owned by or
                  licensed to Fastpitch Index and is protected by United States intellectual property laws.
                </p>
                <p className="mt-3">
                  Tournament names, logos, and trademarks belong to their respective owners and are used solely for
                  identification purposes.
                </p>
                <p className="mt-3">
                  You may not reproduce, distribute, or create derivative works from Site content without permission, except
                  for personal, non-commercial use.
                </p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">9. Disclaimer of Warranties</h2>
                <p>The Site is provided on an "as is" and "as available" basis.</p>
                <p className="mt-3">To the fullest extent permitted by law, Fastpitch Index disclaims all warranties, express or implied, including but not limited to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Accuracy of tournament listings</li>
                  <li>Availability of tournaments or registration</li>
                  <li>Fitness for a particular purpose</li>
                  <li>Non-infringement</li>
                </ul>
                <p className="mt-3">Your use of the Site is at your own risk.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">10. Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, Fastpitch Index shall not be liable for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Direct or indirect damages</li>
                  <li>Lost opportunities or costs</li>
                  <li>Tournament cancellations or changes</li>
                  <li>Errors in listings or schedules</li>
                  <li>Issues arising from third-party services</li>
                </ul>
                <p className="mt-3">In no event shall our total liability exceed $100 USD.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">11. Indemnification</h2>
                <p>You agree to indemnify and hold harmless Fastpitch Index from any claims, damages, losses, or expenses arising from:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Your use of the Site</li>
                  <li>Your violation of these Terms</li>
                  <li>Your interactions with tournament organizers or third-party services</li>
                </ul>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">12. Data Sourcing Transparency</h2>
                <p>Fastpitch Index is a tournament discovery and indexing platform and does not operate or manage tournaments.</p>
                <p className="mt-3">Tournament information displayed on the Site is sourced from:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Publicly accessible tournament websites</li>
                  <li>Public event listings and announcements</li>
                  <li>Organizer-provided materials intended for public distribution</li>
                </ul>
                <p className="mt-3">
                  We collect only information that organizers have made publicly available for the purpose of promoting or
                  administering their events.
                </p>
                <p className="mt-3">
                  Fastpitch Index uses automated systems designed to access only public pages, avoid authentication-protected
                  systems, operate at respectful request rates, and minimize impact on source websites.
                </p>
                <p className="mt-3">We do not bypass paywalls, logins, or access controls.</p>
                <p className="mt-3">
                  Tournament organizers may request corrections, updates, or removal of listings by contacting{" "}
                  <a className="text-secondary font-semibold hover:underline" href="mailto:support@fastpitchindex.com">
                    support@fastpitchindex.com
                  </a>
                  .
                </p>
                <p className="mt-3">
                  Fastpitch Index does not claim ownership over tournament events or organizer materials. Tournament names,
                  logos, and trademarks remain the property of their respective owners.
                </p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">13. Modifications to the Site and Terms</h2>
                <p>We may update or modify the Site or these Terms at any time.</p>
                <p className="mt-3">
                  Changes will be posted on this page with an updated "Last Updated" date. Continued use of the Site after
                  changes constitutes acceptance of the revised Terms.
                </p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">14. Governing Law</h2>
                <p>
                  These Terms are governed by and construed in accordance with the laws of the United States and the State of
                  Michigan, without regard to conflict-of-law principles.
                </p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">15. Contact Information</h2>
                <p>Fastpitch Index</p>
                <p>
                  Email:{" "}
                  <a className="text-secondary font-semibold hover:underline" href="mailto:support@fastpitchindex.com">
                    support@fastpitchindex.com
                  </a>
                </p>
                <p>
                  Website:{" "}
                  <a className="text-secondary font-semibold hover:underline" href="https://www.fastpitchindex.com">
                    https://www.fastpitchindex.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
