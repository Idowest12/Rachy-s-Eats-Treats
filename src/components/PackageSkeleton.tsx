import React from 'react';

interface PackageSkeletonProps {
  count?: number;
  categoryTitle?: string;
}

export const PackageSkeleton: React.FC<PackageSkeletonProps> = ({
  count = 6,
  categoryTitle = 'Loading packages...'
}) => {
  return (
    <div className="pt-8 pb-8 transition-opacity duration-300 animate-in fade-in" aria-busy="true" aria-label="Loading packages">
      {/* Category Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-6">
        <div>
          <div className="h-7 sm:h-8 w-48 sm:w-64 bg-stone-200 rounded-lg animate-pulse" />
          <div className="w-12 h-1 bg-pink-200 mt-2.5 rounded-full" />
        </div>
        <div className="h-4 w-28 bg-stone-200 rounded-md animate-pulse" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs relative"
          >
            {/* Shimmer Image Box */}
            <div className="relative aspect-[4/3] w-full bg-stone-200 overflow-hidden">
              <div
                className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)'
                }}
              />
              {/* Badges Skeleton */}
              <div className="absolute top-3.5 left-3.5 flex gap-2">
                <div className="h-6 w-20 bg-white/70 backdrop-blur-xs rounded-full animate-pulse" />
              </div>
              <div className="absolute top-3.5 right-3.5">
                <div className="h-6 w-24 bg-white/70 backdrop-blur-xs rounded-full animate-pulse" />
              </div>
            </div>

            {/* Card Content Skeleton */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Title */}
                <div className="h-5 w-3/4 bg-stone-200 rounded-md animate-pulse" />
                <div className="h-3.5 w-full bg-stone-100 rounded-md animate-pulse" />
                <div className="h-3.5 w-5/6 bg-stone-100 rounded-md animate-pulse" />

                {/* Inclusions list */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-200 shrink-0" />
                    <div className="h-3 w-4/5 bg-stone-100 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-200 shrink-0" />
                    <div className="h-3 w-3/5 bg-stone-100 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-200 shrink-0" />
                    <div className="h-3 w-2/3 bg-stone-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="pt-3 border-t border-stone-100 flex items-center gap-2.5">
                <div className="flex-1 h-9 rounded-full bg-stone-200 animate-pulse" />
                <div className="flex-1 h-9 rounded-full bg-stone-200 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
