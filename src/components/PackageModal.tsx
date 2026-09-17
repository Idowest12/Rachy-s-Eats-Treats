import React from 'react';
import { X, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { Package, SiteSettings } from '../types.ts';
import { trackOutreach } from '../utils/analytics.ts';

interface PackageModalProps {
  pkg: Package | null;
  settings: SiteSettings;
  onClose: () => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({ pkg, settings, onClose }) => {
  if (!pkg) return null;

  const cleanPhone = settings.whatsapp_number.replace(/[^0-9]/g, '');
  const orderMessage = `Hi Rachy, I would like to order the "${pkg.title}" (${pkg.price}) from your website. Please let me know the availability and delivery details!`;
  const whatsappOrderUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderMessage)}`;

  return (
    <div
      id="package-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="package-modal-content"
        className="relative w-full max-w-2xl bg-[#17140f] border border-[rgba(245,236,226,0.15)] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-[#0e0c0b]/80 hover:bg-[#1f1a15] text-[#f5ece2] border border-[rgba(245,236,226,0.15)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        <div className="md:w-1/2 relative bg-[#1f1a15] min-h-[240px] md:min-h-full">
          <img
            src={pkg.image_url}
            alt={pkg.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0e0c0b]/85 text-[#f5ece2] border border-[rgba(245,236,226,0.12)]">
              {pkg.category}
            </span>
          </div>
        </div>

        {/* Info Column */}
        <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="mb-2">
              <span className="font-serif font-bold text-2xl text-[#e2417e]">
                {pkg.price}
              </span>
            </div>

            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#f5ece2] mb-3 leading-snug">
              {pkg.title}
            </h2>

            <div className="w-12 h-0.5 bg-[#e2417e] mb-4" />

            <div className="space-y-3 mb-6">
              <h4 className="text-xs uppercase tracking-wider text-[#b8a89d] font-semibold">
                Package Inclusions &amp; Details
              </h4>
              <p className="font-sans text-sm text-[#b8a89d] leading-relaxed">
                {pkg.description || "Bespoke handcrafted package prepared with premium items, customized message card, and delivered with care across Lagos."}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.08)] mb-6 text-xs text-[#b8a89d]">
              <p className="flex items-center gap-1.5 text-[#f5ece2] font-medium mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#e2417e]" />
                <span>Customizations Available</span>
              </p>
              <span>You can request special ribbons, custom color palettes, greeting notes, or dietary preferences directly on WhatsApp.</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[rgba(245,236,226,0.08)]">
            <a
              id="modal-whatsapp-order-btn"
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutreach('whatsapp', pkg.title, pkg.id)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-[#e2417e] hover:bg-[#c92e6c] transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Order on WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-[#b8a89d] hover:text-[#f5ece2] transition-colors"
            >
              Back to catalogue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
