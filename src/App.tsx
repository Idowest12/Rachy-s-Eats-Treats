/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Package, SiteSettings, BookingOrder, ReelItem } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ServicesShowcase } from './components/ServicesShowcase.tsx';
import { ReelsShowcase } from './components/ReelsShowcase.tsx';
import { PackageSection } from './components/PackageSection.tsx';
import { PackageModal } from './components/PackageModal.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { TrustBanner } from './components/TrustBanner.tsx';
import { StatsCounter } from './components/StatsCounter.tsx';
import { Footer } from './components/Footer.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { MessageCircle, Sparkles, Filter, Gift } from 'lucide-react';
import { STARTER_PACKAGES } from './data/starterPackages.ts';
import { STARTER_BOOKINGS } from './data/starterBookings.ts';
import { STARTER_REELS } from './data/starterReels.ts';
import { trackVisit, trackOutreach } from './utils/analytics.ts';

type ViewMode = 'public' | 'admin-login' | 'admin-dashboard';

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

  // Reels state
  const [reels, setReels] = useState<ReelItem[]>(() => {
    try {
      const saved = localStorage.getItem('rachy_reels');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return STARTER_REELS;
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync URL routing
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      const isAdminRoute =
        path.startsWith('/admin') ||
        hash === '#admin' ||
        hash === '#/admin' ||
        search.includes('admin');

      if (isAdminRoute) {
        const token = sessionStorage.getItem('rachy_admin_token');
        if (token) {
          setViewMode('admin-dashboard');
        } else {
          setViewMode('admin-login');
        }
      } else {
        setViewMode('public');
        trackVisit();
      }
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

  const checkAuthStatus = async () => {
    try {
      const token = sessionStorage.getItem('rachy_admin_token');
      if (!token) {
        setIsAdminLoggedIn(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch('/api/auth/status', { headers });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setIsAdminLoggedIn(Boolean(data.authenticated));
      } else {
        setIsAdminLoggedIn(true);
      }
    } catch (err) {
      const token = sessionStorage.getItem('rachy_admin_token');
      setIsAdminLoggedIn(Boolean(token));
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPackages(), fetchSettings(), checkAuthStatus()]);
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

  // Group packages by category
  const groupedPackages = useMemo(() => {
    const map: Record<string, Package[]> = {};
    packages.forEach((p) => {
      const cat = p.category || 'Special Offers';
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    Object.keys(map).forEach((cat) => {
      map[cat].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    });
    return map;
  }, [packages]);

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'all') {
      const el = document.getElementById('catalogue');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const sectionId = `category-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        const catContainer = document.getElementById('catalogue');
        if (catContainer) catContainer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    navigateTo('admin-dashboard', '/admin/dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    sessionStorage.removeItem('rachy_admin_token');
    setIsAdminLoggedIn(false);
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
  if (viewMode === 'admin-login') {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToSite={() => navigateTo('public', '/')}
      />
    );
  }

  if (viewMode === 'admin-dashboard') {
    return (
      <AdminDashboard
        packages={packages}
        settings={settings}
        bookings={bookings}
        reels={reels}
        onRefreshPackages={fetchPackages}
        onUpdateSettings={handleUpdateSettings}
        onLogout={handleLogout}
        onBackToSite={() => navigateTo('public', '/')}
        onUpdateBookings={(b) => setBookings(b)}
        onUpdateReels={(r) => setReels(r)}
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
        onOpenAdmin={() => navigateTo('admin-login', '/admin')}
        isAdminLoggedIn={isAdminLoggedIn}
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
        onSelectSegmentCategory={(categoryKey) => {
          setActiveCategory(categoryKey);
          const catalogueEl = document.getElementById('catalogue');
          if (catalogueEl) catalogueEl.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectPackage={(pkg) => setSelectedPackage(pkg)}
        onOpenBooking={(serviceName) => handleBookSurprise(serviceName)}
        settings={settings}
      />

      {/* "See Us In Action" Instagram Reels Feed with In-Page Floating Player */}
      <ReelsShowcase
        reels={reels}
        settings={settings}
        instagramUrl={settings.instagram_url || `https://www.instagram.com/${settings.instagram_handle.replace('@', '')}`}
      />

      {/* Main Public Catalogue */}
      <main id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
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

          {/* 4 Segment Category Filter Pills matching Image 1 */}
          <div className="inline-flex items-center flex-wrap justify-center gap-2 sm:gap-2.5 p-1.5 bg-neutral-900 rounded-full mt-6 border border-neutral-800 shadow-md">
            {[
              { id: 'all', label: 'All Packages', categoryKey: 'all' },
              { id: 'surprises', label: 'Surprises', categoryKey: 'Birthday Sets' },
              { id: 'food-tray', label: 'Food tray', categoryKey: 'Food Trays' },
              { id: 'money-box', label: 'Money box', categoryKey: 'Money box' },
              { id: 'hampers', label: 'Hampers', categoryKey: 'Hampers & Gift Boxes' },
            ].map((seg) => {
              const isActive =
                activeCategory === seg.categoryKey ||
                (seg.categoryKey !== 'all' &&
                  (activeCategory.toLowerCase().includes(seg.label.toLowerCase()) ||
                    seg.label.toLowerCase().includes(activeCategory.toLowerCase())));

              return (
                <button
                  key={seg.id}
                  onClick={() => {
                    setActiveCategory(seg.categoryKey);
                  }}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
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

        {/* Filtered / Full Package Sections */}
        {activeCategory === 'all' ? (
          Object.keys(groupedPackages).map((cat) => (
            <PackageSection
              key={cat}
              category={cat}
              packages={groupedPackages[cat]}
              settings={settings}
              onViewDetails={(pkg) => setSelectedPackage(pkg)}
            />
          ))
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
              <PackageSection
                category={matchedKey}
                packages={groupedPackages[matchedKey]}
                settings={settings}
                onViewDetails={(pkg) => setSelectedPackage(pkg)}
              />
            );
          }

          return (
            <div className="text-center py-16 text-gray-500">
              <p>No packages found in this category.</p>
              <button
                onClick={() => setActiveCategory('all')}
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
              <MessageCircle className="w-4 h-4 fill-white/20" />
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
        onOpenAdmin={() => navigateTo('admin-login', '/admin')}
        onOpenBooking={() => handleBookSurprise()}
      />
    </div>
  );
}
