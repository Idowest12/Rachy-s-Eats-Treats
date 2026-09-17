import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';
import { SiteSettings } from '../types.ts';
import { RachyLogo } from './RachyLogo.tsx';
import { trackOutreach } from '../utils/analytics.ts';

interface FooterProps {
  settings: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const cleanPhone = settings.whatsapp_number.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Hi Rachy, I'm reaching out from your website to order a package!"
  )}`;
  const instagramUrl = `https://instagram.com/${settings.instagram_handle.replace('@', '')}`;

  // Formatted display phone
  const displayPhone = settings.whatsapp_number.startsWith('234')
    ? '0' + settings.whatsapp_number.slice(3)
    : settings.whatsapp_number;

  return (
    <footer
      id="site-footer"
      className="bg-[#0e0c0b] border-t border-[rgba(245,236,226,0.12)] pt-12 pb-10 text-[#b8a89d]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row: Brand on left, Social links on right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-10">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <RachyLogo variant="icon" className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl shrink-0" />
            <div>
              <h4 className="font-serif italic font-bold text-lg sm:text-xl text-[#f5ece2] tracking-tight">
                Rachy's Eats &amp; Treats
              </h4>
              <p className="font-sans text-xs text-[#b8a89d] mt-0.5">
                Gifts curator · Surprise planner · Money box vendor
              </p>
            </div>
          </div>

          {/* Direct Action Links */}
          <div className="flex items-center gap-5 sm:gap-6 text-sm">
            <a
              id="footer-whatsapp-link"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutreach('whatsapp', 'Footer WhatsApp Link')}
              className="inline-flex items-center gap-1.5 text-[#f5ece2] hover:text-[#e2417e] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#e2417e]" />
              <span>WhatsApp</span>
            </a>

            <a
              id="footer-instagram-link"
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutreach('instagram', 'Footer Instagram Link')}
              className="inline-flex items-center gap-1.5 text-[#f5ece2] hover:text-[#e2417e] transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#e2417e]" />
              <span>Instagram</span>
            </a>
          </div>

        </div>

        {/* Divider & Bottom Row: Copyright left, Phone right */}
        <div className="pt-6 border-t border-[rgba(245,236,226,0.08)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#b8a89d]/80">
          <p>© {new Date().getFullYear()} Rachy's Eats &amp; Treats</p>
          <a
            href={`tel:${cleanPhone}`}
            className="hover:text-[#e2417e] font-sans tracking-wide transition-colors"
          >
            {displayPhone || '07014995254'}
          </a>
        </div>

      </div>
    </footer>
  );
};
