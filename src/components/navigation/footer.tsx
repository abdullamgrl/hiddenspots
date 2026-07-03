import Link from 'next/link'
import { Mail, Globe, MapPin } from 'lucide-react'
import { LogoMark } from '@/components/brand/logo-mark'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/50 bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand/Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <LogoMark className="h-8 w-auto" />
              <span className="font-heading text-lg font-bold tracking-tight">
                Hidden<span className="text-emerald-600 dark:text-teal-400">Spot</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              HiddenSpot is a community-driven travel discovery engine for sharing visual-first hidden gems, scenic viewpoints, waterfalls, and offbeat locales in India.
            </p>
            <div className="flex items-center space-x-3 text-muted-foreground text-xs">
              <Globe className="h-4 w-4 text-emerald-600" />
              <span>Made with love in Kerala, India</span>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">Popular Categories</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/category/waterfalls" className="hover:text-emerald-600 transition-colors">
                  Waterfalls
                </Link>
              </li>
              <li>
                <Link href="/category/viewpoints" className="hover:text-emerald-600 transition-colors">
                  Viewpoints
                </Link>
              </li>
              <li>
                <Link href="/category/beaches" className="hover:text-emerald-600 transition-colors">
                  Beaches
                </Link>
              </li>
              <li>
                <Link href="/category/trekking-spots" className="hover:text-emerald-600 transition-colors">
                  Trekking Spots
                </Link>
              </li>
              <li>
                <Link href="/category/hidden-gems" className="hover:text-emerald-600 transition-colors">
                  Hidden Gems
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">Regions</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/kerala" className="hover:text-emerald-600 transition-colors">
                  Kerala
                </Link>
              </li>
              <li>
                <Link href="/karnataka" className="hover:text-emerald-600 transition-colors">
                  Karnataka
                </Link>
              </li>
              <li>
                <Link href="/tamil-nadu" className="hover:text-emerald-600 transition-colors">
                  Tamil Nadu
                </Link>
              </li>
              <li>
                <Link href="/goa" className="hover:text-emerald-600 transition-colors">
                  Goa
                </Link>
              </li>
              <li>
                <Link href="/himachal-pradesh" className="hover:text-emerald-600 transition-colors">
                  Himachal Pradesh
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">Community Support</h3>
            <p className="text-sm text-muted-foreground">
              Have a hidden spot you want featured? Register via SMS and share your location details instantly.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="mailto:info@hiddenspot.in" className="flex items-center space-x-2 hover:text-emerald-600 transition-colors">
                <Mail className="h-4 w-4" />
                <span>info@hiddenspot.in</span>
              </a>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Wayanad, Kerala, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground space-y-4 sm:space-y-0">
          <p>© {currentYear} HiddenSpot.in. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/terms" className="hover:text-emerald-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-emerald-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/sitemap.xml" className="hover:text-emerald-600 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
