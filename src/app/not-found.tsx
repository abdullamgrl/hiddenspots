import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { MapPin, Map as MapIcon, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <MapPin className="h-8 w-8" />
      </div>
      <h1 className="mt-5 font-heading text-3xl font-extrabold tracking-tight">
        This spot is <span className="gradient-text">too hidden</span>
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Even we couldn&apos;t find this page. It may have been moved, unpublished, or never
        existed — but there are plenty of real hidden gems waiting.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/map" className={`${buttonVariants({ variant: 'default' })} gradient-btn gap-1.5`}>
          <MapIcon className="h-4 w-4" />
          Explore the Map
        </Link>
        <Link href="/search" className={`${buttonVariants({ variant: 'outline' })} gap-1.5`}>
          <Search className="h-4 w-4" />
          Search Spots
        </Link>
      </div>
    </div>
  )
}
