// ==========================================
// FILE: app/terms/page.js — Terms & Conditions (static content page)
// ==========================================
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions — Ayanix Esports",
  description: "Terms & Conditions for tournament entry, payments, and prize distribution on Ayanix Esports.",
};

const LAST_UPDATED = "24 September 2026";

function Section({ title, children }) {
  return (
    <section className="mb-7">
      <h2 className="mb-2 text-base font-bold text-cyan-300">{title}</h2>
      <div className="space-y-2.5 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070b14] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-300">
          <ArrowLeft size={15} /> Back to Ayanix Esports
        </Link>

        <h1 className="font-display mb-1 text-3xl font-black">Terms &amp; Conditions</h1>
        <p className="mb-8 text-xs text-slate-500">Last updated: {LAST_UPDATED}</p>

        <Section title="1. Who runs this platform">
          <p>
            Ayanix Esports is operated by <strong className="text-white">Ayanix Tech</strong>, a Government of
            India registered MSME (UDYAM‑MH‑25‑0049639) and a Maharashtra Shop Act licensed technology business
            (Reg: 2642000321169093), founded by Ayan Sajed Ansari. By registering a squad or making a payment on
            this platform, you agree to these Terms.
          </p>
        </Section>

        <Section title="2. What this platform is — and isn't">
          <p>
            Ayanix Esports hosts paid-entry, skill-based BGMI and Free Fire squad tournaments. Every prize is
            performance-based: it is decided entirely by in-match rank and kills, not by chance, random draw,
            or any wager on an uncertain outcome. This platform does not offer betting, gambling, fantasy
            contests, or any product where money is staked against an uncertain event. Entry fees collected
            from a lobby go into that lobby's prize pool (see clause 5) after a fixed platform fee.
          </p>
        </Section>

        <Section title="3. India's Online Gaming Rules, 2026">
          <p>
            The Promotion and Regulation of Online Gaming Act, 2025, and the Rules made under it, came into
            force on 1 May 2026. The Rules ban <em>online money games</em> outright but separately recognise
            and permit <em>e-sports</em> — paid-entry tournaments with skill-determined, performance-based cash
            prizes — subject to registration with the Online Gaming Authority of India (OGAI) and compliance
            with its Determination Test, KYC/age-verification, and related conditions.
          </p>
          <p>
            Ayanix Esports operates on the e-sports model these Rules describe. Registration and compliance
            steps with OGAI are an ongoing process on our end, not a settled certification we are claiming
            here. If you have questions about our current registration status before entering a paid lobby,
            contact us at the details in clause 10 — we would rather answer that than have you assume.
          </p>
        </Section>

        <Section title="4. Eligibility">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>You must be at least 18 years old to register a squad or make a payment. Age/KYC checks may be requested before a payout.</li>
            <li>You must provide accurate in-game names (IGN) and character/player IDs for every squad member — mismatched or impersonated accounts can be disqualified without a refund.</li>
            <li>One entry per squad per lobby. Registering the same 4 players across multiple squads in one lobby to increase win odds is not allowed.</li>
          </ul>
        </Section>

        <Section title="5. Entry fees, prize pools & payments">
          <p>
            Entry fees are collected per squad through Razorpay at the amount shown at checkout for that
            specific lobby. From the total collected in a lobby, a fixed platform fee (shown on the lobby
            card before you pay) is deducted; the remainder is the prize pool, split 50% / 30% / 20% across
            the top 3 finishing squads unless a different split is shown for that specific tournament.
            Payments are processed securely by Razorpay; Ayanix Esports does not store your card, UPI, or bank
            details on its own servers.
          </p>
        </Section>

        <Section title="6. Cancellations & refunds">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>If Ayanix Esports cancels a tournament before it starts (e.g. too few squads, technical failure), the full entry fee is refunded to the original payment method within 5–7 business days.</li>
            <li>Once a lobby's room ID/password has been shared and the match has started, entry fees are non-refundable, including for a squad that no-shows, disconnects, or is disqualified for a rules violation.</li>
            <li>Duplicate or failed payments that were still deducted from your bank should be reported within 48 hours to the contact in clause 10 with your payment ID.</li>
          </ul>
        </Section>

        <Section title="7. Fair play & disqualification">
          <p>
            Emulators on mobile-only lobbies, teaming with rival squads, use of hacks/mods/aimbots, and
            deliberate misreporting of match results are all grounds for disqualification and forfeiture of
            any prize, at the discretion of the tournament host. Repeated violations may result in a permanent
            platform ban.
          </p>
        </Section>

        <Section title="8. Prize payout">
          <p>
            Winning squads are paid out to the captain's registered account/UPI after final results are
            verified against in-match screenshots or spectator/replay data, typically within 3–5 business
            days of the match ending.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            Ayanix Esports is not liable for losses caused by your own device, internet connection, or the
            game publisher's servers (Krafton/Garena) being down or unstable during a match. We are not
            affiliated with, and do not represent, Krafton (BGMI) or Garena (Free Fire) — all trademarks
            belong to their respective owners.
          </p>
        </Section>

        <Section title="10. Grievances & contact">
          <p>
            For payment disputes, match disputes, or any complaint, reach us at{" "}
            <a href="mailto:ayanixtech@gmail.com" className="text-cyan-300 underline">ayanixtech@gmail.com</a>{" "}
            or on WhatsApp at{" "}
            <a href="https://wa.me/919970889890" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">
              +91 99708 89890
            </a>
            . We aim to respond within 24 hours. Grievance Officer: Ayan Sajed Ansari, Founder &amp; CEO, Ayanix Tech.
          </p>
        </Section>

        <Section title="11. Changes to these Terms">
          <p>
            We may update these Terms as the platform or applicable law changes. Continued use of Ayanix
            Esports after an update means you accept the revised Terms. Material changes will be reflected in
            the "Last updated" date above.
          </p>
        </Section>

        <p className="mt-10 text-xs text-slate-600">
          This page is provided for transparency and is not a substitute for independent legal advice.
        </p>
      </div>
    </div>
  );
}
