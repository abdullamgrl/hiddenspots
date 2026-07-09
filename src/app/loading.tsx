import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse flex flex-col gap-8">
      {/* Skeleton for Header/Hero */}
      <div className="h-64 md:h-96 w-full rounded-2xl bg-muted" />
      
      {/* Skeleton for Title and Content */}
      <div className="space-y-4 max-w-3xl">
        <div className="h-10 w-3/4 bg-muted rounded" />
        <div className="h-6 w-1/2 bg-muted rounded" />
      </div>

      {/* Skeleton for Grid Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-48 w-full bg-muted rounded-xl" />
            <div className="h-6 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
