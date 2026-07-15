import Link from 'next/link'
import { Mail, Globe, MapPin, Trophy as TrophyIcon } from 'lucide-react'

// lucide dropped brand icons — minimal inline Instagram glyph
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}
import Image from 'next/image'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/50 bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand/Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <Image src="/brand/Hiddenspotlogo.png" alt="HiddenSpots logo" width={168} height={80} className="h-24 w-auto drop-shadow-sm" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed ">
              HiddenSpot is a community-driven travel discovery engine for sharing visual-first hidden gems, scenic viewpoints, waterfalls, and offbeat locales in India.
            </p>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Globe className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-script text-lg leading-none">made with love in Kerala, India</span>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="eyebrow-script">Popular Categories</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground/80">
              <li>
                <Link href="/category/waterfalls" className="hover:text-sunset transition-colors">
                  Waterfalls
                </Link>
              </li>
              <li>
                <Link href="/category/viewpoints" className="hover:text-sunset transition-colors">
                  Viewpoints
                </Link>
              </li>
              <li>
                <Link href="/category/beaches" className="hover:text-sunset transition-colors">
                  Beaches
                </Link>
              </li>
              <li>
                <Link href="/category/trekking-spots" className="hover:text-sunset transition-colors">
                  Trekking Spots
                </Link>
              </li>
              <li>
                <Link href="/category/hidden-gems" className="hover:text-sunset transition-colors">
                  Hidden Gems
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="eyebrow-script">Regions</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground/80">
              <li>
                <Link href="/kerala" className="hover:text-sunset transition-colors">
                  Kerala
                </Link>
              </li>
              <li>
                <Link href="/karnataka" className="hover:text-sunset transition-colors">
                  Karnataka
                </Link>
              </li>
              <li>
                <Link href="/tamil-nadu" className="hover:text-sunset transition-colors">
                  Tamil Nadu
                </Link>
              </li>
              <li>
                <Link href="/goa" className="hover:text-sunset transition-colors">
                  Goa
                </Link>
              </li>
              <li>
                <Link href="/himachal-pradesh" className="hover:text-sunset transition-colors">
                  Himachal Pradesh
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-4">
            <h3 className="eyebrow-script">Community Support</h3>
            <p className="text-sm text-muted-foreground">
              Have a hidden spot you want featured? Register and share your location details instantly.
            </p>
            <Link
              href="/explorers"
              className="inline-flex items-center space-x-2 text-sm text-foreground/80 hover:text-sunset transition-colors"
            >
              <TrophyIcon className="h-4 w-4" />
              <span>Top Explorers</span>
            </Link>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="mailto:info@hiddenspots.in" className="flex items-center space-x-2 hover:text-sunset transition-colors">
                <Mail className="h-4 w-4" />
                <span>info@hiddenspots.in</span>
              </a>
              <a
                href="https://www.instagram.com/hiddenspots.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-sunset transition-colors"
              >
                <InstagramIcon className="h-4 w-4" />
                <span>@hiddenspots.in</span>
              </a>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Kerala, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground space-y-4 sm:space-y-0">
          <p>© {currentYear} HiddenSpots.in. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/about" className="hover:text-sunset transition-colors">
              About Us
            </Link>
            <Link href="/terms" className="hover:text-sunset transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-sunset transition-colors">
              Privacy Policy
            </Link>
            <Link href="/sitemap.xml" className="hover:text-sunset transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
