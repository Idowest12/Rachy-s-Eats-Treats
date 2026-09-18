import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Gift,
  Video,
  Settings,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  ArrowLeft,
  Search,
  Check,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Clock,
  MapPin,
  X,
  Phone,
  Instagram,
  User,
  Calendar,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { Package, SiteSettings, StorageStatus, BookingOrder, ReelItem, ServiceCategoryCard } from '../types.ts';
import { STARTER_PACKAGES } from '../data/starterPackages.ts';
import { STARTER_BOOKINGS } from '../data/starterBookings.ts';
import { STARTER_REELS } from '../data/starterReels.ts';
import { STARTER_SERVICES } from '../data/starterServices.ts';
import { RachyLogo } from './RachyLogo.tsx';
import { ImageUploadField } from './ImageUploadField.tsx';
import { getInstagramEmbedUrl, FALLBACK_REEL_COVERS } from '../utils/instagram.ts';

interface AdminDashboardProps {
  packages: Package[];
  settings: SiteSettings;
  onRefreshPackages: () => Promise<void>;
  onUpdateSettings: (newSettings: SiteSettings) => Promise<void>;
  onLogout: () => void;
  onBackToSite: () => void;
  bookings?: BookingOrder[];
  reels?: ReelItem[];
  services?: ServiceCategoryCard[];
  onUpdateBookings?: (bookings: BookingOrder[]) => void;
  onUpdateReels?: (reels: ReelItem[]) => void;
  onUpdateServices?: (services: ServiceCategoryCard[]) => void;
}

type TabType = 'bookings' | 'packages' | 'services' | 'reels' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  packages,
  settings,
  onRefreshPackages,
  onUpdateSettings,
  onLogout,
  onBackToSite,
  bookings: initialBookings,
  reels: initialReels,
  services: initialServices,
  onUpdateBookings,
  onUpdateReels,
  onUpdateServices
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Clean bookings state for self-testing
  const [bookings, setBookings] = useState<BookingOrder[]>(() => {
    if (initialBookings && initialBookings.length > 0) return initialBookings;
    const saved = localStorage.getItem('rachy_bookings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return STARTER_BOOKINGS;
  });

  // Reels state
  const [reels, setReels] = useState<ReelItem[]>(() => {
    if (initialReels && initialReels.length > 0) return initialReels;
    const saved = localStorage.getItem('rachy_reels_v5');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return STARTER_REELS;
  });

  // Services Showcase Cards state
  const [services, setServices] = useState<ServiceCategoryCard[]>(() => {
    if (initialServices && initialServices.length > 0) return initialServices;
    const saved = localStorage.getItem('rachy_services_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return STARTER_SERVICES;
  });

  // Package Modal states
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form states for package
  const [formCategory, setFormCategory] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Service Card modal states
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCategoryCard | null>(null);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceBadge, setServiceBadge] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceCategoryKey, setServiceCategoryKey] = useState('');
  const [serviceImage, setServiceImage] = useState('');
  const [serviceTagline, setServiceTagline] = useState('');
  const [serviceWhatsappMsg, setServiceWhatsappMsg] = useState('');
  const [serviceDeleteConfirmId, setServiceDeleteConfirmId] = useState<string | null>(null);

  // Booking Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingClientName, setBookingClientName] = useState('');
  const [bookingClientPhone, setBookingClientPhone] = useState('');
  const [bookingRecipientName, setBookingRecipientName] = useState('');
  const [bookingOccasion, setBookingOccasion] = useState('Birthday');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('11:00 AM');
  const [bookingLocation, setBookingLocation] = useState('');
  const [bookingPackageTitle, setBookingPackageTitle] = useState('');
  const [bookingBudget, setBookingBudget] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  // Settings form states
  const [settingsPhone, setSettingsPhone] = useState(settings?.whatsapp_number || '2347014995254');
  const [settingsDirectPhone, setSettingsDirectPhone] = useState(settings?.phone_number || '07014995254');
  const [settingsIg, setSettingsIg] = useState(settings?.instagram_handle || 'rachys_eats_treats');
  const [settingsIgUrl, setSettingsIgUrl] = useState(settings?.instagram_url || 'https://www.instagram.com/rachys_eats_treats?stkn=dXBmc2t5azEzOW44');
  const [settingsBusinessName, setSettingsBusinessName] = useState(settings?.business_name || "Rachy's Eats & Treats");
  const [settingsLocation, setSettingsLocation] = useState(settings?.location || 'Lagos, Nigeria');
  const [settingsHeroTitle, setSettingsHeroTitle] = useState(settings?.hero_title || '');
  const [settingsHeroSubtitle, setSettingsHeroSubtitle] = useState(settings?.hero_subtitle || '');
  const [settingsHeroImage, setSettingsHeroImage] = useState(settings?.hero_image_url || '');
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);

  // Reel form modal (with custom thumbnail image upload & link support)
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<ReelItem | null>(null);
  const [reelTitle, setReelTitle] = useState('');
  const [reelOccasion, setReelOccasion] = useState('Birthday Setup');
  const [reelLink, setReelLink] = useState('');
  const [reelThumbnail, setReelThumbnail] = useState('');
  const [reelCaption, setReelCaption] = useState('');

  const categories = Array.from(new Set(packages.map((p) => p.category).filter(Boolean)));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getAuthHeader = () => {
    const token = sessionStorage.getItem('rachy_admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const saveBookings = (updated: BookingOrder[]) => {
    setBookings(updated);
    localStorage.setItem('rachy_bookings', JSON.stringify(updated));
    if (onUpdateBookings) onUpdateBookings(updated);
  };

  const saveReels = (updated: ReelItem[]) => {
    setReels(updated);
    localStorage.setItem('rachy_reels_v5', JSON.stringify(updated));
    if (onUpdateReels) onUpdateReels(updated);
  };

  // --- Package CRUD ---
  const handleOpenAddPackage = () => {
    setEditingPackage(null);
    setFormCategory(categories[0] || 'Birthday Sets');
    setFormTitle('');
    setFormPrice('');
    setFormImage('');
    setFormDescription('');
    setFormError(null);
    setIsPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormCategory(pkg.category);
    setFormTitle(pkg.title);
    setFormPrice(pkg.price);
    setFormImage(pkg.image_url);
    setFormDescription(pkg.description || '');
    setFormError(null);
    setIsPackageModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const payload = {
      category: formCategory.trim(),
      title: formTitle.trim(),
      price: formPrice.trim(),
      image_url: formImage.trim(),
      description: formDescription.trim(),
      sort_order: editingPackage ? editingPackage.sort_order : packages.length + 1
    };

    try {
      if (editingPackage) {
        const res = await fetch(`/api/packages/${editingPackage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update package');
        showToast('Package updated successfully');
      } else {
        const res = await fetch('/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create package');
        showToast('New package added to catalogue');
      }
      await onRefreshPackages();
      setIsPackageModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error saving package');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeletePackage = async (id: number) => {
    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (!res.ok) throw new Error('Failed to delete package');
      showToast('Package deleted');
      setDeleteConfirmId(null);
      await onRefreshPackages();
    } catch (err: any) {
      showToast(err.message || 'Error deleting package');
    }
  };

  // --- Booking CRUD ---
  const handleOpenAddBooking = () => {
    setBookingClientName('');
    setBookingClientPhone('');
    setBookingRecipientName('');
    setBookingOccasion('Birthday');
    setBookingDate('Tomorrow');
    setBookingTime('11:00 AM');
    setBookingLocation('Lekki Phase 1');
    setBookingPackageTitle('');
    setBookingBudget('₦50,000');
    setBookingNotes('');
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: BookingOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      client_name: bookingClientName,
      client_phone: bookingClientPhone,
      recipient_name: bookingRecipientName || bookingClientName,
      occasion: bookingOccasion,
      package_title: bookingPackageTitle || 'Custom Surprise Package',
      delivery_date: bookingDate || 'Upcoming',
      delivery_time: bookingTime,
      location_area: bookingLocation || 'Lagos',
      delivery_address: bookingLocation,
      add_ons: [],
      budget_estimate: bookingBudget,
      status: 'Inquiry',
      created_at: new Date().toISOString(),
      notes: bookingNotes
    };
    saveBookings([newBooking, ...bookings]);
    setIsBookingModalOpen(false);
    showToast('Test booking added!');
  };

  const handleUpdateBookingStatus = (id: string, status: BookingOrder['status']) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    saveBookings(updated);
    showToast(`Order status updated to ${status}`);
  };

  const handleDeleteBooking = (id: string) => {
    const updated = bookings.filter((b) => b.id !== id);
    saveBookings(updated);
    showToast('Booking record removed');
  };

  // --- Services Showcase CRUD ---
  const saveServices = async (updated: ServiceCategoryCard[]) => {
    setServices(updated);
    localStorage.setItem('rachy_services_v1', JSON.stringify(updated));
    if (onUpdateServices) onUpdateServices(updated);
    try {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      // Handled gracefully offline
    }
  };

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceTitle('');
    setServiceBadge('SPECIAL');
    setServicePrice('From ₦25,000');
    setServiceCategoryKey('Surprises');
    setServiceImage('');
    setServiceTagline('');
    setServiceWhatsappMsg('');
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: ServiceCategoryCard) => {
    setEditingService(srv);
    setServiceTitle(srv.title);
    setServiceBadge(srv.badge);
    setServicePrice(srv.price);
    setServiceCategoryKey(srv.categoryKey);
    setServiceImage(srv.image_url);
    setServiceTagline(srv.tagline);
    setServiceWhatsappMsg(srv.whatsappMessage || '');
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle.trim() || !serviceImage.trim()) {
      showToast('Title and Image are required for the service card');
      return;
    }

    const payload: ServiceCategoryCard = {
      id: editingService ? editingService.id : `service-${Date.now()}`,
      title: serviceTitle.trim(),
      badge: (serviceBadge || serviceTitle).toUpperCase().trim(),
      price: servicePrice.trim() || 'Custom Quote',
      categoryKey: serviceCategoryKey.trim() || serviceTitle.trim(),
      image_url: serviceImage.trim(),
      tagline: serviceTagline.trim(),
      whatsappMessage:
        serviceWhatsappMsg.trim() ||
        `Hi Rachy, I would like to inquire about your ${serviceTitle.trim()} packages from your website!`
    };

    let updated: ServiceCategoryCard[];
    if (editingService) {
      updated = services.map((s) => (s.id === editingService.id ? payload : s));
    } else {
      updated = [...services, payload];
    }

    saveServices(updated);
    setIsServiceModalOpen(false);
    showToast(editingService ? 'Service card updated' : 'New service card added');
  };

  const handleDeleteService = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    saveServices(updated);
    setServiceDeleteConfirmId(null);
    showToast('Service card removed');
  };

  const handleResetServices = () => {
    if (window.confirm('Reset service cards to the original 4 defaults (Surprises, Food tray, Money box, Hampers)?')) {
      saveServices(STARTER_SERVICES);
      showToast('Reset to default 4 service cards');
    }
  };

  // --- Reel CRUD ---
  const handleOpenAddReel = () => {
    setEditingReel(null);
    setReelTitle('');
    setReelOccasion('Birthday Setup');
    setReelLink('');
    setReelThumbnail('');
    setReelCaption('');
    setIsReelModalOpen(true);
  };

  const handleOpenEditReel = (reel: ReelItem) => {
    setEditingReel(reel);
    setReelTitle(reel.title);
    setReelOccasion(reel.occasion);
    setReelLink(reel.video_url || reel.instagram_url || '');
    setReelThumbnail(reel.thumbnail_url || '');
    setReelCaption(reel.caption || '');
    setIsReelModalOpen(true);
  };

  const handleSaveReel = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalThumbnail = reelThumbnail.trim();

    // If no custom thumbnail was uploaded/provided and it's an Instagram link, try auto-fetch
    if (!finalThumbnail && reelLink.includes('instagram.com')) {
      try {
        const res = await fetch(`/api/instagram-thumbnail?url=${encodeURIComponent(reelLink.trim())}`);
        const data = await res.json();
        if (data.success && data.thumbnailUrl) {
          finalThumbnail = data.thumbnailUrl;
        }
      } catch (err) {
        console.warn('Could not auto-fetch Instagram thumbnail:', err);
      }
    }

    if (!finalThumbnail) {
      finalThumbnail = FALLBACK_REEL_COVERS[reels.length % FALLBACK_REEL_COVERS.length];
    }

    const payload: ReelItem = {
      id: editingReel ? editingReel.id : `reel-${Date.now()}`,
      title: reelTitle.trim(),
      occasion: reelOccasion.trim(),
      video_url: reelLink.trim(),
      instagram_url: reelLink.trim() || settingsIgUrl || `https://www.instagram.com/${settingsIg.replace('@', '')}`,
      thumbnail_url: finalThumbnail,
      caption: reelCaption.trim()
    };

    let updated: ReelItem[];
    if (editingReel) {
      updated = reels.map((r) => (r.id === editingReel.id ? payload : r));
    } else {
      updated = [payload, ...reels];
    }
    saveReels(updated);
    setIsReelModalOpen(false);
    showToast(editingReel ? 'Reel updated successfully' : 'Instagram reel added');
  };

  const handleDeleteReel = (id: string) => {
    const updated = reels.filter((r) => r.id !== id);
    saveReels(updated);
    showToast('Reel removed');
  };

  // --- Settings ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSubmitting(true);
    try {
      const newSettings: SiteSettings = {
        ...settings,
        whatsapp_number: settingsPhone.trim(),
        phone_number: settingsDirectPhone.trim(),
        instagram_handle: settingsIg.trim().replace('@', ''),
        instagram_url: settingsIgUrl.trim(),
        business_name: settingsBusinessName.trim(),
        location: settingsLocation.trim(),
        hero_title: settingsHeroTitle.trim(),
        hero_subtitle: settingsHeroSubtitle.trim(),
        hero_image_url: settingsHeroImage.trim()
      };
      await onUpdateSettings(newSettings);
      showToast('Settings & Hero content saved successfully');
    } catch (err: any) {
      showToast('Error saving settings');
    } finally {
      setSettingsSubmitting(false);
    }
  };

  const filteredPackages = packages.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl bg-gray-900 text-white shadow-xl text-xs font-semibold flex items-center gap-2 border border-gray-800 animate-in fade-in">
          <Check className="w-4 h-4 text-[var(--pink)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Website</span>
          </button>

          <div className="h-4 w-px bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-base text-gray-900">
              Admin Portal
            </span>
            <span className="px-2 py-0.5 rounded-full bg-pink-50 text-[var(--pink)] font-semibold text-[10px] border border-pink-200">
              Rachy's Treats
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-[var(--pink)] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings &amp; Inquiries ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'packages'
                ? 'bg-[var(--pink)] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Gift Packages ({packages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-[var(--pink)] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Service Cards ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'reels'
                ? 'bg-[var(--pink)] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Instagram Reels ({reels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[var(--pink)] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Business Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        
        {/* TAB 1: BOOKINGS & INQUIRIES (Plain Clean State for testing) */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif font-bold text-2xl text-gray-900">
                  Client Bookings &amp; Inquiries
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Real client inquiries submitted from the website form. Plain and ready for your self-testing.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {bookings.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all test bookings?')) saveBookings([]);
                    }}
                    className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={handleOpenAddBooking}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Test Booking</span>
                </button>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-lg text-gray-800 mb-1">
                  No bookings yet
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
                  The dashboard is completely clean with no artificial AI data. Test by submitting the booking form on the website or click the button below to add a test order.
                </p>
                <button
                  onClick={handleOpenAddBooking}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Test Booking</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3">Order ID</th>
                        <th className="px-5 py-3">Client &amp; Contact</th>
                        <th className="px-5 py-3">Recipient &amp; Occasion</th>
                        <th className="px-5 py-3">Date &amp; Location</th>
                        <th className="px-5 py-3">Package &amp; Budget</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map((booking) => {
                        const cleanPhone = (booking.client_phone || '').replace(/[^0-9]/g, '');
                        const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

                        return (
                          <tr key={booking.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-5 py-4 font-mono font-bold text-gray-800">
                              {booking.id}
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-semibold text-gray-900">{booking.client_name}</div>
                              <div className="text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span>{booking.client_phone}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-medium text-gray-900">For: {booking.recipient_name}</div>
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-pink-50 text-[var(--pink)] font-semibold text-[10px]">
                                {booking.occasion}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="text-gray-900 font-medium">{booking.delivery_date} at {booking.delivery_time}</div>
                              <div className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="truncate max-w-[140px]">{booking.location_area}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="text-gray-900 font-medium">{booking.package_title}</div>
                              <div className="text-[var(--pink)] font-bold mt-0.5">{booking.budget_estimate}</div>
                            </td>
                            <td className="px-5 py-4">
                              <select
                                value={booking.status}
                                onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as any)}
                                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] border focus:outline-none cursor-pointer ${
                                  booking.status === 'Confirmed'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : booking.status === 'Decorating'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : booking.status === 'Delivered'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                <option value="Inquiry">Inquiry</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Decorating">Decorating</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {waUrl && (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg text-[#15803d] hover:bg-green-50 transition-colors"
                                    title="WhatsApp Client"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GIFT PACKAGES */}
        {activeTab === 'packages' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif font-bold text-2xl text-gray-900">
                  Gift Catalogue &amp; Packages
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Manage items displayed in the public Gift Catalogue.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-lg bg-white border border-gray-200 text-xs focus:outline-none focus:border-[var(--pink)] w-48 sm:w-60 shadow-xs"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs focus:outline-none focus:border-[var(--pink)] shadow-xs cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleOpenAddPackage}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Package</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                    <img
                      src={pkg.image_url}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold">
                      {pkg.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-gray-900 line-clamp-1 mb-1">
                        {pkg.title}
                      </h4>
                      {pkg.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                          {pkg.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="font-bold text-sm text-[var(--pink)]">
                        {pkg.price}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditPackage(pkg)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[var(--pink)] hover:bg-pink-50 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(pkg.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: SERVICES SHOWCASE CARDS (HOME WHAT WE DO) */}
        {activeTab === 'services' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif font-bold text-2xl text-gray-900">
                  Service Showcase Cards
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Customize the high-impact visual service cards on the homepage (Surprises, Food tray, Money box, Hampers). Edit photos, starting prices, WhatsApp messages, badges, and catalog filter targets.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleResetServices}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                  title="Reset to default 4 signature cards"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddService}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service Card</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/5] bg-gray-900 overflow-hidden group">
                      <img
                        src={card.image_url}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                      
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--pink)] text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                          {card.badge}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-base font-bold leading-tight font-serif mb-0.5">
                          {card.title}
                        </div>
                        <div className="text-xs text-pink-300 font-semibold mb-1">
                          {card.price}
                        </div>
                        <p className="text-[11px] text-gray-200 line-clamp-2 leading-tight">
                          {card.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium">Catalogue Target:</span>
                        <span className="font-semibold text-[var(--pink)] bg-pink-50 px-2 py-0.5 rounded border border-pink-100">
                          {card.categoryKey}
                        </span>
                      </div>
                      <div className="truncate text-gray-500 text-[10px]" title={card.whatsappMessage}>
                        <span className="font-medium text-gray-400">WhatsApp msg:</span> {card.whatsappMessage}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white flex items-center justify-between border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-900">
                      {card.price}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditService(card)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[var(--pink)] hover:bg-pink-50 transition-colors cursor-pointer"
                        title="Edit Card"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setServiceDeleteConfirmId(card.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INSTAGRAM REELS */}
        {activeTab === 'reels' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif font-bold text-2xl text-gray-900">
                  Instagram Reels Showcase
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Manage featured Instagram celebration clips. Add video links, occasion tags, and custom cover images or let Instagram auto-fetch thumbnails!
                </p>
              </div>

              <button
                onClick={handleOpenAddReel}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Instagram Reel</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {reels.map((reel, idx) => {
                const cover = reel.thumbnail_url || FALLBACK_REEL_COVERS[idx % FALLBACK_REEL_COVERS.length];
                return (
                  <div
                    key={reel.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="relative aspect-[9/16] bg-black overflow-hidden group">
                      <img
                        src={cover}
                        alt={reel.title}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-semibold">
                        {reel.occasion}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <div className="text-[11px] font-bold line-clamp-2 leading-tight">
                          {reel.title}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white flex items-center justify-between border-t border-gray-100">
                      <span className="text-[10px] text-gray-500 truncate max-w-[70px]">
                        {reel.occasion}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditReel(reel)}
                          className="p-1 rounded text-gray-400 hover:text-[var(--pink)] hover:bg-pink-50 transition-colors cursor-pointer"
                          title="Edit Reel"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteReel(reel.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Reel"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: BUSINESS SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <h2 className="font-serif font-bold text-2xl text-gray-900">
                Business Settings
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Update the official contact channels connected to the website CTA buttons.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--pink)]" />
                  <span>Contact & Social Channels</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsBusinessName}
                      onChange={(e) => setSettingsBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--pink)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        WhatsApp Number (with Country Code)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2347014995254"
                        value={settingsPhone}
                        onChange={(e) => setSettingsPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--pink)]"
                      />
                      <span className="text-[11px] text-gray-400 block mt-1">
                        Used for customer chats and booking inquiries.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Direct Phone Call Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 07014995254"
                        value={settingsDirectPhone}
                        onChange={(e) => setSettingsDirectPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--pink)]"
                      />
                      <span className="text-[11px] text-gray-400 block mt-1">
                        Displayed for direct phone calls and footer inquiries.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. rachys_eats_treats"
                        value={settingsIg}
                        onChange={(e) => setSettingsIg(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--pink)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Full Instagram URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.instagram.com/rachys_eats_treats..."
                        value={settingsIgUrl}
                        onChange={(e) => setSettingsIgUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--pink)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Operational Location
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsLocation}
                      onChange={(e) => setSettingsLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--pink)]"
                    />
                  </div>
                </div>
              </div>

              {/* HERO SECTION VISUALS */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--pink)]" />
                  <span>Hero Banner Customization</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Hero Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Curate a Special Surprise."
                      value={settingsHeroTitle}
                      onChange={(e) => setSettingsHeroTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--pink)]"
                    />
                    <span className="text-[11px] text-gray-400 block mt-1">
                      Leave blank to use default "Curate a Special Surprise."
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Hero Subtitle Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="We double the joy of any occasion with unique and impressive surprises..."
                      value={settingsHeroSubtitle}
                      onChange={(e) => setSettingsHeroSubtitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[var(--pink)] resize-none"
                    />
                  </div>

                  <div>
                    <ImageUploadField
                      label="Hero Background Banner Image"
                      value={settingsHeroImage}
                      onChange={(url) => setSettingsHeroImage(url)}
                      placeholder="Paste image link or upload a high-resolution hero photo"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={settingsSubmitting}
                  className="w-full py-3 rounded-lg bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
                >
                  {settingsSubmitting ? 'Saving Settings...' : 'Save Settings & Hero Visuals'}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* MODAL: ADD / EDIT PACKAGE */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {editingPackage ? 'Edit Package' : 'Add New Package'}
              </h3>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs mb-3">
                {formError}
              </div>
            )}

            <form onSubmit={handleSavePackage} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Category
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Birthday Sets, Food Trays"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[var(--pink)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Package Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luxury Velvet Birthday Box"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[var(--pink)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Price in Naira (₦)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₦45,000 or Priced on request"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[var(--pink)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Image Upload or Direct URL
                </label>
                <ImageUploadField
                  value={formImage}
                  onChange={setFormImage}
                  label="Package Photo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Items included..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[var(--pink)] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-lg bg-[var(--pink)] text-white text-xs font-semibold shadow-xs"
                >
                  {formSubmitting ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TEST BOOKING */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                Add Test Booking
              </h3>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={bookingClientName}
                    onChange={(e) => setBookingClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08012345678"
                    value={bookingClientPhone}
                    onChange={(e) => setBookingClientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="Celebrant's name"
                    value={bookingRecipientName}
                    onChange={(e) => setBookingRecipientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Occasion</label>
                  <input
                    type="text"
                    placeholder="Birthday, Anniversary..."
                    value={bookingOccasion}
                    onChange={(e) => setBookingOccasion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Delivery Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Delivery Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:00 AM"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Lekki Phase 1, Lagos"
                  value={bookingLocation}
                  onChange={(e) => setBookingLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Package Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Luxury Box"
                    value={bookingPackageTitle}
                    onChange={(e) => setBookingPackageTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Budget / Price</label>
                  <input
                    type="text"
                    placeholder="e.g. ₦60,000"
                    value={bookingBudget}
                    onChange={(e) => setBookingBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[var(--pink)] font-semibold text-white shadow-xs"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT INSTAGRAM REEL */}
      {isReelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {editingReel ? 'Edit Instagram Reel' : 'Add Instagram Reel'}
              </h3>
              <button
                onClick={() => setIsReelModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReel} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Reel Title / Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Romantic Saxophonist Serenade in Ikoyi"
                  value={reelTitle}
                  onChange={(e) => setReelTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--pink)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Occasion Tag
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Birthday Setup, Proposal, Money Box"
                    value={reelOccasion}
                    onChange={(e) => setReelOccasion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--pink)]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Instagram Reel / Video Link
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://www.instagram.com/reel/..."
                    value={reelLink}
                    onChange={(e) => setReelLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--pink)]"
                  />
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="Reel Thumbnail / Cover Photo (Upload or Link)"
                  value={reelThumbnail}
                  onChange={(url) => setReelThumbnail(url)}
                  placeholder="Upload custom cover or leave blank to auto-fetch from Instagram"
                />
                <span className="text-[11px] text-gray-400 block mt-1">
                  💡 Tip: You can upload your own cover photo directly, paste an image link, or leave it blank to auto-fetch the Instagram thumbnail.
                </span>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Short Caption (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description or reaction..."
                  value={reelCaption}
                  onChange={(e) => setReelCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--pink)] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReelModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[var(--pink)] font-semibold text-white shadow-xs hover:bg-[var(--pink-hover)] cursor-pointer"
                >
                  {editingReel ? 'Update Reel' : 'Save Reel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SERVICE SHOWCASE CARD */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {editingService ? 'Edit Service Showcase Card' : 'Add Service Showcase Card'}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Card Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surprises, Food tray, Money box"
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--pink)]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Badge Pill Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SURPRISES, FOOD TRAY, VIP"
                    value={serviceBadge}
                    onChange={(e) => setServiceBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--pink)] uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Starting Price / Rate
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. From ₦25,000"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--pink)]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">
                    Catalogue Target Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surprises, Food tray..."
                    value={serviceCategoryKey}
                    onChange={(e) => setServiceCategoryKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--pink)]"
                  />
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Filter triggered when visitor clicks "Explore Packages"
                  </span>
                </div>
              </div>

              <div>
                <ImageUploadField
                  label="Card Background Image (Upload or Paste Link)"
                  value={serviceImage}
                  onChange={(url) => setServiceImage(url)}
                  placeholder="Upload high quality photo or paste image URL"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Tagline / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hotel bedroom setup, proposal, flash mob &amp; violin"
                  value={serviceTagline}
                  onChange={(e) => setServiceTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--pink)]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Pre-filled WhatsApp Message (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Hi Rachy, I would like to inquire about your Surprises from your website."
                  value={serviceWhatsappMsg}
                  onChange={(e) => setServiceWhatsappMsg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[var(--pink)] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[var(--pink)] font-semibold text-white shadow-xs hover:bg-[var(--pink-hover)] cursor-pointer"
                >
                  {editingService ? 'Update Card' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE SERVICE CARD */}
      {serviceDeleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 shadow-2xl text-center">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
            <h4 className="font-serif font-bold text-base text-gray-900 mb-1">
              Delete this service card?
            </h4>
            <p className="text-xs text-gray-500 mb-5">
              This card will be removed from the "What We Do" showcase on your homepage.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setServiceDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteService(serviceDeleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE PACKAGE */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 shadow-2xl text-center">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
            <h4 className="font-serif font-bold text-base text-gray-900 mb-1">
              Delete this package?
            </h4>
            <p className="text-xs text-gray-500 mb-5">
              This package will be permanently removed from the public catalogue.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePackage(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Delete Package
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
