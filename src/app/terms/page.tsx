import Link from 'next/link'
import { ArrowLeft, Scale } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | HiddenSpot',
  description: 'Read the terms of service and community guidelines for contributing to HiddenSpot.',
}

export default function TermsPage() {
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
        <div className="font-script text-2xl text-sunset">community guidelines</div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight flex items-center gap-3">
          <Scale className="h-8 w-8 text-brand dark:text-brand-cream" />
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm">Last updated: July 2026</p>
      </div>

      {/* Body Content */}
      <div className="glass p-6 sm:p-10 rounded-3xl border border-border/50 space-y-8 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">1. Acceptance of Terms</h2>
          <p>
            By accessing or using HiddenSpot.in ("HiddenSpot", "we", "our", or "us"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">2. Account Registration & Verification</h2>
          <p>
            To contribute new travel locations, submit coordinates, and upload photos, you must register an account. Account verification requires a valid mobile phone number to authenticate via SMS. You are responsible for maintaining the security of your account and are fully responsible for all activities that occur under your username.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">3. Submission Guidelines & Location Accuracy</h2>
          <p>
            As a crowd-sourced directory, the quality of our map depends on accurate coordinates. By submitting a spot, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide the exact GPS coordinates (latitude and longitude) of the spot, verified by placing a pin on the map.</li>
            <li>Ensure all descriptions, address listings, and travel details (such as difficulty level, entry fees, and parking spaces) are correct and honest.</li>
            <li>Respect private properties and local regulations: <strong>Do not submit locations that trespass on private lands, restricted military zones, or protected reserve forests where access is prohibited.</strong></li>
            <li>Help preserve fragile ecosystems: Promote responsible travel, clean up waste, and do not encourage overcrowding of ecologically sensitive sites.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">4. Vetting & Moderation</h2>
          <p>
            All submitted spots are placed in a moderation queue. Our community moderators check locations for accuracy, coordinate validity, and duplicate submissions. We reserve the right, at our sole discretion, to reject, modify, or delete any submission that violates these Terms of Service or is deemed inappropriate or inaccurate.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">5. Content License</h2>
          <p>
            By posting content (including spot titles, descriptions, coordinates, and cover photos) on HiddenSpot, you grant us a worldwide, non-exclusive, royalty-free, perpetual, and transferable license to host, display, run, copy, modify, and distribute your submissions on the platform for travel discovery.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">6. Travel Advisories & Disclaimer of Liability</h2>
          <p>
            <strong>Explore at your own risk.</strong> HiddenSpot is an informational travel guide. Nature spots (waterfalls, viewpoints, trails) can be dangerous, subject to rapid weather changes, accessibility limits, wildlife hazards, and terrain difficulties.
          </p>
          <p>
            We do not guarantee the safety, accessibility, or legality of visiting any spot listed on the platform. We are not responsible for any accidents, injuries, trespassing violations, fines, or losses incurred while traveling to spots discovered via HiddenSpot.in.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-zinc-800 dark:text-zinc-100">7. Limitation of Liability</h2>
          <p>
            In no event shall HiddenSpot or its contributors be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on HiddenSpot's website, even if we have been notified orally or in writing of the possibility of such damage.
          </p>
        </section>
      </div>
    </div>
  )
}
