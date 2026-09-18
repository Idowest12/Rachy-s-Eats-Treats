import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types.ts';

interface AboutSectionProps {
  settings?: SiteSettings;
  onOpenBooking?: () => void;
  onBookSurprise?: () => void;
  instagramUrl?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  settings,
  onOpenBooking,
  onBookSurprise,
}) => {
  const handleBooking = onOpenBooking || onBookSurprise || (() => {
    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  return (
    <section id="about-section" className="py-16 sm:py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Story & Narrative matching Screenshot 4 */}
          <div className="lg:col-span-6">
            <span className="text-[var(--pink)] font-bold text-xs sm:text-sm tracking-widest uppercase block mb-3">
              ABOUT US
            </span>

            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 tracking-tight leading-[1.15] mb-5">
              Your Smile Is Our Smile
            </h2>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 font-normal">
              {settings?.business_name || "Rachy's Eats & Treats"} is one of the leading surprise companies in Nigeria. We double the joy of any occasion with our unique and impressive surprise and gift ideas, creatively planned for the most significant milestones of people's lives.
            </p>

            {/* Checkmark Bullets with Pink Checks */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-pink-100 text-[var(--pink)] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-sm font-medium text-gray-800">
                  Birthdays, Anniversaries &amp; Engagements
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-pink-100 text-[var(--pink)] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-sm font-medium text-gray-800">
                  Bridal Showers &amp; Special Events
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-pink-100 text-[var(--pink)] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-sm font-medium text-gray-800">
                  Curated Gift Packages &amp; Food Trays
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-pink-100 text-[var(--pink)] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-sm font-medium text-gray-800">
                  Nationwide Delivery Across Nigeria
                </span>
              </div>
            </div>

            {/* Action CTA with curved edges */}
            <div>
              <button
                onClick={handleBooking}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Photo Collage with curved rounded-3xl edges */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {/* Left tall photo: Hand with engagement ring & roses */}
            <div className="rounded-3xl overflow-hidden shadow-sm h-80 sm:h-96 bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop"
                alt="Engagement ring and red roses bouquet"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>

            {/* Right stacked photos: Bedroom surprise & gift packages */}
            <div className="flex flex-col gap-4">
              <div className="rounded-3xl overflow-hidden shadow-sm h-38 sm:h-46 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop"
                  alt="Hotel room surprise celebration balloons"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-sm h-38 sm:h-46 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop"
                  alt="Curated gift boxes and surprise treat packages"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
