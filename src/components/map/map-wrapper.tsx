'use client'

import dynamic from 'next/dynamic'

const DynamicMap = dynamic(() => import('./spot-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[280px] w-full items-center justify-center rounded-2xl bg-muted border border-border">
      <div className="text-sm text-muted-foreground animate-pulse">Loading map…</div>
    </div>
  ),
})

export default DynamicMap
