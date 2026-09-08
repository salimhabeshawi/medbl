import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <BackLink href="/">Back to home</BackLink>
      <header className="mb-10 border-b border-border/70 pb-8">
        <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: September 8, 2026</p>
      </header>

      <div className="space-y-8 text-base leading-8 text-foreground/90">
        <p>
          This Privacy Policy explains what information Medbl (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) collects,
          how we use it, and the choices you have. By using Medbl, you agree to the practices
          described here.
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">1. Information we collect</h2>
          <h3 className="text-xl font-semibold text-foreground">Account information</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Email address (required to create an account)</li>
            <li>Password (stored securely and hashed — we never see or store your plain-text password; if you sign in with Google, we don&apos;t receive or store your Google password at all)</li>
            <li>If you sign in with Google, we receive basic profile information Google shares with us (such as your email address) to create and link your account.</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">Poet profile information (optional, only if you choose to add it)</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Amharic name, English name, birth year, and short biography — only collected if you fill in your poet profile on the Profile page, which is required only if you want to submit your own poems.</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">Content you submit</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Poems, poet details you propose for other poets, reports you file, and poems you favorite.</li>
          </ul>
          <h3 className="text-xl font-semibold text-foreground">Automatically collected information</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Basic technical data needed to operate the Platform (such as authentication session tokens), handled by our infrastructure providers described below. We do not run third-party advertising trackers or sell any data to advertisers.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">2. How we use your information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Create and manage your account and authenticate your logins.</li>
            <li>Let you submit poems, favorite content, and manage your poet profile.</li>
            <li>Route submissions through moderation and contact you about their status (e.g. approved, rejected, needs correction).</li>
            <li>Send account-related emails (e.g. email or password change confirmations) — these are handled automatically by our authentication provider.</li>
            <li>Maintain the security and integrity of the Platform (e.g. investigating reported content or abuse).</li>
          </ul>
          <p>We do not use your personal information for advertising, and we do not sell your data to third parties.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">3. Who we share information with</h2>
          <p>
            We use the following third-party service providers to operate Medbl. Each processes data
            on our behalf, under their own security and privacy practices:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Supabase</strong> — hosts our database, handles authentication (including Google sign-in), and stores account and content data.</li>
            <li><strong>Vercel</strong> — hosts and serves the Medbl website.</li>
            <li><strong>Google</strong> — provides the optional &quot;Sign in with Google&quot; feature. If you use it, Google processes the authentication request according to its own privacy policy.</li>
          </ul>
          <p>We do not share your personal information with any other third party except:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>When required by law, legal process, or to protect the rights, safety, or property of Medbl, our users, or the public.</li>
            <li>If Medbl is involved in a merger, acquisition, or transfer of assets, in which case we&apos;ll make reasonable efforts to notify users.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">4. Public information</h2>
          <p>
            Content you submit and get approved (poems, and if you&apos;re a poet, your poet profile
            details you choose to fill in) becomes publicly visible on the Platform — that&apos;s the
            nature of a public poetry archive. Your account email address itself is never shown publicly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">5. Your choices and rights</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Access and correction:</strong> you can view and update your poet profile details, email, and password at any time from your Profile page.</li>
            <li><strong>Deletion:</strong> you can request deletion of your account and associated personal data by contacting us at <a href="mailto:salimhabeshawi@gmail.com" className="text-primary underline">salimhabeshawi@gmail.com</a>. Note that publicly published poems attributed to you (or to a poet you represent) may be retained if their removal would misrepresent the historical/cultural record — we&apos;ll work with you in good faith on what&apos;s appropriate given the situation.</li>
            <li><strong>Favorites:</strong> you can remove any poem from your favorites at any time; this data is private to your account.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">6. Data retention</h2>
          <p>
            We retain account and content data for as long as your account is active, or as needed to
            provide the Platform&apos;s services. If you delete your account, we&apos;ll remove personal
            account data within a reasonable period, except where retention is needed for legal,
            security, or legitimate archival reasons as described above.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">7. Security</h2>
          <p>
            We rely on our infrastructure providers&apos; security practices (including encrypted
            password storage and database access controls) to protect your data. No system is perfectly
            secure, and we can&apos;t guarantee absolute security, but we take reasonable measures to
            protect your information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">8. Children&apos;s privacy</h2>
          <p>
            Medbl is not directed at children, and we don&apos;t knowingly collect personal information
            from children under the age required to legally consent to data processing in their
            jurisdiction. If you believe a child has provided us with personal information, contact us
            and we&apos;ll take appropriate action.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">9. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be reasonably
            communicated (e.g. a notice on the site). Continued use of Medbl after changes take effect
            means you accept the updated policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">10. Contact</h2>
          <p>Questions about this Privacy Policy or your data? Reach us at <a href="mailto:salimhabeshawi@gmail.com" className="text-primary underline">salimhabeshawi@gmail.com</a>.</p>
        </section>
      </div>
    </article>
  );
}
