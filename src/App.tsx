/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Package, SiteSettings, BookingOrder, ReelItem, ServiceCategoryCard } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ServicesShowcase } from './components/ServicesShowcase.tsx';
import { PackageSection } from './components/PackageSection.tsx';
import { PackageModal } from './components/PackageModal.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { TrustBanner } from './components/TrustBanner.tsx';
import { StatsCounter } from './components/StatsCounter.tsx';
import { Footer } from './components/Footer.tsx';
import { PackageSkeleton } from './components/PackageSkeleton.tsx';
import { TestimonialsSection } from './components/TestimonialsSection.tsx';
import { NotFoundPage } from './components/NotFoundPage.tsx';
import { WhatsAppIcon } from './components/WhatsAppIcon.tsx';
import { MessageCircle, Sparkles, Filter, Gift } from 'lucide-react';
import { STARTER_PACKAGES } from './data/starterPackages.ts';
import { STARTER_BOOKINGS } from './data/starterBookings.ts';
import { STARTER_REELS } from './data/starterReels.ts';
import { STARTER_SERVICES } from './data/starterServices.ts';
import { trackVisit, trackOutreach } from './utils/analytics.ts';

// Public multimedia showcase
const ReelsShowcase = React.lazy(() => import('./components/ReelsShowcase.tsx').then((m) => ({ default: m.ReelsShowcase })));

// Production Gateway: Admin suite is loaded via an isolated dynamic gateway only when enabled by build configuration
const AdminGateway = __ENABLE_ADMIN_GATEWAY__
  ? React.lazy(() => import('./admin/AdminGateway.tsx'))
  : null;

type ViewMode = 'public' | 'admin-login' | 'admin-dashboard' | 'not-found';

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  whatsapp_number: '2347014995254',
  instagram_handle: 'rachys_eats_treats',
  instagram_url: 'https://www.instagram.com/rachys_eats_treats?stkn=dXBmc2t5azEzOW44',
  business_name: "Rachy's Eats & Treats",
  location: 'Lagos, Nigeria',
  phone_number: '07014995254'
};

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('public');
  
  // Enforce pure bright white theme permanently
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'dark-theme');
    localStorage.removeItem('rachy_theme');
  }, []);

  // Packages state
  const [packages, setPackages] = useState<Package[]>(() => {
    try {
      const saved = localStorage.getItem('rachy_packages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return STARTER_PACKAGES;
  });

  // Settings state
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('rachy_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SITE_SETTINGS, ...parsed };
      }
    } catch {}
    return DEFAULT_SITE_SETTINGS;
  });

  // Bookings state
  const [bookings, setBookings] = useState<BookingOrder[]>(() => {
    try {
      const saved = localStorage.getItem('rachy_bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return STARTER_BOOKINGS;
  });

  // Reels state with version check to guarantee 6 featured reels with authentic thumbnails are present
  const [reels, setReels] = useState<ReelItem[]>(() => {
    try {
      const saved = localStorage.getItem('rachy_reels_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 6) {
          // Verify they don't contain old unsplash placeholders
          const hasOldUnsplash = parsed.some(r => r.thumbnail_url?.includes('images.unsplash.com/photo-1513151233558'));
          if (!hasOldUnsplash) return parsed;
        }
      }
    } catch {}
    try {
      localStorage.removeItem('rachy_reels');
      localStorage.removeItem('rachy_reels_v3');
      localStorage.removeItem('rachy_reels_v4');
      localStorage.setItem('rachy_reels_v5', JSON.stringify(STARTER_REELS));
    } catch {}
    return STARTER_REELS;
  });

  // Services Showcase Cards state (editable in Admin)
  const [services, setServices] = useState<ServiceCategoryCard[]>(() => {
    try {
      const saved = localStorage.getItem('rachy_services_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return STARTER_SERVICES;
  });

  const [activeCategory, setActiveCategory] = useState<string>('Surprises');
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync URL routing
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      // Secret Admin Access via ?key=rachy or ?portal=manage or /secret-portal or standard /admin
      const isAdminRoute =
        path.startsWith('/admin') ||
        path.startsWith('/secret-portal') ||
        path.startsWith('/ops') ||
        hash === '#admin' ||
        hash === '#/admin' ||
        hash === '#secret-portal' ||
        search.includes('key=rachy') ||
        search.includes('portal=manage') ||
        search.includes('admin');

      if (isAdminRoute) {
        // If Admin Gateway is disabled at build time, completely block admin access and send to not-found
        if (!__ENABLE_ADMIN_GATEWAY__ || !AdminGateway) {
          setViewMode('not-found');
          return;
        }

        const token = sessionStorage.getItem('rachy_admin_token');
        if (token) {
          setViewMode('admin-dashboard');
        } else {
          setViewMode('admin-login');
        }
        return;
      }

      // Check if user navigated to a non-existent subpath (e.g. /random-page or unknown URLs)
      const isKnownPublicPath =
        path === '/' ||
        path === '' ||
        path === '/index.html' ||
        path.startsWith('/#');

      if (!isKnownPublicPath) {
        setViewMode('not-found');
        return;
      }

      setViewMode('public');
      trackVisit();
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (mode: ViewMode, path: string) => {
    setViewMode(mode);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load packages and settings safely
  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPackages(data);
          localStorage.setItem('rachy_packages', JSON.stringify(data));
          return;
        }
      }
    } catch (err) {
      console.warn('Backend /api/packages unavailable, using local cache:', err);
    }
    try {
      const saved = localStorage.getItem('rachy_packages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setPackages(parsed);
      }
    } catch {}
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        const merged = { ...DEFAULT_SITE_SETTINGS, ...data };
        setSettings(merged);
        localStorage.setItem('rachy_settings', JSON.stringify(merged));
        return;
      }
    } catch (err) {
      console.warn('Backend /api/settings unavailable, using local cache:', err);
    }
    try {
      const saved = localStorage.getItem('rachy_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SITE_SETTINGS, ...parsed });
      }
    } catch {}
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
          localStorage.setItem('rachy_services_v1', JSON.stringify(data));
          return;
        }
      }
    } catch (err) {
      console.warn('Backend /api/services unavailable, using local cache:', err);
    }
    try {
      const saved = localStorage.getItem('rachy_services_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setServices(parsed);
      }
    } catch {}
  };

  const fetchReels = async () => {
    try {
      const res = await fetch('/api/reels');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setReels(data);
          localStorage.setItem('rachy_reels_v5', JSON.stringify(data));
          return;
        }
      }
    } catch (err) {
      console.warn('Backend /api/reels unavailable, using local cache:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = sessionStorage.getItem('rachy_admin_token');
      if (!token) return;
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setBookings(data);
          localStorage.setItem('rachy_bookings', JSON.stringify(data));
        }
      }
    } catch (err) {
      console.warn('Backend /api/bookings unavailable, using local cache:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPackages(), fetchSettings(), fetchServices(), fetchReels(), fetchBookings()]);
      setLoading(false);
    };
    init();
  }, []);

  // Compute categories dynamically from packages
  const categories = useMemo(() => {
    const set = new Set<string>();
    packages.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [packages]);

  // Normalize category names to the 4 canonical groups from Image 1
  const normalizeCategory = (cat?: string): string => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('surprise') || lower.includes('birthday')) return 'Surprises';
    if (lower.includes('food') || lower.includes('tray')) return 'Food tray';
    if (lower.includes('money')) return 'Money box';
    if (lower.includes('hamper') || lower.includes('gift')) return 'Hampers';
    return cat || 'Surprises';
  };

  // Group packages by normalized category in exact canonical order
  const groupedPackages = useMemo(() => {
    const map: Record<string, Package[]> = {
      'Surprises': [],
      'Food tray': [],
      'Money box': [],
      'Hampers': []
    };

    packages.forEach((p) => {
      const cat = normalizeCategory(p.category);
      if (!map[cat]) map[cat] = [];
      map[cat].push({ ...p, category: cat });
    });

    Object.keys(map).forEach((cat) => {
      map[cat].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    });

    // Remove empty categories if any
    Object.keys(map).forEach((cat) => {
      if (map[cat].length === 0) delete map[cat];
    });

    return map;
  }, [packages]);

  const handleSelectCategory = (cat: string) => {
    if (cat === activeCategory) {
      const catalogueEl = document.getElementById('catalogue');
      if (catalogueEl) catalogueEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setIsFiltering(true);
    setActiveCategory(cat);
    setTimeout(() => {
      const catalogueEl = document.getElementById('catalogue');
      if (catalogueEl) catalogueEl.scrollIntoView({ behavior: 'smooth' });
    }, 40);
    setTimeout(() => {
      setIsFiltering(false);
    }, 260);
  };

  const handleLoginSuccess = () => {
    navigateTo('admin-dashboard', '/admin/dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    sessionStorage.removeItem('rachy_admin_token');
    navigateTo('public', '/');
  };

  const handleUpdateSettings = async (newSettings: SiteSettings) => {
    setSettings(newSettings);
    localStorage.setItem('rachy_settings', JSON.stringify(newSettings));
    try {
      const token = sessionStorage.getItem('rachy_admin_token');
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newSettings)
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const saved = await res.json();
        setSettings(saved);
        localStorage.setItem('rachy_settings', JSON.stringify(saved));
      }
    } catch (err) {
      console.warn('Backend unavailable, settings saved locally:', err);
    }
  };

  const handleCreateBooking = (newBooking: BookingOrder) => {
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    localStorage.setItem('rachy_bookings', JSON.stringify(updated));
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking)
    }).catch(e => console.warn('Sync booking error:', e));
  };

  const handleOpenBookingModal = (serviceName?: string) => {
    handleBookSurprise(serviceName);
  };

  const handleBookSurprise = (serviceName?: string) => {
    if (serviceName) {
      setPreselectedService(serviceName);
    }
    const contactEl = document.getElementById('contact-section');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Views Router
  if (viewMode === 'admin-login' || viewMode === 'admin-dashboard') {
    if (!__ENABLE_ADMIN_GATEWAY__ || !AdminGateway) {
      return (
        <NotFoundPage
          onBackToHome={() => navigateTo('public', '/')}
          settings={settings}
        />
      );
    }

    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-300">
            <div className="w-8 h-8 border-2 border-[var(--pink)] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium">Securing administrative session...</p>
          </div>
        }
      >
        <AdminGateway
          viewMode={viewMode}
          packages={packages}
          settings={settings}
          bookings={bookings}
          reels={reels}
          services={services}
          onRefreshPackages={fetchPackages}
          onUpdateSettings={handleUpdateSettings}
          onLogout={handleLogout}
          onBackToSite={() => navigateTo('public', '/')}
          onUpdateBookings={(b) => setBookings(b)}
          onUpdateReels={(r) => {
            setReels(r);
            try {
              localStorage.setItem('rachy_reels_v5', JSON.stringify(r));
              const token = sessionStorage.getItem('rachy_admin_token');
              fetch('/api/reels', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(r)
              }).catch(e => console.warn('Sync reels warning:', e));
            } catch {}
          }}
          onUpdateServices={(s) => {
            setServices(s);
            try {
              localStorage.setItem('rachy_services_v1', JSON.stringify(s));
              const token = sessionStorage.getItem('rachy_admin_token');
              fetch('/api/services', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(s)
              }).catch(e => console.warn('Sync services warning:', e));
            } catch {}
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      </React.Suspense>
    );
  }

  if (viewMode === 'not-found') {
    return (
      <NotFoundPage
        onBackToHome={() => navigateTo('public', '/')}
        settings={settings}
      />
    );
  }

  // Public Marketing Website
  return (
    <div id="rachys-public-app" className="min-h-screen bg-white text-gray-900 selection:bg-[var(--pink)] selection:text-white transition-colors">
      
      {/* Sticky Header with Navigation & Direct WhatsApp */}
      <Navbar
        settings={settings}
        onOpenBooking={() => handleBookSurprise()}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => handleSelectCategory(cat)}
        categories={categories}
      />

      {/* Hero Section */}
      <Hero
        settings={settings}
        onOpenBooking={() => handleBookSurprise()}
        onExploreClick={() => {
          const catalogueEl = document.getElementById('catalogue');
          if (catalogueEl) catalogueEl.scrollIntoView({ behavior: 'smooth' });
        }}
        onWatchActionClick={() => {
          const reelsEl = document.getElementById('reels-section');
          if (reelsEl) reelsEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Lagos Trust & Assurance Strip */}
      <TrustBanner />

      {/* Featured Curated Packages (Style of Picture 3 with Image 2 Birthday Packages) */}
      <ServicesShowcase
        services={services}
        activeCategory={activeCategory}
        onSelectSegmentCategory={(categoryKey) => {
          handleSelectCategory(categoryKey);
        }}
        packages={packages}
        onSelectPackage={(pkg) => setSelectedPackage(pkg)}
        onOpenBooking={(serviceName) => handleBookSurprise(serviceName)}
        settings={settings}
      />

      {/* "See Us In Action" Instagram Reels Feed with In-Page Floating Player */}
      <React.Suspense
        fallback={
          <div className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-6 w-48 bg-stone-100 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[9/16] bg-stone-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        }
      >
        <ReelsShowcase
          reels={reels}
          settings={settings}
          instagramUrl={settings.instagram_url || `https://www.instagram.com/${settings.instagram_handle.replace('@', '')}`}
        />
      </React.Suspense>

      {/* Main Public Catalogue */}
      <main id="packages-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 scroll-mt-20">
        <div id="catalogue" className="scroll-mt-20" />
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-[var(--pink)] text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Celebrations</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight">
            Curated Gift Packages
          </h2>
          <p className="font-sans text-sm text-gray-600 mt-2">
            Select a package below to inspect details or order directly through WhatsApp with custom notes and delivery preferences.
          </p>

          {/* Active Filter Indicator - only shown when a category is selected in Nav Bar */}
          {activeCategory !== 'all' && (
            <div className="mt-5 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-xs text-gray-800 shadow-xs animate-in fade-in">
              <span>
                Filtered by: <strong className="text-[var(--pink)] font-bold capitalize">{activeCategory}</strong>
              </span>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => handleSelectCategory('all')}
                className="text-[var(--pink)] hover:text-[var(--pink-hover)] font-semibold underline cursor-pointer"
              >
                Reset to All Packages
              </button>
            </div>
          )}
        </div>

        {/* Filtered / Full Package Sections with Skeleton & Fade-In Animation */}
        {loading || isFiltering ? (
          <PackageSkeleton
            count={activeCategory === 'all' ? 6 : 3}
            categoryTitle={activeCategory === 'all' ? 'All Packages' : activeCategory}
          />
        ) : activeCategory === 'all' ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            {Object.keys(groupedPackages).map((cat) => (
              <PackageSection
                key={cat}
                category={cat}
                packages={groupedPackages[cat]}
                settings={settings}
                onViewDetails={(pkg) => setSelectedPackage(pkg)}
              />
            ))}
          </div>
        ) : (() => {
          const matchedKey =
            groupedPackages[activeCategory]
              ? activeCategory
              : Object.keys(groupedPackages).find(
                  (k) =>
                    k.toLowerCase().includes(activeCategory.toLowerCase()) ||
                    activeCategory.toLowerCase().includes(k.toLowerCase())
                );

          if (matchedKey && groupedPackages[matchedKey]) {
            return (
              <div key={matchedKey} className="animate-in fade-in duration-300">
                <PackageSection
                  category={matchedKey}
                  packages={groupedPackages[matchedKey]}
                  settings={settings}
                  onViewDetails={(pkg) => setSelectedPackage(pkg)}
                />
              </div>
            );
          }

          return (
            <div className="text-center py-16 text-gray-500 animate-in fade-in duration-300">
              <p>No packages found in this category.</p>
              <button
                onClick={() => handleSelectCategory('all')}
                className="mt-4 px-5 py-2 rounded-full bg-[var(--pink)] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Show All Packages
              </button>
            </div>
          );
        })()}

        {/* Custom Surprise Callout Box */}
        <section className="mt-16 sm:mt-24 p-8 sm:p-12 rounded-3xl bg-pink-50/60 border border-pink-200 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xs">
          <div
            className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ background: 'var(--pink)' }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-xl">
            <span className="text-xs uppercase tracking-wider font-bold text-[var(--pink)]">
              Bespoke Requests
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-gray-900 mt-1 mb-2">
              Have something unique in mind?
            </h3>
            <p className="font-sans text-xs sm:text-sm text-gray-600 leading-relaxed">
              From giant balloon bouquets to hotel room romantic setups, live saxophone serenades, and multi-tier currency towers, Rachy tailors every heartbeat.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleBookSurprise()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Book a Custom Surprise</span>
            </button>

            <a
              id="custom-order-whatsapp-btn"
              href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                "Hi Rachy, I would like to discuss a custom surprise package not listed on the website!"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutreach('whatsapp', 'Bottom CTA - Custom Surprise Consultation')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <WhatsAppIcon className="w-5 h-5 rounded-xs" />
              <span>Talk on WhatsApp</span>
            </a>
          </div>
        </section>

      </main>

      {/* About Section */}
      <AboutSection
        settings={settings}
        onOpenBooking={() => handleBookSurprise()}
        onBookSurprise={() => handleBookSurprise()}
        instagramUrl={settings.instagram_url || `https://www.instagram.com/${settings.instagram_handle.replace('@', '')}`}
      />

      {/* Contact & Inquiry Section */}
      <ContactSection
        settings={settings}
        selectedService={preselectedService}
        onBookingSubmitted={handleCreateBooking}
      />

      {/* Customer Reviews & Testimonials Carousel with Photo Proof */}
      <TestimonialsSection />

      {/* Impact Numbers & Assurance */}
      <StatsCounter />

      {/* Package Detail Modal */}
      <PackageModal
        pkg={selectedPackage}
        settings={settings}
        onClose={() => setSelectedPackage(null)}
      />

      {/* Interactive Booking / Surprise Request Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        settings={settings}
        preselectedService={preselectedService}
        onSubmitBooking={handleCreateBooking}
      />

      {/* Brand Footer */}
      <Footer
        settings={settings}
        onOpenBooking={() => handleBookSurprise()}
      />

      {/* Floating Instant WhatsApp Button (Highly visible on all mobile screens) */}
      <a
        id="floating-mobile-whatsapp-btn"
        href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
          "Hi Rachy! I saw your website and would love to plan a surprise package."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackOutreach('whatsapp', 'Floating Mobile WhatsApp Button')}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold text-xs sm:text-sm shadow-2xl active:scale-95 transition-all border-2 border-white cursor-pointer group"
        aria-label="Direct WhatsApp Chat"
      >
        <WhatsAppIcon className="w-6 h-6 shrink-0" />
        <span className="hidden sm:inline font-bold">Chat with Rachy</span>
      </a>
    </div>
  );
}
