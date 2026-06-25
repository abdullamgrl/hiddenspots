'use client'

import dynamic from 'next/dynamic'

const DynamicMap = dynamic(() => import('./interactive-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[450px] w-full items-center justify-center rounded-2xl bg-muted border border-border">
      <div className="text-sm text-muted-foreground animate-pulse">Loading Google maps...</div>
    </div>
  ),
})

export default DynamicMap
