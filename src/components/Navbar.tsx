import React, { useEffect, useState } from 'react';
import { MessageCircle, Instagram, Sparkles, Lock, Menu, X, Phone } from 'lucide-react';
import { SiteSettings } from '../types.ts';
import { RachyLogo } from './RachyLogo.tsx';
import { trackOutreach } from '../utils/analytics.ts';

interface NavbarProps {
  settings: SiteSettings;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenBooking,
  onOpenAdmin,
  isAdminLoggedIn
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cleanPhone = (settings?.whatsapp_number || '2347014995254').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Hi Rachy, I'm visiting your website and would love to enquire about your gift & surprise packages!"
  )}`;

  const instagramUrl =
    settings?.instagram_url ||
    (settings?.instagram_handle
      ? `https://www.instagram.com/${settings.instagram_handle.replace('@', '')}`
      : 'https://www.instagram.com/rachys_eats_treats?stkn=dXBmc2t5azEzOW44');

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm py-2 sm:py-3'
          : 'bg-white/80 backdrop-blur-xs border-b border-gray-100 py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          
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
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0"
            />

            <div className="flex flex-col min-w-0">
              <span className="font-serif italic font-bold text-lg sm:text-2xl text-[var(--pink)] tracking-tight leading-none group-hover:text-[var(--pink-hover)] transition-colors truncate">
                Rachy's
              </span>
              <span className="text-[8.5px] sm:text-[10px] tracking-[0.22em] font-bold text-gray-900 uppercase mt-0.5 opacity-90 truncate">
                Eats &amp; Treats
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-xs font-semibold text-gray-700">
            <a
              href="#hero"
              className="text-[var(--pink)] hover:text-[var(--pink-hover)] transition-colors"
            >
              Home
            </a>
            <a
              href="#about-section"
              className="hover:text-[var(--pink)] transition-colors"
            >
              About
            </a>
            <a
              href="#reels-section"
              className="hover:text-[var(--pink)] transition-colors"
            >
              Gallery
            </a>
            <a
              href="#services-section"
              className="hover:text-[var(--pink)] transition-colors"
            >
              Services
            </a>
            <a
              href="#packages-section"
              className="hover:text-[var(--pink)] transition-colors"
            >
              Gift Items
            </a>
            <a
              href="#contact-section"
              className="hover:text-[var(--pink)] transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Actions on right */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Instagram Profile */}
            <a
              id="nav-instagram-link"
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutreach('instagram', 'Navbar Instagram Icon')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 hover:text-[var(--pink)] transition-colors bg-gray-50 border border-gray-200 active:scale-95"
              title="Visit Instagram"
              aria-label="Instagram"
            >
              <Instagram className="w-3.5 h-3.5 text-[var(--pink)]" />
              <span className="hidden xl:inline">@{settings?.instagram_handle ? settings.instagram_handle.replace('@', '') : 'rachys_eats_treats'}</span>
            </a>

            {/* WhatsApp CTA */}
            <a
              id="nav-whatsapp-link"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutreach('whatsapp', 'Navbar WhatsApp CTA')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#15803d] bg-green-50 hover:bg-green-100 transition-all border border-green-200 active:scale-95 shrink-0"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>

            {/* Book Now Button with Rachy's brand pink and curved edges */}
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-[var(--pink)] hover:bg-[var(--pink-hover)] transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            >
              <span>Book Now</span>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 rounded-2xl bg-white border border-gray-200 shadow-xl space-y-3">
            <a
              href="#services-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-800 py-1.5"
            >
              Services
            </a>
            <a
              href="#packages-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-800 py-1.5"
            >
              Catalogue
            </a>
            <a
              href="#reels-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-800 py-1.5"
            >
              See Us In Action (Reels)
            </a>
            <a
              href="#about-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-800 py-1.5"
            >
              About Us
            </a>
            <a
              href="#contact-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-gray-800 py-1.5"
            >
              Contact
            </a>

            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-2.5 rounded-xl bg-[var(--pink)] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Book a Surprise</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Chat</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
