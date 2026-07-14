import { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, MapPin, Users, Heart, ArrowRight, CheckCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About Us — HiddenSpots.in | Discover Secret Travel Destinations',
  description: 'Learn about the mission, team, and community behind HiddenSpots.in. We map India\'s most secluded and beautiful travel destinations with exact GPS coordinates.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      {/* Hero Section */}
      <section className="relative px-4 py-20 lg:py-32 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-brand/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-sunset/10 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="font-script text-3xl text-sunset">our mission</div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Mapping the <span className="text-brand">Unseen</span> Beauty of India
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            HiddenSpots.in is a community-driven travel directory dedicated to uncovering India's most secluded waterfalls, misty viewpoints, and offbeat trails. No gatekeeping, just exact GPS coordinates and beautiful memories.
          </p>
        </div>
      </section>

      {/* E-E-A-T Content Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-20">
        
        {/* The Problem & Solution */}
        <div className="space-y-6">
          <h2 className="font-heading text-3xl font-bold flex items-center gap-2">
            <MapPin className="text-brand h-8 w-8" />
            The Problem with Modern Travel
          </h2>
          <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed text-lg">
            <p>
              If you've ever searched for a "hidden gem" on social media, you know the frustration. You see a breathtaking video of a secluded beach or a pristine waterfall, but the creator refuses to share the location, or worse, gives vague directions that leave you lost in the wilderness.
            </p>
            <p>
              We believe that nature's most beautiful spots belong to everyone. However, we also recognize the importance of preserving these delicate ecosystems. That is why we built <strong>HiddenSpots.in</strong>.
            </p>
          </div>
        </div>

        {/* Our Vetting Process */}
        <div className="space-y-6 bg-card/50 border border-border/50 p-8 rounded-3xl backdrop-blur-sm">
          <h2 className="font-heading text-3xl font-bold flex items-center gap-2">
            <CheckCircle className="text-brand h-8 w-8" />
            Expertise & Community Vetting
          </h2>
          <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed text-lg">
            <p>
              Every single coordinate on our platform undergoes a rigorous moderation process. When a community member drops a pin on our map, our team cross-references the GPS data with satellite imagery and user-uploaded photos to guarantee 100% accuracy.
            </p>
            <p>
              This ensures that you will never waste time driving to a false location. Our <strong>Verification Score</strong> algorithm also weighs community feedback—spots with high ratings from experienced travelers rise to the top.
            </p>
          </div>
        </div>

        {/* Sustainable Travel & Authority Links */}
        <div className="space-y-6">
          <h2 className="font-heading text-3xl font-bold flex items-center gap-2">
            <Heart className="text-sunset h-8 w-8" />
            Sustainable Tourism
          </h2>
          <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed text-lg">
            <p>
              As we open up these secluded areas to the public, we bear a heavy responsibility to protect them. We strictly advocate for <strong>"Leave No Trace"</strong> principles.
            </p>
            <p>
              We are proud supporters of India's incredible tourism initiatives. For official travel guidelines, heritage information, and national park regulations, we always recommend travelers consult <a href="https://www.incredibleindia.org/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-semibold">Incredible India</a> and official state tourism boards like <a href="https://www.keralatourism.org/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-semibold">Kerala Tourism</a>.
            </p>
          </div>
        </div>

        {/* The Team / Community */}
        <div className="space-y-6 text-center pt-10 border-t border-border/50">
          <Users className="text-brand h-12 w-12 mx-auto mb-4" />
          <h2 className="font-heading text-3xl font-bold">Built by Travelers, for Travelers</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            HiddenSpots.in isn't run by a massive corporation. It is built by a small team of passionate backpackers and software engineers who love the open road. 
          </p>
          <div className="pt-8">
            <Link 
              href="/add-spot" 
              className={`${buttonVariants({ variant: "default", size: "lg" })} gap-2 shadow-lg`}
            >
              Join the Community
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
