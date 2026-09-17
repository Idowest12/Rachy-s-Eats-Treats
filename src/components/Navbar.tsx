import React, { useEffect, useState } from 'react';
import { MessageCircle, Instagram } from 'lucide-react';
import { SiteSettings } from '../types.ts';
import { RachyLogo } from './RachyLogo.tsx';
import { trackOutreach } from '../utils/analytics.ts';

interface NavbarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  settings: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  settings,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cleanPhone = settings.whatsapp_number.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Hi Rachy, I'm visiting your website and would love to enquire about your gift & food packages!"
  )}`;

  const instagramUrl = `https://instagram.com/${settings.instagram_handle.replace('@', '')}`;

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#17140f]/95 backdrop-blur-md border-b border-[rgba(245,236,226,0.12)] shadow-xl'
          : 'bg-[#0e0c0b]/90 backdrop-blur-sm border-b border-[rgba(245,236,226,0.06)]'
      }`}
    >
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-20 gap-2">
          
          {/* Brand Logo & Wordmark */}
          <a
            href="#hero"
            id="nav-brand-link"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none min-w-0"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <RachyLogo
              variant="icon"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl group-hover:border-[#e2417e] transition-colors shrink-0"
            />

            <div className="flex flex-col min-w-0">
              <span className="font-serif italic font-bold text-lg sm:text-2xl text-[#e2417e] tracking-tight leading-none group-hover:text-[#c92e6c] transition-colors truncate">
                Rachy's
              </span>
              <span className="text-[8.5px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] font-semibold text-[#f5ece2] uppercase mt-0.5 opacity-90 truncate">
                Eats &amp; Treats
              </span>
            </div>
          </a>

          {/* Social Links & Order CTA (Client-Ready, Zero Clutter) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Instagram */}
            <a
              id="nav-instagram-link"
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutreach('instagram', 'Navbar Instagram Icon')}
              className="w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-full text-xs font-medium text-[#f5ece2] hover:text-[#e2417e] transition-colors bg-[#17140f] border border-[rgba(245,236,226,0.12)] hover:border-[#e2417e]/40 flex items-center justify-center gap-1.5 active:scale-95"
              title="Visit Instagram"
              aria-label="Instagram"
            >
              <Instagram className="w-3.5 h-3.5 text-[#e2417e]" />
              <span className="hidden md:inline">Instagram</span>
            </a>

            {/* WhatsApp Direct Order CTA */}
            <a
              id="nav-whatsapp-link"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutreach('whatsapp', 'Navbar WhatsApp CTA')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold text-white bg-[#e2417e] hover:bg-[#c92e6c] transition-all shadow-sm active:scale-95 shrink-0"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white/20 shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>

        {/* Dynamic Category Navigation Pills */}
        {categories.length > 0 && (
          <nav
            id="nav-categories-bar"
            className="flex items-center gap-1.5 sm:gap-2 py-2 overflow-x-auto no-scrollbar border-t border-[rgba(245,236,226,0.08)] scroll-smooth -mx-3.5 px-3.5 sm:mx-0 sm:px-0"
            aria-label="Package Categories"
          >
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#b8a89d] font-semibold pl-1 pr-1.5 shrink-0 hidden sm:inline">
              Catalogue:
            </span>

            <button
              id="cat-pill-all"
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#e2417e] text-white font-semibold shadow-sm'
                  : 'bg-[#17140f] text-[#f5ece2] hover:bg-[#1f1a15] border border-[rgba(245,236,226,0.12)]'
              }`}
            >
              All Packages
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-pill-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#e2417e] text-white font-semibold shadow-sm'
                    : 'bg-[#17140f] text-[#f5ece2] hover:bg-[#1f1a15] border border-[rgba(245,236,226,0.12)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
