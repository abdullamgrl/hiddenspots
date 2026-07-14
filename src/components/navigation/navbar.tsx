'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'
import { useAuthDialog } from '@/components/auth/auth-dialog-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bookmark, PlusCircle, Search, Settings, ShieldAlert, Sparkles, User, LogOut } from 'lucide-react'

const NAV_LINKS = [
  { href: '/', label: 'Explore' },
  { href: '/map', label: 'Map' },
  { href: '/nearby', label: 'Nearby' },
  { href: '/about', label: 'About' },
] as const

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useSupabaseAuth()
  const { openAuthDialog } = useAuthDialog()

  const handleAddSpotClick = () => {
    if (!user) {
      openAuthDialog()
    } else {
      router.push('/add-spot')
    }
  }

  return (
    <header className="glass-nav sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {/* logo.svg is a base64-wrapped bitmap (~830KB) — the PNG is 34KB */}
          <Image src="/brand/Hiddenspotlogo.png" alt="HiddenSpots logo" width={144} height={48} className="h-18 w-auto drop-shadow-sm" priority />
          {/* <span className="font-heading text-xl font-extrabold tracking-tight">
            Hidden<span className="text-brand dark:text-brand-cream">Spot</span>
            <span className="text-xs font-semibold text-muted-foreground ml-1">.in</span>
          </span> */}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative pb-0.5 text-sm font-medium transition-colors hover:text-heading ${
                  active ? 'text-heading' : 'text-muted-foreground'
                }`}
              >
                {label}
                {/* sunset active indicator */}
                <span
                  className={`absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sunset transition-opacity ${
                    active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </Link>
            )
          })}
          <Link
            href="/search"
            aria-label="Search"
            className={`transition-colors hover:text-heading ${
              pathname === '/search' ? 'text-sunset' : 'text-muted-foreground'
            }`}
          >
            <Search className="h-4.5 w-4.5" />
          </Link>
          <button
            onClick={handleAddSpotClick}
            className="flex items-center space-x-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-heading"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Spot</span>
          </button>

          {/* Role actions / Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button aria-label="User profile menu" variant="ghost" className="relative h-10 w-10 rounded-full bg-brand-cream/20 dark:bg-brand/15 text-brand-green dark:text-brand-cream">
                  <User className="h-5 w-5" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-56 glass">
                <DropdownMenuLabel className="font-heading">
                  <div className="font-bold">{profile?.full_name || 'Contributor'}</div>
                  <div className="text-xs text-muted-foreground font-normal">@{profile?.username || 'user'}</div>
                  <div className="mt-1 flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-500 font-semibold">{profile?.reputation_score || 10} Rep</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={
                  <Link href={`/profile/${profile?.username}`} className="cursor-pointer" />
                }>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem render={
                  <Link href="/saved" className="cursor-pointer" />
                }>
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>Saved Spots</span>
                </DropdownMenuItem>
                <DropdownMenuItem render={
                  <Link href="/settings" className="cursor-pointer" />
                }>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                {profile?.role && (profile.role === 'admin' || profile.role === 'moderator') && (
                  <DropdownMenuItem render={
                    <Link href="/admin" className="cursor-pointer text-brand dark:text-brand-cream font-medium" />
                  }>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <span>Moderator Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={openAuthDialog} className="gradient-btn">
              Sign In 
            </Button>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button aria-label="User profile menu" variant="ghost" className="relative h-10 w-10 rounded-full bg-brand-cream/20 dark:bg-brand/15 text-brand-green dark:text-brand-cream">
                  <User className="h-5 w-5" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-56 glass">
                <DropdownMenuLabel className="font-heading">
                  <div className="font-bold">{profile?.full_name || 'Contributor'}</div>
                  <div className="text-xs text-muted-foreground font-normal">@{profile?.username || 'user'}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={
                  <Link href={`/profile/${profile?.username}`} className="cursor-pointer" />
                }>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem render={
                  <Link href="/saved" className="cursor-pointer" />
                }>
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>Saved Spots</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddSpotClick} className="cursor-pointer">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Add Spot</span>
                </DropdownMenuItem>
                <DropdownMenuItem render={
                  <Link href="/settings" className="cursor-pointer" />
                }>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                {profile?.role && (profile.role === 'admin' || profile.role === 'moderator') && (
                  <DropdownMenuItem render={
                    <Link href="/admin" className="cursor-pointer text-brand dark:text-brand-cream font-medium" />
                  }>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <span>Moderator Panel</span>

                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={openAuthDialog} size="sm" className="gradient-btn">
              Sign In
            </Button>
          )}
        </div>
      </div>

    </header>
  )
}
