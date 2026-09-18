import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { Package, SiteSettings } from '../types.ts';
import { trackOutreach } from '../utils/analytics.ts';

export interface FeaturedPackageCard {
  id: number;
  category: string;
  title: string;
  price: string;
  tagline: string;
  image_url: string;
  badge: string;
  description: string;
}

export type SegmentId = 'surprises' | 'food-tray' | 'money-box' | 'hampers';

export interface SegmentConfig {
  id: SegmentId;
  label: string;
  categoryKey: string;
  description: string;
}

export const SEGMENTS: SegmentConfig[] = [
  {
    id: 'surprises',
    label: 'Surprises',
    categoryKey: 'Birthday Sets',
    description: 'Luxury balloons, bento celebration cakes, scented keepsakes & customized setups.'
  },
  {
    id: 'food-tray',
    label: 'Food tray',
    categoryKey: 'Food Trays',
    description: 'Golden waffles, gourmet breakfast platters, grills & fresh mocktails delivered warm.'
  },
  {
    id: 'money-box',
    label: 'Money box',
    categoryKey: 'Money box',
    description: 'Showstopping cash bouquets, multi-tiered pull-out rolls & custom presentation towers.'
  },
  {
    id: 'hampers',
    label: 'Hampers',
    categoryKey: 'Hampers & Gift Boxes',
    description: 'Curated gift boxes packed with imported treats, fragrances, and celebratory items.'
  }
];

export const SEGMENT_CARDS: Record<SegmentId, FeaturedPackageCard[]> = {
  surprises: [
    {
      id: 1,
      category: 'Birthday Sets',
      title: 'Luxury Velvet Birthday Box',
      price: '₦45,000',
      tagline: 'Custom acrylic bubble balloon, red roses, personalized sash & truffles',
      image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
      badge: 'SURPRISES',
      description: 'Custom acrylic bubble balloon, fresh red roses, personalized sash, gourmet chocolate truffles, and celebration sparkler.'
    },
    {
      id: 2,
      category: 'Birthday Sets',
      title: 'Midnight Sparkle Balloon & Cake Set',
      price: '₦55,000',
      tagline: '4-inch bento celebration cake, chrome balloon bunch & sparkling cider',
      image_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
      badge: 'SURPRISES',
      description: '4-inch bento celebration cake, chrome balloon bunch, sparkling cider, and gourmet chocolate-dipped strawberries.'
    },
    {
      id: 3,
      category: 'Birthday Sets',
      title: 'Sweet Celebration Mini Box',
      price: '₦25,000',
      tagline: 'Curated mini treat box, Belgian chocolates & handwritten card',
      image_url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=800&auto=format&fit=crop',
      badge: 'SURPRISES',
      description: 'Curated mini treat box featuring imported Belgian chocolates, personalized handwritten card, and mini helium balloon.'
    },
    {
      id: 13,
      category: 'Birthday Sets',
      title: 'Grand Romantic Birthday Surprise Set',
      price: '₦40,000',
      tagline: 'Custom photo balloons, heart helium bouquet & chocolate box',
      image_url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
      badge: 'SURPRISES',
      description: 'Custom photo balloons, heart-shaped helium balloon bouquet, chocolate box, and personalized acrylic keepsake frame.'
    }
  ],
  'food-tray': [
    {
      id: 7,
      category: 'Food Trays',
      title: 'The Lagos Executive Breakfast Tray',
      price: '₦38,000',
      tagline: 'Golden Belgian waffles, seasoned eggs, sausages, croissants & juice',
      image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=800&auto=format&fit=crop',
      badge: 'FOOD TRAY',
      description: 'Golden Belgian waffles, seasoned scrambled eggs, chicken sausages, buttery croissants, fresh fruit cup, yogurt parfait, and freshly squeezed orange juice.'
    },
    {
      id: 8,
      category: 'Food Trays',
      title: 'Royal Brunch Feast & Mocktail Tray',
      price: '₦50,000',
      tagline: 'Fluffy pancakes, maple syrup, grilled peppered wings & Chapman',
      image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',
      badge: 'FOOD TRAY',
      description: 'Fluffy buttermilk pancakes, maple syrup, grilled peppered wings, mini club sandwiches, fruit skewers, donuts, and chilled Chapman mocktail.'
    },
    {
      id: 9,
      category: 'Food Trays',
      title: 'Jollof & Grills Celebration Platter',
      price: '₦42,000',
      tagline: 'Smokey party Jollof rice, peppered turkey & sweet fried dodo',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
      badge: 'FOOD TRAY',
      description: 'Smokey party Jollof rice, peppered turkey drumsticks, sweet fried dodo, spicy beef kebabs, coleslaw, and chilled hibiscus zobo drink.'
    },
    {
      id: 14,
      category: 'Food Trays',
      title: 'Sweet Sunrise Pastry & Fruit Platter',
      price: '₦30,000',
      tagline: 'Assorted Danish pastries, berry skewers, gourmet muffins & mocktail',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      badge: 'FOOD TRAY',
      description: 'Assorted baked pastries, chocolate chip muffins, fresh strawberry and kiwi skewers, with fresh chilled orange nectar.'
    }
  ],
  'money-box': [
    {
      id: 4,
      category: 'Money box',
      title: 'Cash bouquet box',
      price: 'From ₦15,000',
      tagline: 'Fresh roses nestled in an elegant cylinder with cascading real cash',
      image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
      badge: 'MONEY BOX',
      description: 'Fresh roses nestled in an elegant presentation cylinder with cascading real naira notes wrapped securely in transparent floral cones.'
    },
    {
      id: 5,
      category: 'Money box',
      title: 'Tiered money box',
      price: 'From ₦25,000',
      tagline: 'Multi-tiered pull-out money tower with clear cash sleeves & roses',
      image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop',
      badge: 'MONEY BOX',
      description: 'Showstopping multi-tiered pull-out money tower with clear cash sleeves, topped with fresh roses, chocolates, and custom greeting banner.'
    },
    {
      id: 6,
      category: 'Money box',
      title: 'Custom amount box',
      price: 'Priced on request',
      tagline: 'Custom luxury money box tailored to your exact cash denomination',
      image_url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop',
      badge: 'MONEY BOX',
      description: 'Customized luxury money box tailored to your exact cash denomination, presentation box theme, and personal message.'
    },
    {
      id: 15,
      category: 'Money box',
      title: 'Velvet Exploding Surprise Box',
      price: '₦30,000',
      tagline: 'Quad-fold keepsake box that bursts open with client photos & cash',
      image_url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=800&auto=format&fit=crop',
      badge: 'MONEY BOX',
      description: 'Quad-fold velvet keepsake box that bursts open with client photos, cash holders, sweet treats, and flutter butterfly inserts.'
    }
  ],
  hampers: [
    {
      id: 8,
      category: 'Hampers & Gift Boxes',
      title: 'Royal Celebration Gift Hamper',
      price: '₦65,000',
      tagline: 'Imported wine, scented body mist, engraved tumbler & artisan sweets',
      image_url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
      badge: 'HAMPERS',
      description: 'Grand presentation hamper loaded with non-alcoholic sparkling wine, designer body mist, custom engraved tumbler, artisan cookies, and plush teddy.'
    },
    {
      id: 10,
      category: 'Hampers & Gift Boxes',
      title: "Gentleman's Premium Treat Box",
      price: '₦48,000',
      tagline: 'Matte black chest with sparkling grape drink, luxury fragrance & wallet',
      image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
      badge: 'HAMPERS',
      description: 'Matte black keepsake chest with sparkling red grape drink, luxury body fragrance, cozy dress socks, leather wallet, and roasted cashew nuts.'
    },
    {
      id: 11,
      category: 'Hampers & Gift Boxes',
      title: 'Pamper & Glow Sweet Hamper',
      price: '₦40,000',
      tagline: 'Rose water mist, scented soy wax candle, silky eye mask & chocolates',
      image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
      badge: 'HAMPERS',
      description: 'Organic rose water mist, scented soy wax candle, silky eye mask, Ferrero Rocher box, and personalized engraved hot/cold tumbler.'
    },
    {
      id: 12,
      category: 'Hampers & Gift Boxes',
      title: 'Grand Intention Luxury Hamper',
      price: '₦75,000',
      tagline: 'Signature festive hamper with Danish cookies, sparkling wine & tumbler',
      image_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=800&auto=format&fit=crop',
      badge: 'HAMPERS',
      description: 'Our signature festive hamper packed with imported Danish butter cookies, sparkling wine, custom tumbler, artisan snacks, honey jar, and decorative floral bunch.'
    }
  ]
};

interface ServicesShowcaseProps {
  onSelectSegmentCategory?: (categoryKey: string) => void;
  onSelectPackage?: (pkg: Package) => void;
  onOpenBooking: (serviceName?: string) => void;
  settings?: SiteSettings;
}

export const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({
  onSelectSegmentCategory,
  onSelectPackage,
  onOpenBooking,
  settings
}) => {
  const [activeSegment, setActiveSegment] = useState<SegmentId>('surprises');
  const cleanPhone = (settings?.whatsapp_number || '2347014995254').replace(/[^0-9]/g, '');

  const activeSegmentConfig = SEGMENTS.find((s) => s.id === activeSegment) || SEGMENTS[0];
  const displayedCards = SEGMENT_CARDS[activeSegment] || SEGMENT_CARDS.surprises;

  // When a card or "View Details" is clicked:
  // Scrolls down to show the corresponding category section in the simple Image 4 format!
  const handleViewDetails = (card: FeaturedPackageCard) => {
    if (onSelectSegmentCategory) {
      onSelectSegmentCategory(activeSegmentConfig.categoryKey);
    } else {
      const el = document.getElementById('catalogue');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services-section" className="py-16 sm:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[var(--pink)]" />
            <span className="text-xs font-bold text-[var(--pink)] uppercase tracking-wider">
              Signature Surprise Packages
            </span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 tracking-tight">
            Curated Gift Sets
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            Handcrafted with luxury balloons, gourmet treats, and personalized details. Delivered with utmost love and secrecy anywhere in Lagos.
          </p>

          {/* 4 Segment Pills matching Image 1 */}
          <div className="inline-flex items-center flex-wrap justify-center gap-2 sm:gap-2.5 p-1.5 bg-neutral-900 rounded-full mt-7 border border-neutral-800 shadow-md">
            {SEGMENTS.map((seg) => {
              const isActive = activeSegment === seg.id;
              return (
                <button
                  key={seg.id}
                  onClick={() => setActiveSegment(seg.id)}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--pink)] text-white shadow-sm shadow-pink-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {seg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4-Column Grid using the Picture 3 curved aesthetic with Image 2 packages */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSegment}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
          >
            {displayedCards.map((card) => {
              const orderMsg = `Hi Rachy, I would like to order the "${card.title}" (${card.price}) from your website.`;
              const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(orderMsg)}`;

              return (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => handleViewDetails(card)}
                  className="group relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 bg-black flex flex-col justify-end p-6"
                >
                  {/* Background Photo */}
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  {/* Dark Gradient Overlay (Style of Picture 3) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent group-hover:from-black transition-colors" />

                  {/* Price Pill on Top Right */}
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-bold text-[var(--pink)] shadow-md border border-pink-100">
                    {card.price}
                  </div>

                  {/* Top Badge matching Image 1 segment style */}
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/80 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                    {card.badge}
                  </div>

                  {/* Card Content at Bottom */}
                  <div className="relative z-10">
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-white leading-tight mb-1.5 drop-shadow-sm group-hover:text-pink-100 transition-colors">
                      {card.title}
                    </h3>

                    <p className="text-xs text-white/80 line-clamp-2 mb-4 font-normal leading-relaxed">
                      {card.tagline}
                    </p>

                    {/* Actions: View Details (scrolls down to Image 4 simple catalogue) & WhatsApp */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(card);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--pink)] group-hover:text-pink-300 group-hover:translate-x-1 transition-all cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackOutreach('whatsapp', card.title, card.id);
                        }}
                        className="p-2 rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white shadow-xs transition-transform active:scale-90"
                        title="Order via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Custom Planning Strip */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500 mb-3">
            Want to combine items, customize color schemes, or plan an elaborate bedroom setup?
          </p>
          <button
            onClick={() => onOpenBooking('Custom Surprise Setup')}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>Plan a Custom Surprise With Rachy</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
