'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Map, PlusCircle, Locate, Search } from 'lucide-react'

const ITEMS = [
  { href: '/', label: 'Explore', icon: Compass },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/add-spot', label: 'Add', icon: PlusCircle, primary: true },
  { href: '/nearby', label: 'Nearby', icon: Locate },
  { href: '/search', label: 'Search', icon: Search },
] as const

/**
 * Bottom tab bar for mobile — the primary navigation on small screens
 * (the desktop navbar links are hidden below md).
 */
export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="glass-nav fixed inset-x-0 bottom-0 z-50 border-t border-border/50 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon, ...rest }) => {
          const primary = 'primary' in rest && rest.primary
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-heading'
              }`}
            >
              {primary ? (
                /* raised circular Add button */
                <span className="flex h-11 w-11 -translate-y-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background">
                  <Icon className="h-5 w-5" />
                </span>
              ) : (
                <span
                  className={`flex items-center justify-center rounded-full px-3.5 py-0.5 transition-colors ${
                    active ? 'bg-primary/15' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              )}
              <span className={primary ? '-mt-3.5' : ''}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
