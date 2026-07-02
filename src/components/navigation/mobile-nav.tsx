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
                active
                  ? 'text-emerald-600 dark:text-teal-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {primary ? (
                <span className="flex h-7 w-7 -translate-y-0.5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                  <Icon className="h-4 w-4" />
                </span>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
