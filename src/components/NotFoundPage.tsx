import React from 'react';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';
import { RachyLogo } from './RachyLogo.tsx';
import { SiteSettings } from '../types.ts';

interface NotFoundProps {
  onBackToHome: () => void;
  settings?: SiteSettings;
}

export const NotFoundPage: React.FC<NotFoundProps> = ({ onBackToHome, settings }) => {
  const rawWhatsapp = settings?.whatsapp_number || '2347014995254';
  const cleanPhone = rawWhatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Hi Rachy, I got lost on your website looking for a surprise package. Can you assist me?"
  )}`;

  return (
    <div className="min-h-screen bg-[#fffbfd] text-gray-900 flex flex-col justify-between selection:bg-[var(--pink)] selection:text-white">
      {/* Top Header Bar */}
      <header className="py-6 px-6 sm:px-12 flex items-center justify-between border-b border-pink-100 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <RachyLogo variant="icon" className="w-10 h-10 rounded-xl shadow-xs" />
          <div>
            <h1 className="font-serif italic font-bold text-xl text-[var(--pink)] leading-none">
              Rachy's
            </h1>
            <span className="text-[9px] font-bold text-gray-900 uppercase tracking-[0.2em]">
              Eats &amp; Treats
            </span>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[var(--pink)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Hero 404 Visual Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 relative overflow-hidden">
        {/* Soft background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full pointer-events-none opacity-25 blur-3xl"
          style={{ background: 'var(--pink)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-lg mx-auto">
          <span className="text-xs uppercase tracking-widest font-bold text-[var(--pink)] bg-pink-50 border border-pink-200 px-3.5 py-1.5 rounded-full inline-block mb-4 shadow-xs">
            Surprise Destination Not Found
          </span>

          <h2 className="font-serif font-extrabold text-7xl sm:text-8xl text-gray-900 tracking-tight mb-3">
            404
          </h2>

          <h3 className="font-serif italic font-bold text-2xl sm:text-3xl text-gray-800 mb-3">
            This Package Has Been Stealthily Delivered Elsewhere
          </h3>

          <p className="font-sans text-xs sm:text-sm text-gray-600 leading-relaxed mb-8">
            The page you are looking for may have moved, expired, or was never unwrapped. Don't worry, our handcrafted surprise catalog is still ready for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Explore All Packages</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 rounded-xs" />
              <span>Chat with Rachy</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-pink-100 bg-white">
        © {new Date().getFullYear()} Rachy's Eats &amp; Treats Lagos. Crafted with stealth &amp; intention.
      </footer>
    </div>
  );
};
