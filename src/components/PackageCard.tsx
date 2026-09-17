import React from 'react';
import { MessageCircle, Eye } from 'lucide-react';
import { Package, SiteSettings } from '../types.ts';
import { trackOutreach } from '../utils/analytics.ts';

interface PackageCardProps {
  pkg: Package;
  settings: SiteSettings;
  onViewDetails: (pkg: Package) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, settings, onViewDetails }) => {
  const cleanPhone = settings.whatsapp_number.replace(/[^0-9]/g, '');
  const orderMessage = `Hi Rachy, I would like to order the "${pkg.title}" (${pkg.price}) from your website. Please let me know the availability and delivery details!`;
  const whatsappOrderUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderMessage)}`;

  return (
    <article
      id={`package-card-${pkg.id}`}
      className="group flex flex-col rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.12)] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e2417e]/40 hover:shadow-xl hover:shadow-[#e2417e]/5"
    >
      {/* Image container */}
      <div
        className="relative aspect-4/3 w-full bg-[#1f1a15] overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(pkg)}
      >
        <img
          src={pkg.image_url}
          alt={pkg.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback to placeholder if broken link
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop';
          }}
        />

        {/* Subtle Category Badge on top of image */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase bg-[#0e0c0b]/80 backdrop-blur-md text-[#f5ece2] border border-[rgba(245,236,226,0.15)]">
            {pkg.category}
          </span>
        </div>

        {/* Hover quick view overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#17140f]/90 text-xs text-[#f5ece2] border border-[rgba(245,236,226,0.2)]">
            <Eye className="w-3.5 h-3.5 text-[#e2417e]" />
            <span>View Details</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#e2417e] tracking-tight">
              {pkg.price}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif font-semibold text-lg text-[#f5ece2] leading-snug group-hover:text-[#e2417e] transition-colors mb-2">
            {pkg.title}
          </h3>

          {/* Description */}
          {pkg.description && (
            <p className="font-sans text-xs sm:text-sm text-[#b8a89d] leading-relaxed line-clamp-3 mb-4">
              {pkg.description}
            </p>
          )}
        </div>

        {/* Action button */}
        <div className="pt-2">
          <a
            id={`order-btn-${pkg.id}`}
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutreach('whatsapp', pkg.title, pkg.id)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#e2417e] hover:bg-[#c92e6c] active:scale-[0.98] transition-all shadow-sm shadow-[#e2417e]/10"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Order now</span>
          </a>
        </div>
      </div>
    </article>
  );
};
