import React from 'react';
import { Instagram, MessageCircle, Phone, Heart, Sparkles, MapPin } from 'lucide-react';
import { SiteSettings } from '../types.ts';
import { RachyLogo } from './RachyLogo.tsx';
import { trackOutreach } from '../utils/analytics.ts';

interface FooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin, onOpenBooking }) => {
  const rawWhatsapp = settings?.whatsapp_number || '2347014995254';
  const cleanPhone = rawWhatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Hi Rachy, I'm reaching out from your website to order a surprise package!"
  )}`;
  const instagramUrl =
    settings?.instagram_url ||
    (settings?.instagram_handle
      ? `https://www.instagram.com/${settings.instagram_handle.replace('@', '')}`
      : 'https://www.instagram.com/rachys_eats_treats?stkn=dXBmc2t5azEzOW44');

  const displayPhone = settings?.phone_number || (rawWhatsapp.startsWith('234')
    ? '0' + rawWhatsapp.slice(3)
    : rawWhatsapp);

  return (
    <footer
      id="site-footer"
      className="bg-white border-t border-gray-200 pt-14 pb-10 text-gray-600 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-gray-200">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <RachyLogo variant="icon" className="w-11 h-11 rounded-xl shrink-0" />
              <div>
                <h4 className="font-serif italic font-bold text-lg sm:text-xl text-[var(--pink)] tracking-tight leading-none">
                  Rachy's
                </h4>
                <span className="text-[9px] font-bold text-gray-900 uppercase tracking-[0.2em]">
                  Eats &amp; Treats
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Lagos premier surprise planner. Every balloon, breakfast tray, and money roll handcrafted with intention and delivered with stealth.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-900 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[var(--pink)]" />
              <span>Lagos, Nigeria (Island &amp; Mainland)</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h5 className="text-xs uppercase tracking-wider font-bold text-gray-900 mb-3">
              Services &amp; Setups
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#services-section" className="hover:text-[var(--pink)] transition-colors">
                  Birthday Room Decor
                </a>
              </li>
              <li>
                <a href="#services-section" className="hover:text-[var(--pink)] transition-colors">
                  Engagement &amp; "Marry Me" Lights
                </a>
              </li>
              <li>
                <a href="#packages-section" className="hover:text-[var(--pink)] transition-colors">
                  Gourmet Breakfast Trays
                </a>
              </li>
              <li>
                <a href="#packages-section" className="hover:text-[var(--pink)] transition-colors">
                  3-Tier Money Towers
                </a>
              </li>
              <li>
                <a href="#packages-section" className="hover:text-[var(--pink)] transition-colors">
                  Luxury Gift Hampers
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Experience */}
          <div>
            <h5 className="text-xs uppercase tracking-wider font-bold text-gray-900 mb-3">
              Discover
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#reels-section" className="hover:text-[var(--pink)] transition-colors">
                  See Us In Action (Reels)
                </a>
              </li>
              <li>
                <a href="#about-section" className="hover:text-[var(--pink)] transition-colors">
                  Our Story &amp; Passion
                </a>
              </li>
              <li>
                <a href="#contact-section" className="hover:text-[var(--pink)] transition-colors">
                  Contact &amp; Custom Requests
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="text-[var(--pink)] font-semibold hover:underline cursor-pointer"
                >
                  Book a Custom Surprise
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Reach Out */}
          <div>
            <h5 className="text-xs uppercase tracking-wider font-bold text-gray-900 mb-3">
              Connect With Rachy
            </h5>
            <div className="space-y-3 text-xs">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOutreach('instagram', 'Footer Instagram Link')}
                className="flex items-center gap-2 text-gray-800 hover:text-[var(--pink)] transition-colors"
              >
                <Instagram className="w-4 h-4 text-[var(--pink)] shrink-0" />
                <span>@{settings?.instagram_handle ? settings.instagram_handle.replace('@', '') : 'rachys_eats_treats'}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOutreach('whatsapp', 'Footer WhatsApp Link')}
                className="flex items-center gap-2 text-gray-800 hover:text-[#15803d] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>+234 701 499 5254 (WhatsApp)</span>
              </a>

              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-2 text-gray-800 hover:text-[var(--pink)] transition-colors"
              >
                <Phone className="w-4 h-4 text-[var(--pink)] shrink-0" />
                <span>{displayPhone}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Rachy's Eats &amp; Treats. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="text-[11px] text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Planner Admin Portal
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
