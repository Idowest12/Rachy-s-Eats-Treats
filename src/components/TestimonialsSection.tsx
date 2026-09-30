import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, MessageSquare, Heart, ShieldCheck, Camera, Sparkles } from 'lucide-react';
import { ReviewItem } from '../types.ts';
import { STARTER_REVIEWS } from '../data/starterReviews.ts';

export const TestimonialsSection: React.FC = () => {
  const [reviews] = useState<ReviewItem[]>(STARTER_REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const current = reviews[currentIndex];

  return (
    <section id="reviews-section" className="py-16 sm:py-24 bg-[#fffafc] border-t border-pink-100 relative overflow-hidden">
      {/* Decorative ambient blur */}
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: 'var(--pink)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100 text-[var(--pink)] text-xs font-bold uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5 fill-[var(--pink)]" />
            <span>Real Tears, Pure Joy</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight">
            Proof of Stealth &amp; Happiness
          </h2>
          <p className="font-sans text-sm sm:text-base text-gray-600 mt-2">
            Screenshots from grateful WhatsApp chats and live reaction photos of recipients caught completely by surprise across Lagos and from the Diaspora.
          </p>
        </div>

        {/* Carousel Showcase Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-pink-100 shadow-xl overflow-hidden transition-all">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center">
            
            {/* Visual Proof Side (WhatsApp & Reaction Photo) */}
            <div className="md:col-span-5 bg-gradient-to-br from-pink-50 to-rose-50/50 p-6 sm:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-pink-100">
              <div className="relative group cursor-pointer" onClick={() => setSelectedPhoto(current.reaction_photo || current.chat_screenshot || null)}>
                <img
                  src={current.reaction_photo || current.chat_screenshot}
                  alt={`Reaction proof from ${current.client_name}`}
                  className="w-56 h-64 sm:w-64 sm:h-72 object-cover rounded-2xl shadow-lg border-4 border-white transition-transform duration-300 group-hover:scale-102"
                  loading="lazy"
                  width="300"
                  height="350"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-xs">
                  <Camera className="w-4 h-4" />
                  <span>Inspect Photo Proof</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white/90 px-3 py-1.5 rounded-full shadow-xs border border-pink-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Lagos Surprise Delivery</span>
              </div>
            </div>

            {/* Testimonial Quote & Context */}
            <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                {/* Rating & Tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(current.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--pink)] bg-pink-50 px-2.5 py-1 rounded-md border border-pink-100">
                    {current.occasion}
                  </span>
                </div>

                {/* WhatsApp Chat Quote Box */}
                <div className="relative bg-[#f8fdf9] border border-emerald-100 rounded-2xl p-5 mb-6 shadow-xs">
                  <MessageSquare className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="font-sans text-sm sm:text-base text-gray-800 leading-relaxed italic">
                    "{current.comment}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 pt-4">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-gray-900">
                      {current.client_name}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {current.location} • {current.date}
                    </p>
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Verified Customer
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  {reviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentIndex === idx
                          ? 'w-7 bg-[var(--pink)]'
                          : 'w-2 bg-gray-200 hover:bg-gray-300'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prevSlide}
                    className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors shadow-xs active:scale-95 cursor-pointer"
                    aria-label="Previous review"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors shadow-xs active:scale-95 cursor-pointer"
                    aria-label="Next review"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Modal for full screen photo proof */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
              <img
                src={selectedPhoto}
                alt="Reaction full proof"
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs font-bold cursor-pointer"
              >
                Close Proof
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
