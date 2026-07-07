import { WifiOff } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { RetryButton } from '@/components/navigation/retry-button'

export const metadata = {
  title: 'Offline | HiddenSpot.in',
  description: 'You are currently offline. Connect to the internet to explore more hidden travel gems.',
}

export default function OfflinePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
      <div className="h-16 w-16 rounded-full bg-brand-cream/20 dark:bg-brand/10 text-brand dark:text-brand-cream flex items-center justify-center shadow-md animate-bounce">
        <WifiOff className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">You Are Offline</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          It looks like you are disconnected from the internet. We will automatically reload once connection is restored.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className={`${buttonVariants({ variant: "default" })} gradient-btn`}>
          Go to Home
        </Link>
        <RetryButton />
      </div>
    </div>
  )
}
