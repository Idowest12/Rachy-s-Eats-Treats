import React from 'react';
import { Truck, Gift, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';

export const TrustBanner: React.FC = () => {
  return (
    <section className="py-12 bg-[#17140f]/60 border-y border-[rgba(245,236,226,0.08)] my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#0e0c0b] border border-[rgba(245,236,226,0.12)] text-[#e2417e] shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#f5ece2] mb-1">
                Intentional Curation
              </h4>
              <p className="text-xs text-[#b8a89d] leading-relaxed">
                Fresh roses, quality treats, and personalized cards crafted to evoke pure joy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#0e0c0b] border border-[rgba(245,236,226,0.12)] text-[#e2417e] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#f5ece2] mb-1">
                Lagos-Wide Delivery
              </h4>
              <p className="text-xs text-[#b8a89d] leading-relaxed">
                Island &amp; Mainland prompt dispatch for early morning surprises and party drop-offs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#0e0c0b] border border-[rgba(245,236,226,0.12)] text-[#e2417e] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#f5ece2] mb-1">
                Punctual Surprises
              </h4>
              <p className="text-xs text-[#b8a89d] leading-relaxed">
                Timed delivery arrivals to ensure the recipient is caught in the moment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#0e0c0b] border border-[rgba(245,236,226,0.12)] text-[#e2417e] shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#f5ece2] mb-1">
                Direct WhatsApp Booking
              </h4>
              <p className="text-xs text-[#b8a89d] leading-relaxed">
                Connect 1-on-1 with Rachy to tailor package colors, dietary needs, or cash amounts.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
