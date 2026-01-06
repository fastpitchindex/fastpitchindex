import Layout from "@/components/Layout";

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display text-3xl md:text-4xl text-foreground font-semibold mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Last Updated: January 5, 2026</p>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Fastpitch Index ("we," "us," or "our") operates a United States-based website located at
                https://www.fastpitchindex.com (the "Site"). This Privacy Policy explains how we collect, use, and protect
                information in connection with the Site.
              </p>

              <div>
                <h2 className="text-foreground font-semibold mb-2">1. Scope and Audience</h2>
                <p>Fastpitch Index is a U.S.-based tournament discovery platform focused exclusively on youth girls fastpitch softball tournaments held in the United States.</p>
                <p className="mt-3">The Site is intended for use by adults, including:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Coaches</li>
                  <li>Parents or guardians</li>
                  <li>Tournament organizers</li>
                  <li>Other individuals involved in youth fastpitch softball</li>
                </ul>
                <p className="mt-3">The Site is not intended for users outside the United States.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">2. Information We Collect</h2>
                <p className="font-semibold text-foreground mt-3">A. User Account Information</p>
                <p>When you create an account on Fastpitch Index, we may collect:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Name (or display name)</li>
                  <li>Email address</li>
                  <li>Account login credentials (such as a password or authentication token)</li>
                  <li>Account preferences (e.g., saved searches, favorite tournaments, alerts)</li>
                </ul>
                <p className="mt-3">Passwords are stored in encrypted or hashed form and are not stored in plain text.</p>
                <p className="mt-3">User accounts are used to provide features such as:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Saving favorite tournaments</li>
                  <li>Managing alerts or notifications</li>
                  <li>Personalizing search and discovery features</li>
                </ul>

                <p className="font-semibold text-foreground mt-5">B. Tournament and Organizer Information</p>
                <p>We collect and display information about fastpitch softball tournaments, including:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tournament name</li>
                  <li>Dates and duration</li>
                  <li>City and state</li>
                  <li>Venue names and addresses</li>
                  <li>Age groups and divisions</li>
                  <li>Entry fees and tournament details</li>
                  <li>Registration and schedule links</li>
                  <li>Tournament status (e.g., open, full, waitlist)</li>
                  <li>Tournament organizer name</li>
                </ul>
                <p className="mt-3">
                  Some tournaments do not use online registration platforms. In those cases, we may also collect and
                  display organizer contact information, such as:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Phone numbers</li>
                  <li>Email addresses</li>
                </ul>
                <p className="mt-3">
                  This information is collected only when it is publicly available or provided by tournament organizers
                  for public contact purposes and is displayed solely to facilitate tournament-related inquiries.
                </p>

                <p className="font-semibold text-foreground mt-5">C. Location Information</p>
                <p>Fastpitch Index uses location data to support tournament discovery, including:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>City and state</li>
                  <li>Venue addresses</li>
                  <li>Approximate geographic coordinates derived from addresses</li>
                </ul>
                <p className="mt-3">
                  If you use location-based features, we may process approximate location information (such as city or
                  region) to show nearby tournaments.
                </p>
                <p className="mt-3">
                  We do not collect precise GPS location data, background location data, or continuous location tracking
                  from users.
                </p>

                <p className="font-semibold text-foreground mt-5">D. Automatically Collected Technical Information</p>
                <p>When you visit the Site, we may automatically collect limited technical information, including:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>IP address</li>
                  <li>Browser type and device type</li>
                  <li>Pages viewed</li>
                  <li>Date and time of access</li>
                  <li>Referring URLs</li>
                </ul>
                <p className="mt-3">This information is used only for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Site security</li>
                  <li>Performance monitoring</li>
                  <li>Aggregate analytics and troubleshooting</li>
                </ul>
                <p className="mt-3">We do not use this data to personally identify individual users.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">3. Information We Do Not Collect</h2>
                <p>Fastpitch Index does not intentionally collect:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Player names or rosters</li>
                  <li>Personal information about children</li>
                  <li>Birthdates or ages of individual participants</li>
                  <li>Payment or financial information (unless explicitly introduced in the future)</li>
                  <li>Sensitive personal data unrelated to tournament discovery</li>
                </ul>
                <p className="mt-3">
                  If personal information is inadvertently captured as part of public tournament materials, we will review
                  and remove it upon request.
                </p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">4. How We Use Information</h2>
                <p>We use collected information to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Provide and manage user accounts</li>
                  <li>Display and index fastpitch softball tournaments</li>
                  <li>Help users find tournaments by date, location, and age group</li>
                  <li>Provide contact options when registration links are unavailable</li>
                  <li>Deliver optional alerts or notifications (if enabled)</li>
                  <li>Improve site functionality and reliability</li>
                  <li>Maintain security and prevent misuse</li>
                </ul>
                <p className="mt-3">We do not sell personal information.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">5. Account Security</h2>
                <p>We take reasonable measures to protect user account information, including:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Secure credential storage (hashed or encrypted passwords)</li>
                  <li>Access controls</li>
                  <li>Monitoring for unauthorized activity</li>
                </ul>
                <p className="mt-3">Users are responsible for maintaining the confidentiality of their account credentials.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">6. Display and Use of Contact Information</h2>
                <p>Phone numbers and email addresses displayed on the Site are intended only for tournament-related communication.</p>
                <p className="mt-3">Tournament organizers may request:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Corrections</li>
                  <li>Updates</li>
                  <li>Removal of contact information</li>
                </ul>
                <p className="mt-3">Requests will be reviewed and addressed promptly.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">7. Cookies and Similar Technologies</h2>
                <p>Fastpitch Index may use cookies or similar technologies for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>User session management</li>
                  <li>Account authentication</li>
                  <li>Preferences and settings</li>
                  <li>Basic analytics and performance monitoring</li>
                </ul>
                <p className="mt-3">We do not use cookies for targeted advertising or cross-site behavioral tracking.</p>
                <p className="mt-3">You may control cookies through your browser settings.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">8. Third-Party Links and Services</h2>
                <p>The Site may link to third-party websites or services, including:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tournament registration platforms</li>
                  <li>Mapping services</li>
                  <li>Organizer websites</li>
                </ul>
                <p className="mt-3">
                  We are not responsible for the privacy practices or content of third-party sites. Users should review the
                  privacy policies of any external services they access.
                </p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">9. Data Retention</h2>
                <p>User account information is retained for as long as the account remains active.</p>
                <p className="mt-3">Tournament and organizer information is retained only while relevant for discovery purposes.</p>
                <p className="mt-3">Technical logs are retained for a limited period for operational and security reasons.</p>
                <p className="mt-3">Users may request account deletion at any time.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">10. Children's Privacy</h2>
                <p>Fastpitch Index does not knowingly collect personal information from children under the age of 13.</p>
                <p className="mt-3">
                  The Site is intended for adult users. If information about a child is inadvertently collected, please contact
                  us for review and removal.
                </p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">11. Your Choices and Requests</h2>
                <p>You may request:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Access to or deletion of your account information</li>
                  <li>Corrections to tournament or organizer information</li>
                  <li>Removal of organizer contact details</li>
                  <li>Clarification about data sources or practices</li>
                </ul>
                <p className="mt-3">Requests can be sent to:</p>
                <p className="mt-2">
                  <a className="text-secondary font-semibold hover:underline" href="mailto:privacy@fastpitchindex.com">
                    privacy@fastpitchindex.com
                  </a>
                </p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">12. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised
                  "Last Updated" date.
                </p>
                <p className="mt-3">Continued use of the Site after changes indicates acceptance of the updated policy.</p>
              </div>

              <div>
                <h2 className="text-foreground font-semibold mb-2">13. Contact Information</h2>
                <p>Fastpitch Index</p>
                <p>
                  Email:{" "}
                  <a className="text-secondary font-semibold hover:underline" href="mailto:privacy@fastpitchindex.com">
                    privacy@fastpitchindex.com
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
