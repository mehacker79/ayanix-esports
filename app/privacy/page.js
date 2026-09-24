// ==========================================
// FILE: app/privacy/page.js — Privacy Policy (static content page)
// ==========================================
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Ayanix Esports",
  description: "How Ayanix Esports collects, uses, and protects your data.",
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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#070b14] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-300">
          <ArrowLeft size={15} /> Back to Ayanix Esports
        </Link>

        <h1 className="font-display mb-1 text-3xl font-black">Privacy Policy</h1>
        <p className="mb-8 text-xs text-slate-500">Last updated: {LAST_UPDATED}</p>

        <Section title="1. What we collect">
          <ul className="ml-4 list-disc space-y-1.5">
            <li><strong className="text-white">Account:</strong> your email address (used to send a one-time login code and match/room updates).</li>
            <li><strong className="text-white">Profile:</strong> your display name, in-game name (IGN), and BGMI/Free Fire character or player ID.</li>
            <li><strong className="text-white">Squad registration:</strong> your squad's name and each of the 4 players' IGN and character/player ID, submitted when you register for a lobby.</li>
            <li><strong className="text-white">Payments:</strong> Razorpay processes your card/UPI/net-banking details directly — we receive only the payment status, amount, and a payment/order ID, never your full card or bank credentials.</li>
            <li><strong className="text-white">Technical:</strong> standard server logs (IP address, timestamps) generated automatically by the hosting platform for security and abuse prevention.</li>
          </ul>
        </Section>

        <Section title="2. How we use it">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>To send your login one-time password (OTP) by email and verify it's really you.</li>
            <li>To register your squad in a tournament lobby and confirm your entry once payment is verified.</li>
            <li>To contact you about match timing, room ID/password, results, or a refund if a match is cancelled.</li>
            <li>To detect fraud, duplicate entries, or fair-play violations across squads.</li>
          </ul>
          <p>We do not sell your personal data to advertisers or any third party.</p>
        </Section>

        <Section title="3. Who we share it with">
          <ul className="ml-4 list-disc space-y-1.5">
            <li><strong className="text-white">Razorpay</strong> — to process your entry-fee payment.</li>
            <li><strong className="text-white">MongoDB Atlas</strong> — our database host, storing your account and squad records.</li>
            <li><strong className="text-white">Google (Gmail SMTP)</strong> — used to deliver your login OTP email.</li>
          </ul>
          <p>
            We do not share your IGN, character ID, or contact details with other players beyond what's
            needed to run a match (e.g. your squad name on a public leaderboard).
          </p>
        </Section>

        <Section title="4. Where your data is stored">
          <p>
            In line with India's Online Gaming Rules, 2026 (Rule 17), user data collected for tournament
            registration is stored on servers located in India and retained only for as long as needed for
            the purposes above, or as required by applicable law.
          </p>
        </Section>

        <Section title="5. Your choices">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>You can update your username, IGN, and character ID any time from the Profile tab.</li>
            <li>You can log out from any device from the Profile tab, which clears your session cookie.</li>
            <li>To request deletion of your account and associated data, email us (contact below) — we'll action it within 30 days, except for payment records we're legally required to retain.</li>
          </ul>
        </Section>

        <Section title="6. Cookies & sessions">
          <p>
            We use a single, signed, <code className="rounded bg-white/10 px-1 py-0.5 text-xs">httpOnly</code>{" "}
            session cookie to keep you logged in after OTP verification. It's not used for advertising or
            cross-site tracking. No third-party ad or analytics cookies are set by Ayanix Esports itself.
          </p>
        </Section>

        <Section title="7. Children's privacy">
          <p>
            This platform is not intended for anyone under 18, in line with India's Online Gaming Rules, 2026.
            We do not knowingly collect data from minors. If you believe a minor has registered, contact us
            and we will remove the account.
          </p>
        </Section>

        <Section title="8. Contact & grievances">
          <p>
            Questions about this policy, or to exercise your data rights, contact{" "}
            <a href="mailto:ayanixtech@gmail.com" className="text-cyan-300 underline">ayanixtech@gmail.com</a> or{" "}
            <a href="https://wa.me/919970889890" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">
              WhatsApp +91 99708 89890
            </a>
            . Grievance Officer: Ayan Sajed Ansari, Founder &amp; CEO, Ayanix Tech (UDYAM‑MH‑25‑0049639).
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            We may update this policy as the platform evolves. Material changes will be reflected in the
            "Last updated" date above.
          </p>
        </Section>
      </div>
    </div>
  );
}
