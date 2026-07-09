import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | HiddenSpot',
  description: 'Learn how we collect, use, and protect your location and profile data on HiddenSpot.',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 rounded-full bg-card/60 hover:bg-card/85 text-sm text-zinc-700 dark:text-zinc-300 hover:text-foreground px-4 py-2 border border-border/50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="font-script text-2xl text-sunset">legal guidelines</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight flex items-center gap-3">
          <Shield className="h-8 w-8 text-brand dark:text-brand-cream" />
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm">Last updated: July 2026</p>
      </div>

      {/* Body Content */}
      <div className="glass p-6 sm:p-10 rounded-3xl border border-border/50 space-y-8 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">1. Introduction</h2>
          <p>
            Welcome to HiddenSpots.in ("we", "our", or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you visit our website, submit new travel locations, and interact with other community members.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">2. Information We Collect</h2>
          <p>
            To provide a crowd-sourced map directory of hidden travel gems, we collect the following types of information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Information:</strong> When you register on HiddenSpot, we collect your mobile number to authenticate you via SMS (using HTTPSMS). We also store your username, full name, and your reputation score.
            </li>
            <li>
              <strong>Community Submissions:</strong> Any travel spot you share—including coordinates (latitude, longitude), titles, categories, descriptions, entry fees, safety advisories, and cover photos—is publicly displayed.
            </li>
            <li>
              <strong>Social Media Links:</strong> If you submit an Instagram Reel link to show visual proof of a spot, we parse and store the reel URL to display its embedded player.
            </li>
            <li>
              <strong>Location Data:</strong> With your permission, we may access your device's current GPS coordinates to help you pick your location when sharing a spot or finding spots nearby.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">3. How We Use Your Information</h2>
          <p>
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To verify coordinates and approve authentic travel submissions.</li>
            <li>To show precise markers and cluster maps for travel discovery.</li>
            <li>To moderate user-submitted content and prevent duplicates/spam.</li>
            <li>To calculate community contribution badges and reputation scores.</li>
            <li>To secure access to user profiles and verify contributor identities.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">4. Sharing of Information</h2>
          <p>
            HiddenSpot is a public-facing travel directory. Your submitted spots, photos, coordinates, and public profile details (username, full name, reputation score) are visible to all visitors.
          </p>
          <p>
            We do not sell your personal data. We only share information with third-party services necessary to operate our platform (such as Supabase for database hosting, Carto/MapLibre for vector tile mapping, and HTTPSMS for SMS authentication).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">5. Data Security & Retention</h2>
          <p>
            We use industry-standard security measures (such as SSL encryption and row-level security policies) to protect your account and coordinate records. We retain your profile data and submissions for as long as your account is active, or as needed to maintain the public travel directory.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">6. Your Rights & Choices</h2>
          <p>
            You can edit your profile details, update your username, or suggest edits to your spots at any time. If you wish to delete your account or remove any specific travel submission you authored, please contact us at <a href="mailto:hiddenspots.in@gmail.com" className="text-brand dark:text-brand-cream hover:underline">hiddenspots.in@gmail.com</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">7. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>
      </div>
    </div>
  )
}
