import { Card, CardContent } from "@/components/ui/card"

export function PollCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header skeleton */}
        <div className="flex items-start gap-3 p-4 pb-0">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Question skeleton */}
        <div className="px-4 py-3 space-y-2">
          <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        </div>

        {/* Timer skeleton */}
        <div className="px-4 py-2">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>

        {/* Options skeleton */}
        <div className="px-4 pb-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 w-full bg-muted rounded-lg animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}
