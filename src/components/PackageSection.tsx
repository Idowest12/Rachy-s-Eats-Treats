import React from 'react';
import { Package, SiteSettings } from '../types.ts';
import { PackageCard } from './PackageCard.tsx';

interface PackageSectionProps {
  category: string;
  packages: Package[];
  settings: SiteSettings;
  onViewDetails: (pkg: Package) => void;
}

export const PackageSection: React.FC<PackageSectionProps> = ({
  category,
  packages,
  settings,
  onViewDetails
}) => {
  const sectionId = `category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <section
      id={sectionId}
      className="scroll-mt-32 pt-10 pb-6 border-b border-gray-200 last:border-b-0"
    >
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-gray-900 tracking-tight">
            {category}
          </h2>
          <div className="w-10 h-0.5 bg-[var(--pink)] mt-2 rounded-full" />
        </div>
        <span className="text-xs text-gray-600 font-medium">
          {packages.length} {packages.length === 1 ? 'curated package' : 'curated packages'}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            settings={settings}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </section>
  );
};
