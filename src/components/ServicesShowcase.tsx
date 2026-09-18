import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { Package, SiteSettings, ServiceCategoryCard } from '../types.ts';
import { STARTER_SERVICES } from '../data/starterServices.ts';
import { trackOutreach } from '../utils/analytics.ts';

export { STARTER_SERVICES as SERVICE_CARDS };

export const SHOWCASE_PILLS = [
  { id: 'surprises', label: 'Surprises', categoryKey: 'Surprises' },
  { id: 'food-tray', label: 'Food tray', categoryKey: 'Food tray' },
  { id: 'money-box', label: 'Money box', categoryKey: 'Money box' },
  { id: 'hampers', label: 'Hampers', categoryKey: 'Hampers' },
  { id: 'all', label: 'All Packages', categoryKey: 'all' },
];

interface ServicesShowcaseProps {
  services?: ServiceCategoryCard[];
  activeCategory?: string;
  onSelectSegmentCategory?: (categoryKey: string) => void;
  packages?: Package[];
  onSelectPackage?: (pkg: Package) => void;
  onOpenBooking: (serviceName?: string) => void;
  settings?: SiteSettings;
}

export const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({
  services = STARTER_SERVICES,
  activeCategory = 'all',
  onSelectSegmentCategory,
  packages = [],
  onSelectPackage,
  onOpenBooking,
  settings
}) => {
  const displayServices = services && services.length > 0 ? services : STARTER_SERVICES;
  const cleanPhone = (settings?.whatsapp_number || '2347014995254').replace(/[^0-9]/g, '');

  const handleCardClick = (categoryKey: string) => {
    if (onSelectSegmentCategory) {
      onSelectSegmentCategory(categoryKey);
    }
    const el = document.getElementById('catalogue') || document.getElementById('packages');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services-section" className="py-16 sm:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-[11px] sm:text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
            WHAT WE DO
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl lg:text-5xl text-gray-900 tracking-tight">
            Our Services
          </h2>
          <p className="text-xs sm:text-base text-gray-600 mt-2 sm:mt-3 leading-relaxed max-w-xl mx-auto">
            Handcrafted with luxury balloons, gourmet treats, and personalized details delivered across Lagos.
          </p>
        </div>

        {/* Cards Grid: 2 columns on mobile (Image 1 style) to prevent infinite scrolling */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayServices.map((card) => {
            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(card.whatsappMessage || `Hi Rachy, I would like to inquire about your ${card.title} from your website.`)}`;

            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleCardClick(card.categoryKey)}
                className="group relative h-[230px] sm:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-xs hover:shadow-2xl transition-all duration-300 border bg-black flex flex-col justify-end p-3.5 sm:p-6 border-gray-100 hover:border-[var(--pink)]/50"
              >
                {/* Background Photo */}
                <img
                  src={card.image_url}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent group-hover:from-black transition-colors" />

                {/* Price Pill on Top Right */}
                <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 z-10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-xs text-[9px] sm:text-[11px] font-bold text-[var(--pink)] shadow-md border border-pink-100">
                  {card.price}
                </div>

                {/* Top Badge matching Image style */}
                <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 z-10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/80 backdrop-blur-xs text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                  {card.badge}
                </div>

                {/* Card Content at Bottom */}
                <div className="relative z-10">
                  <h3 className="font-serif font-bold text-sm sm:text-2xl text-white leading-tight mb-1 sm:mb-1.5 drop-shadow-sm group-hover:text-pink-100 transition-colors line-clamp-1 sm:line-clamp-2">
                    {card.title}
                  </h3>

                  <p className="hidden sm:block text-xs text-white/80 line-clamp-2 mb-4 font-normal leading-relaxed">
                    {card.tagline}
                  </p>

                  {/* Actions: Explore -> matching Image 1 */}
                  <div className="flex items-center justify-between gap-2 pt-1.5 sm:pt-2 border-t border-white/15">
                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-300 sm:text-[var(--pink)] group-hover:text-pink-300 group-hover:translate-x-1 transition-all">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        trackOutreach('whatsapp', card.title);
                      }}
                      className="p-1.5 sm:p-2 rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white shadow-xs transition-transform active:scale-90"
                      title={`Order ${card.title} on WhatsApp`}
                    >
                      <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white/20" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Custom Planning Strip */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500 mb-3">
            Want to combine items, customize color schemes, or plan an elaborate bedroom setup?
          </p>
          <button
            onClick={() => onOpenBooking('Custom Surprise Setup')}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>Plan a Custom Surprise With Rachy</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
