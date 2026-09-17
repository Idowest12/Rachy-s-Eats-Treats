import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Gift, Sparkles, MapPin } from 'lucide-react';
import { SiteSettings } from '../types.ts';
import { trackOutreach } from '../utils/analytics.ts';

interface HeroProps {
  settings: SiteSettings;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExploreClick }) => {
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    "Hi Rachy, I would like to plan a surprise / order a package with you!"
  )}`;

  return (
    <section
      id="hero"
      className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden"
    >
      {/* Radial Pink Glow behind the hero headline */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[450px] rounded-full pointer-events-none opacity-40 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #e2417e 0%, rgba(226,65,126,0.1) 50%, transparent 75%)'
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Step 1 in stagger: Brand icon badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#17140f] border border-[rgba(245,236,226,0.15)] shadow-inner mb-6"
        >
          <MapPin className="w-3.5 h-3.5 text-[#e2417e]" />
          <span className="text-xs font-medium text-[#f5ece2]">
            Lagos Surprise Planner &amp; Gift Curator
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#e2417e] animate-pulse" />
        </motion.div>

        {/* Step 2 in stagger: Headline (Fraunces serif with subtle italic grace) */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#f5ece2] tracking-tight leading-[1.08] mb-6"
        >
          Every surprise, <br className="hidden sm:inline" />
          <span className="italic font-normal text-[#e2417e] font-serif">
            wrapped with intention.
          </span>
        </motion.h1>

        {/* Step 3 in stagger: Tagline (Work Sans body font) */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="font-sans text-lg sm:text-xl text-[#b8a89d] max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 font-normal"
        >
          Birthday sets, money box surprises, hampers and food trays — curated and delivered across Lagos.
        </motion.p>

        {/* Step 4 in stagger: Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4"
        >
          <button
            id="hero-explore-btn"
            onClick={onExploreClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#e2417e] hover:bg-[#c92e6c] text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-[#e2417e]/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>Explore Packages</span>
          </button>

          <a
            id="hero-whatsapp-btn"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutreach('whatsapp', 'Hero Section - Chat on WhatsApp')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#17140f] hover:bg-[#1f1a15] text-[#f5ece2] hover:text-white border border-[rgba(245,236,226,0.15)] hover:border-[#e2417e]/50 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-[#e2417e]" />
            <span>Chat on WhatsApp</span>
          </a>
        </motion.div>

        {/* Micro highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-12 sm:mt-16 pt-8 border-t border-[rgba(245,236,226,0.08)] grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
        >
          <div className="p-2">
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#f5ece2]">Island &amp; Mainland</p>
            <p className="text-xs text-[#b8a89d] mt-0.5">Reliable Lagos delivery</p>
          </div>
          <div className="p-2">
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#e2417e]">100% Handcrafted</p>
            <p className="text-xs text-[#b8a89d] mt-0.5">Bespoke touches &amp; cards</p>
          </div>
          <div className="p-2">
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#f5ece2]">Pre-Orders</p>
            <p className="text-xs text-[#b8a89d] mt-0.5">Same-day options available</p>
          </div>
          <div className="p-2">
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#e2417e]">Direct WhatsApp</p>
            <p className="text-xs text-[#b8a89d] mt-0.5">Instant quote &amp; dispatch</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
