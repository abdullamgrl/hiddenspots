'use client'

import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Compass, RotateCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="mt-5 font-heading text-3xl font-extrabold tracking-tight">
        We lost the trail
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Something went wrong loading this page. It&apos;s us, not you — try again, or head back
        to familiar ground.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground/60">Ref: {error.digest}</p>
      )}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset} className="gradient-btn gap-1.5">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: 'outline' })}>
          Back to Explore
        </Link>
      </div>
    </div>
  )
}
