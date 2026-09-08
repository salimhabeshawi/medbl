import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <BackLink href="/">Back to home</BackLink>
      <header className="mb-10 border-b border-border/70 pb-8">
        <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: September 8, 2026</p>
      </header>

      <div className="space-y-8 text-base leading-8 text-foreground/90">
        <p>
          Welcome to Medbl (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or &quot;the Platform&quot;), a community
          platform for collecting and sharing Amharic poetry. By creating an account or using
          Medbl, you agree to these Terms of Service. If you do not agree, please don&apos;t use the Platform.
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">1. What Medbl is</h2>
          <p>
            Medbl lets people browse Amharic poems, favorite them, and submit poems — either their
            own work or the work of another poet — for inclusion in a community-curated collection.
            All submissions go through moderator review before becoming publicly visible.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">2. Your account</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>You must provide a valid email address to register, or sign in via Google.</li>
            <li>You&apos;re responsible for keeping your login credentials secure and for all activity under your account.</li>
            <li>You must be old enough to legally consent to these terms in your jurisdiction to create an account.</li>
            <li>We may suspend or terminate accounts that violate these Terms, including repeated false attribution, spam, or abusive behavior toward moderators or other users.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">3. Submitting content</h2>
          <p>When you submit a poem or poet details to Medbl, you confirm that:</p>
          <ul className="list-disc space-y-3 pl-6">
            <li><strong>If you submit your own poem:</strong> you are the author, and you grant Medbl a non-exclusive, worldwide, royalty-free license to display, reproduce, and distribute that poem on the Platform, for as long as it remains published. You retain full ownership and copyright of your own work, and may request its removal at any time (see Section 6).</li>
            <li><strong>If you submit another poet&apos;s poem:</strong> you believe in good faith that the attribution is accurate, and you have provided a source to help moderators verify it. You confirm you are not knowingly submitting a poem under a false or fabricated attribution.</li>
            <li>You will not submit content that is unlawful, defamatory, hate speech, or that infringes someone else&apos;s copyright without the right to do so.</li>
          </ul>
          <p>
            Submissions are not published automatically. A moderator reviews each one before it
            becomes public, and may accept, reject, or ask for corrections.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">4. Moderation and attribution</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Medbl aims to attribute every poem to a real poet, verified where possible. Poems may be labeled &quot;verified&quot; or &quot;community-attributed&quot; depending on how confident the moderation team is in the attribution.</li>
            <li>We reserve the right to edit minor errors (typos, formatting) in submitted content during moderation, remove content, or mark a poem&apos;s attribution as disputed if a credible concern is raised.</li>
            <li>Moderator decisions are made in good faith but are not infallible. If you believe a poem is misattributed or shouldn&apos;t be on the Platform, please use the report feature or contact us.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">5. Copyright and takedown requests</h2>
          <p>
            Medbl respects the rights of poets and copyright holders. If you believe content on Medbl
            infringes your rights — including a poem attributed to you or someone you represent
            without permission — please use the &quot;Report&quot; feature on the poem&apos;s page, or contact us
            directly at <a href="mailto:salimhabeshawi@gmail.com" className="text-primary underline">salimhabeshawi@gmail.com</a>. Include enough detail for us to identify the poem and your
            relationship to the work. We will review the request and, where warranted, remove or
            restrict the content while we investigate.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">6. Your content, your control</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>You can favorite and un-favorite poems at any time.</li>
            <li>If you submitted a poem yourself (as the poet) and want it removed, contact us or use the report mechanism; we will act on legitimate removal requests from the original author.</li>
            <li>You can update or correct your own poet profile details (name, bio, birth year) at any time from your Profile page.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">7. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Impersonate another person or poet, or knowingly misattribute a poem to someone who didn&apos;t write it.</li>
            <li>Use the Platform to harass, abuse, or threaten others, including moderators.</li>
            <li>Attempt to bulk-scrape, extract, or republish Medbl&apos;s collection without permission.</li>
            <li>Interfere with the Platform&apos;s normal operation (e.g. spamming submissions, attempting unauthorized access).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">8. Disclaimers</h2>
          <p>
            Medbl is provided &quot;as is.&quot; We do our best to keep attribution accurate and the Platform
            available, but we don&apos;t guarantee uninterrupted service, and we&apos;re not liable for errors
            in community-submitted content, including incorrect attributions that occur despite our
            moderation process.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">9. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. If we make material changes, we&apos;ll make a
            reasonable effort to notify users (e.g. a notice on the site). Continued use of Medbl
            after changes take effect means you accept the updated Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">10. Contact</h2>
          <p>Questions about these Terms? Reach us at <a href="mailto:salimhabeshawi@gmail.com" className="text-primary underline">salimhabeshawi@gmail.com</a>.</p>
        </section>
      </div>
    </article>
  );
}
