import React from 'react';
import { Package, SiteSettings } from '../types.ts';
import { trackOutreach } from '../utils/analytics.ts';

interface PackageCardProps {
  pkg: Package;
  settings: SiteSettings;
  onViewDetails?: (pkg: Package) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, settings }) => {
  const cleanPhone = (settings?.whatsapp_number || '2347014995254').replace(/[^0-9]/g, '');
  const isCustomQuote = pkg.price?.toLowerCase().includes('request') || pkg.price?.toLowerCase().includes('quote');

  const orderMessage = isCustomQuote
    ? `Hi Rachy, I would like to request a quote for the "${pkg.title}" from your website.`
    : `Hi Rachy, I would like to order the "${pkg.title}" (${pkg.price}) from your website. Please let me know availability and delivery details!`;

  const whatsappOrderUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderMessage)}`;
  const buttonText = isCustomQuote ? 'Ask for a quote' : 'Order now';

  return (
    <article
      id={`package-card-${pkg.id}`}
      className="group flex flex-col rounded-2xl bg-[#141414] border border-neutral-800 overflow-hidden transition-all duration-300 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/50 p-3 sm:p-3.5"
    >
      {/* Clean Rounded Image (matching Image 4) */}
      <div className="relative w-full aspect-4/3 overflow-hidden rounded-xl bg-neutral-900 mb-3.5">
        <img
          src={pkg.image_url}
          alt={pkg.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop';
          }}
        />
      </div>

      {/* Details (matching Image 4: Title + Pink Price + Order now button) */}
      <div className="flex-1 flex flex-col justify-between px-1 pb-1">
        <div className="mb-4">
          <h3 className="font-serif font-bold text-base sm:text-lg text-white leading-snug mb-1">
            {pkg.title}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-[var(--pink)]">
            {pkg.price.startsWith('From') || pkg.price.includes('request') ? pkg.price : `From ${pkg.price}`}
          </p>
        </div>

        {/* Full-width Pink Button (matching Image 4) */}
        <a
          id={`order-btn-${pkg.id}`}
          href={whatsappOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackOutreach('whatsapp', pkg.title, pkg.id)}
          className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[var(--pink)] hover:bg-[var(--pink-hover)] active:scale-[0.98] transition-all text-center shadow-md cursor-pointer block"
        >
          {buttonText}
        </a>
      </div>
    </article>
  );
};
