/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Package, SiteSettings } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { PackageSection } from './components/PackageSection.tsx';
import { PackageModal } from './components/PackageModal.tsx';
import { TrustBanner } from './components/TrustBanner.tsx';
import { StatsCounter } from './components/StatsCounter.tsx';
import { Footer } from './components/Footer.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { MessageCircle, Sparkles, Filter } from 'lucide-react';
import { STARTER_PACKAGES } from './data/starterPackages.ts';
import { trackVisit, trackOutreach } from './utils/analytics.ts';

type ViewMode = 'public' | 'admin-login' | 'admin-dashboard';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('public');
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

  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('rachy_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      whatsapp_number: '2347014995254',
      instagram_handle: 'rachys_eats_and_treats',
      business_name: "Rachy's Eats & Treats",
      location: 'Lagos, Nigeria'
    };
  });
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
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
    // Cache fallback
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
        setSettings(data);
        localStorage.setItem('rachy_settings', JSON.stringify(data));
        return;
      }
    } catch (err) {
      console.warn('Backend /api/settings unavailable, using local cache:', err);
    }
    try {
      const saved = localStorage.getItem('rachy_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
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
        // In static deployments, valid token in session storage allows logged-in state
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
    // Sort items within categories
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

  const handleLoginSuccess = (token?: string) => {
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
        onRefreshPackages={fetchPackages}
        onUpdateSettings={handleUpdateSettings}
        onLogout={handleLogout}
        onBackToSite={() => navigateTo('public', '/')}
      />
    );
  }

  // Public Marketing Website
  return (
    <div id="rachys-public-app" className="min-h-screen bg-[#0e0c0b] text-[#f5ece2] selection:bg-[#e2417e] selection:text-white">
      
      {/* Sticky Header with Dynamic Navigation Pills */}
      <Navbar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        settings={settings}
      />

      {/* Hero Section */}
      <Hero
        settings={settings}
        onExploreClick={() => {
          const catalogueEl = document.getElementById('catalogue');
          if (catalogueEl) catalogueEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Lagos Trust & Assurance Strip */}
      <TrustBanner />

      {/* Main Public Catalogue */}
      <main id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17140f] border border-[rgba(245,236,226,0.12)] text-[#e2417e] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Curated Collection</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#f5ece2] tracking-tight">
            Celebration Packages
          </h2>
          <p className="font-sans text-sm text-[#b8a89d] mt-2">
            Select a package below to inspect details or order directly through WhatsApp with custom notes and delivery preferences.
          </p>
        </div>

        {/* Filtered / Full Package Sections */}
        {activeCategory === 'all' ? (
          // Grouped by Category
          Object.keys(groupedPackages).map((cat) => (
            <PackageSection
              key={cat}
              category={cat}
              packages={groupedPackages[cat]}
              settings={settings}
              onViewDetails={(pkg) => setSelectedPackage(pkg)}
            />
          ))
        ) : (
          // Single Selected Category
          groupedPackages[activeCategory] ? (
            <PackageSection
              category={activeCategory}
              packages={groupedPackages[activeCategory]}
              settings={settings}
              onViewDetails={(pkg) => setSelectedPackage(pkg)}
            />
          ) : (
            <div className="text-center py-16 text-[#b8a89d]">
              <p>No packages found in this category.</p>
              <button
                onClick={() => setActiveCategory('all')}
                className="mt-4 px-4 py-2 rounded-full bg-[#e2417e] text-white text-xs font-semibold"
              >
                Show All Packages
              </button>
            </div>
          )
        )}

        {/* Custom Surprise Callout Box */}
        <section className="mt-16 sm:mt-24 p-8 sm:p-12 rounded-3xl bg-[#17140f] border border-[rgba(245,236,226,0.15)] relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div
            className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ background: '#e2417e' }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-xl">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#e2417e]">
              Bespoke Requests
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#f5ece2] mt-1 mb-2">
              Have something unique in mind?
            </h3>
            <p className="font-sans text-sm text-[#b8a89d] leading-relaxed">
              From giant 6-foot balloon bouquets to midnight hotel room decor and custom currency arrangements, Rachy coordinates every special detail.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <a
              id="custom-order-whatsapp-btn"
              href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                "Hi Rachy, I would like to discuss a custom surprise package not listed on the website!"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackOutreach('whatsapp', 'Bottom CTA - Custom Surprise Consultation')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#e2417e] hover:bg-[#c92e6c] text-white font-semibold text-sm transition-all shadow-lg shadow-[#e2417e]/20 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Talk to Rachy on WhatsApp</span>
            </a>
          </div>
        </section>

      </main>

      {/* Details & WhatsApp Order Modal */}
      <PackageModal
        pkg={selectedPackage}
        settings={settings}
        onClose={() => setSelectedPackage(null)}
      />

      {/* Impact Numbers & Assurance with Counting Animation when scrolled down */}
      <StatsCounter />

      {/* Brand Footer */}
      <Footer
        settings={settings}
      />
    </div>
  );
}
