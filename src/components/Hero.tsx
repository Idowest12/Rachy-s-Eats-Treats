import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { SiteSettings } from '../types.ts';
import { trackOutreach } from '../utils/analytics.ts';

interface HeroProps {
  settings?: SiteSettings;
  onExploreClick?: () => void;
  onOpenBooking?: () => void;
  onWatchActionClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onExploreClick = () => {
    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
  },
  onOpenBooking = () => {},
  onWatchActionClick = () => {
    document.getElementById('reels-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}) => {
  const cleanPhone = (settings?.whatsapp_number || '2347014995254').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Hi Rachy, I would like to plan a special surprise!"
  )}`;

  return (
    <section id="hero" className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] flex items-center pt-28 pb-20 overflow-hidden bg-[#110d13]">
      
      {/* Real luxury hotel bedroom surprise setup background (inspired directly by K surprise reference) */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings?.hero_image_url || "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1920&auto=format&fit=crop"}
          alt="Luxury surprise celebration decor"
          className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.05]"
        />
        {/* Deep luxury vignette gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl text-left">
          
          {/* Main Headline matching Rachy's signature celebration identity */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif font-bold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.12] mb-5"
          >
            {settings?.hero_title ? (
              settings.hero_title
            ) : (
              <>
                Curate a{' '}
                <span className="text-[var(--pink)] font-serif font-bold block sm:inline">
                  Special Surprise.
                </span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-sans text-base sm:text-lg text-gray-200 leading-relaxed mb-8 max-w-xl font-normal"
          >
            {settings?.hero_subtitle || "We double the joy of any occasion with unique and impressive surprises that create unforgettable memories."}
          </motion.p>

          {/* Action Buttons with curved edges */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4"
          >
            {/* Primary Pink Button with curved edges */}
            <button
              id="hero-book-btn"
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white font-semibold text-sm sm:text-base transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <span>Book a Surprise</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Ghost View Our Work Button with curved edges */}
            <button
              id="hero-work-btn"
              onClick={onWatchActionClick}
              className="px-6 py-3.5 rounded-full border border-white/40 hover:border-white text-white hover:bg-white/10 font-medium text-sm sm:text-base transition-all active:scale-95 cursor-pointer"
            >
              View Our Work
            </button>

            {/* Quick WhatsApp Link with curved edges */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutreach('whatsapp', 'Hero WhatsApp CTA')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-sm sm:text-base transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-[#4ade80]" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

