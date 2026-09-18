import React from 'react';
import { X, MessageCircle, Sparkles } from 'lucide-react';
import { Package, SiteSettings } from '../types.ts';
import { trackOutreach } from '../utils/analytics.ts';

interface PackageModalProps {
  pkg: Package | null;
  settings: SiteSettings;
  onClose: () => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({ pkg, settings, onClose }) => {
  if (!pkg) return null;

  const cleanPhone = (settings?.whatsapp_number || '2347014995254').replace(/[^0-9]/g, '');
  const orderMessage = `Hi Rachy, I would like to order the "${pkg.title}" (${pkg.price}) from your website. Please let me know the availability and delivery details!`;
  const whatsappOrderUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderMessage)}`;

  return (
    <div
      id="package-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="package-modal-content"
        className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row text-gray-900 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Full Cover Image with Category Badge */}
        <div className="md:w-1/2 relative bg-gray-100 min-h-[240px] md:min-h-[360px]">
          <img
            src={pkg.image_url}
            alt={pkg.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/85 text-white shadow-xs">
              {pkg.category}
            </span>
          </div>
        </div>

        {/* Right: Clean Package Details (Fits seamlessly with NO nested on-screen display box) */}
        <div className="p-6 sm:p-8 md:w-1/2 flex flex-col justify-between bg-white">
          <div>
            {/* Price in Signature Pink */}
            <div className="mb-1.5">
              <span className="font-serif font-bold text-2xl sm:text-3xl text-[var(--pink)] tracking-tight">
                {pkg.price}
              </span>
            </div>

            {/* Title in High-Contrast Crisp Black */}
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-gray-900 leading-snug mb-3">
              {pkg.title}
            </h2>

            {/* Inclusions */}
            <div className="mb-4">
              <h4 className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">
                Package Inclusions &amp; Details
              </h4>
              <p className="font-sans text-xs sm:text-sm text-gray-600 leading-relaxed">
                {pkg.description || "Bespoke handcrafted package prepared with premium items, customized message card, and delivered with care across Lagos."}
              </p>
            </div>

            {/* Clean inline note without the bulky floating box */}
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[var(--pink)] shrink-0" />
              <span>Personalized ribbons, cake flavors &amp; cards customized on WhatsApp.</span>
            </p>
          </div>

          {/* Action Button & Return */}
          <div className="space-y-2.5 pt-4 border-t border-gray-100">
            <a
              id="modal-whatsapp-order-btn"
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutreach('whatsapp', pkg.title, pkg.id)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[var(--pink)] hover:bg-[var(--pink-hover)] active:scale-[0.98] transition-all shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Order on WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer text-center font-medium"
            >
              Back to catalogue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
