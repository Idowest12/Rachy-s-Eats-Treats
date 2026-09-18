import React from 'react';
import { Truck, Gift, Clock, HeartHandshake, Sparkles } from 'lucide-react';

export const TrustBanner: React.FC = () => {
  return (
    <section className="py-12 bg-white border-y border-gray-200 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-pink-50 text-[var(--pink)] shrink-0 shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-gray-900 mb-1">
                Intentional Curation
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Fresh roses, quality treats, and personalized cards crafted to evoke pure joy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-pink-50 text-[var(--pink)] shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-gray-900 mb-1">
                Lagos-Wide Delivery
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Island &amp; Mainland prompt dispatch for early morning surprises and party drop-offs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-pink-50 text-[var(--pink)] shrink-0 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-gray-900 mb-1">
                Punctual Surprises
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Timed delivery arrivals to ensure the recipient is caught in the moment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-green-50 text-[#15803d] shrink-0 shadow-xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-gray-900 mb-1">
                Direct WhatsApp Booking
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Connect 1-on-1 with Rachy to tailor package colors, dietary needs, or cash amounts.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
