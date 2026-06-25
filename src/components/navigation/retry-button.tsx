'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RetryButton() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <Button
      variant="outline"
      className="border-border/50 gap-1.5"
      onClick={handleReload}
    >
      <RefreshCw className="h-4 w-4" />
      <span>Retry Connection</span>
    </Button>
  )
}
