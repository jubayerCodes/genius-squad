import React from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/[.07] ${className}`}
      aria-hidden="true"
    />
  )
}

export function HeaderAuthSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="size-10 !rounded-full bg-white/[.08]" />
    </div>
  )
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[.08] bg-[#0c1915] p-0 animate-pulse">
      {/* Top Banner / Image Skeleton */}
      <div className="h-48 w-full bg-white/[.04]" />

      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Skeleton className="h-3 w-1/3 mb-2 bg-white/[.05]" />
          <Skeleton className="h-6 w-3/4 mb-4 bg-white/[.08]" />

          <div className="flex gap-2 mb-5">
            <Skeleton className="h-5 w-16 bg-white/[.04]" />
            <Skeleton className="h-5 w-16 bg-white/[.04]" />
            <Skeleton className="h-5 w-16 bg-white/[.04]" />
          </div>

          <div className="grid grid-cols-2 gap-2 border-y border-white/[.07] py-4 my-4">
            <Skeleton className="h-4 w-full bg-white/[.03]" />
            <Skeleton className="h-4 w-full bg-white/[.03]" />
            <Skeleton className="h-4 w-full bg-white/[.03]" />
            <Skeleton className="h-4 w-full bg-white/[.03]" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-20 bg-white/[.07]" />
          <Skeleton className="h-9 w-24 rounded-xl bg-[#b7f34a]/15" />
        </div>
      </div>
    </div>
  )
}

export function DashboardEnrollmentSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col justify-between rounded-2xl border border-white/[.08] bg-[#0c1915] p-6 animate-pulse"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-20 rounded-full bg-white/[.06]" />
              <Skeleton className="h-4 w-24 bg-white/[.04]" />
            </div>
            <Skeleton className="h-6 w-4/5 mb-2 bg-white/[.08]" />
            <Skeleton className="h-4 w-1/2 mb-6 bg-white/[.05]" />

            <div className="space-y-2 border-t border-white/[.06] pt-4">
              <Skeleton className="h-4 w-full bg-white/[.03]" />
              <Skeleton className="h-4 w-3/4 bg-white/[.03]" />
            </div>
          </div>

          <div className="mt-6 border-t border-white/[.08] pt-4">
            <Skeleton className="h-10 w-full rounded-xl bg-white/[.06]" />
          </div>
        </div>
      ))}
    </div>
  )
}
