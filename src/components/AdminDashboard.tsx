import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  LogOut,
  ArrowLeft,
  Search,
  Check,
  AlertCircle,
  Phone,
  Instagram,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  Eye,
  Sliders,
  BarChart3,
  Radio,
  Package as PackageIcon,
  Upload
} from 'lucide-react';
import { Package, SiteSettings } from '../types.ts';
import { RachyLogo } from './RachyLogo.tsx';
import { AdminAnalytics } from './AdminAnalytics.tsx';
import { ImageUploadField } from './ImageUploadField.tsx';

interface AdminDashboardProps {
  packages: Package[];
  settings: SiteSettings;
  onRefreshPackages: () => Promise<void>;
  onUpdateSettings: (newSettings: SiteSettings) => Promise<void>;
  onLogout: () => void;
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  packages,
  settings,
  onRefreshPackages,
  onUpdateSettings,
  onLogout,
  onBackToSite
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'packages' | 'analytics'>('packages');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Form states for package
  const [formCategory, setFormCategory] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings form states
  const [settingsPhone, setSettingsPhone] = useState(settings.whatsapp_number);
  const [settingsIg, setSettingsIg] = useState(settings.instagram_handle);
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);

  const categories = Array.from(new Set(packages.map((p) => p.category).filter(Boolean)));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getAuthHeader = () => {
    const token = sessionStorage.getItem('rachy_admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingPackage(null);
    setFormCategory(categories[0] || 'Birthday Sets');
    setFormTitle('');
    setFormPrice('₦');
    setFormImageUrl('');
    setFormDescription('');
    setFormSortOrder(packages.length + 1);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormCategory(pkg.category);
    setFormTitle(pkg.title);
    setFormPrice(pkg.price);
    setFormImageUrl(pkg.image_url);
    setFormDescription(pkg.description || '');
    setFormSortOrder(pkg.sort_order ?? 1);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save package (Create or Update)
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const fallbackImg = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop';
      const payload = {
        category: formCategory.trim(),
        title: formTitle.trim(),
        price: formPrice.trim(),
        image_url: formImageUrl.trim() || fallbackImg,
        description: formDescription.trim(),
        sort_order: Number(formSortOrder) || 1
      };

      const url = editingPackage ? `/api/packages/${editingPackage.id}` : '/api/packages';
      const method = editingPackage ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save package');
      }

      await onRefreshPackages();
      setIsModalOpen(false);
      showToast(editingPackage ? 'Package updated successfully' : 'New package added to catalogue');
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete package
  const handleDeletePackage = async (id: number) => {
    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader()
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      await onRefreshPackages();
      setDeleteConfirmId(null);
      showToast('Package removed from catalogue');
    } catch (err: any) {
      alert(err.message || 'Failed to delete package');
    }
  };

  // Reset to starter packages
  const handleResetStarter = async () => {
    if (!window.confirm('Reset all packages back to the original starter catalog? Any custom packages will be overwritten.')) {
      return;
    }
    try {
      const res = await fetch('/api/packages/reset', {
        method: 'POST',
        headers: {
          ...getAuthHeader()
        }
      });
      if (!res.ok) throw new Error('Failed to reset');
      await onRefreshPackages();
      showToast('Catalog restored to default starter packages');
    } catch (err: any) {
      alert(err.message || 'Error resetting catalogue');
    }
  };

  // Save Contact & Social settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSubmitting(true);
    try {
      await onUpdateSettings({
        ...settings,
        whatsapp_number: settingsPhone,
        instagram_handle: settingsIg
      });
      setIsSettingsOpen(false);
      showToast('Contact and WhatsApp settings updated');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSettingsSubmitting(false);
    }
  };

  // Filter packages
  const filteredPackages = packages.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div id="admin-dashboard-page" className="min-h-screen bg-[#0e0c0b] text-[#f5ece2]">
      {/* Toast alert */}
      {toastMessage && (
        <div
          id="admin-toast-alert"
          className="fixed bottom-6 right-6 z-50 bg-[#e2417e] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-bounce"
        >
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#17140f] border-b border-[rgba(245,236,226,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              id="admin-back-to-site-btn"
              onClick={onBackToSite}
              className="p-2 rounded-lg bg-[#0e0c0b] hover:bg-[#1f1a15] text-[#b8a89d] hover:text-[#f5ece2] transition-colors flex items-center gap-1.5 text-xs cursor-pointer border border-[rgba(245,236,226,0.1)]"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">View Public Site</span>
            </button>

            <div className="flex items-center gap-2.5">
              <RachyLogo variant="icon" className="w-8 h-8 rounded-lg" />
              <span className="font-serif italic font-bold text-xl text-[#e2417e]">
                Rachy's
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1f1a15] border border-[rgba(245,236,226,0.1)] text-[#b8a89d]">
                Admin Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-settings-btn"
              onClick={() => {
                setSettingsPhone(settings.whatsapp_number);
                setSettingsIg(settings.instagram_handle);
                setIsSettingsOpen(true);
              }}
              className="p-2 rounded-lg bg-[#1f1a15] hover:bg-[#0e0c0b] text-[#f5ece2] text-xs flex items-center gap-1.5 border border-[rgba(245,236,226,0.15)] transition-colors cursor-pointer"
              title="Edit WhatsApp & Social handles"
            >
              <Sliders className="w-4 h-4 text-[#e2417e]" />
              <span className="hidden md:inline">Contact Settings</span>
            </button>

            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="p-2 rounded-lg bg-[#0e0c0b] hover:bg-red-950/40 text-[#b8a89d] hover:text-red-300 text-xs flex items-center gap-1.5 border border-[rgba(245,236,226,0.1)] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs (Packages vs Real-time Analytics) */}
        <div className="flex items-center gap-2 mb-8 p-1.5 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.1)] w-fit">
          <button
            id="tab-btn-packages"
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'packages'
                ? 'bg-[#e2417e] text-white shadow-sm'
                : 'text-[#b8a89d] hover:text-[#f5ece2] hover:bg-[#1f1a15]'
            }`}
          >
            <PackageIcon className="w-4 h-4" />
            <span>Packages Catalogue</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === 'packages' ? 'bg-white/20 text-white' : 'bg-[#1f1a15] text-[#b8a89d]'
              }`}
            >
              {packages.length}
            </span>
          </button>

          <button
            id="tab-btn-analytics"
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#e2417e] text-white shadow-sm'
                : 'text-[#b8a89d] hover:text-[#f5ece2] hover:bg-[#1f1a15]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Live Traffic &amp; Outreach</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <AdminAnalytics getAuthHeader={getAuthHeader} onShowToast={showToast} />
        ) : (
          <>
            {/* Metric Cards & Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.1)]">
            <p className="text-xs uppercase tracking-wider text-[#b8a89d] font-semibold">
              Total Packages
            </p>
            <p className="font-serif text-3xl font-bold text-[#f5ece2] mt-1">
              {packages.length}
            </p>
            <p className="text-[11px] text-[#b8a89d] mt-1">Active items visible on public site</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.1)]">
            <p className="text-xs uppercase tracking-wider text-[#b8a89d] font-semibold">
              Categories
            </p>
            <p className="font-serif text-3xl font-bold text-[#e2417e] mt-1">
              {categories.length}
            </p>
            <p className="text-[11px] text-[#b8a89d] mt-1">Dynamic navigation pills</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.1)] flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#b8a89d] font-semibold">
                WhatsApp Orders
              </p>
              <p className="text-xs text-[#f5ece2] mt-1 truncate font-mono">
                +{settings.whatsapp_number}
              </p>
            </div>
            <button
              id="admin-add-package-btn-header"
              onClick={handleOpenAdd}
              className="mt-3 w-full py-2.5 rounded-xl bg-[#e2417e] hover:bg-[#c92e6c] text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#e2417e]/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Package</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#17140f] border border-[rgba(245,236,226,0.1)] rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8a89d]" />
            <input
              id="admin-search-input"
              type="text"
              placeholder="Search package title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.12)] text-xs text-[#f5ece2] placeholder-[#b8a89d]/50 focus:outline-none focus:border-[#e2417e]"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs text-[#b8a89d] whitespace-nowrap hidden lg:inline">Filter:</span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-[#e2417e] text-white'
                  : 'bg-[#1f1a15] text-[#b8a89d] hover:text-[#f5ece2]'
              }`}
            >
              All ({packages.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#e2417e] text-white'
                    : 'bg-[#1f1a15] text-[#b8a89d] hover:text-[#f5ece2]'
                }`}
              >
                {cat} ({packages.filter((p) => p.category === cat).length})
              </button>
            ))}
          </div>

          {/* Quick reset starter */}
          <button
            onClick={handleResetStarter}
            className="text-[11px] text-[#b8a89d] hover:text-[#e2417e] flex items-center gap-1 shrink-0 p-1.5 cursor-pointer"
            title="Reset to default catalogue"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden xl:inline">Reset Defaults</span>
          </button>
        </div>

        {/* Packages Table & List */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-16 bg-[#17140f] rounded-2xl border border-[rgba(245,236,226,0.08)]">
            <p className="text-base text-[#f5ece2] font-serif mb-1">No packages found</p>
            <p className="text-xs text-[#b8a89d] mb-4">
              Try a different filter or search term, or create a brand new package.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-[#e2417e] text-white text-xs font-semibold cursor-pointer"
            >
              Create Package
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const testMsg = `Hi Rachy, I would like to order the "${pkg.title}" (${pkg.price})`;
              const waUrl = `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(testMsg)}`;

              return (
                <div
                  key={pkg.id}
                  id={`admin-card-${pkg.id}`}
                  className="rounded-2xl bg-[#17140f] border border-[rgba(245,236,226,0.12)] overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative aspect-16/9 bg-[#1f1a15] overflow-hidden">
                      <img
                        src={pkg.image_url}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#0e0c0b]/80 backdrop-blur-md text-[#f5ece2] border border-[rgba(245,236,226,0.1)]">
                        {pkg.category}
                      </span>
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-xs font-bold bg-[#0e0c0b]/90 text-[#e2417e] font-serif border border-[#e2417e]/30">
                        {pkg.price}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="font-serif font-bold text-base text-[#f5ece2] leading-snug mb-1">
                        {pkg.title}
                      </h4>
                      <p className="text-xs text-[#b8a89d] line-clamp-2 leading-relaxed">
                        {pkg.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="px-4 py-3 bg-[#1f1a15]/60 border-t border-[rgba(245,236,226,0.08)] flex items-center justify-between gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#e2417e] hover:underline flex items-center gap-1"
                      title="Test WhatsApp Order Link"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Test WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="p-2 rounded-lg bg-[#17140f] hover:bg-[#0e0c0b] text-[#f5ece2] border border-[rgba(245,236,226,0.1)] transition-colors cursor-pointer"
                        title="Edit Package"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(pkg.id)}
                        className="p-2 rounded-lg bg-[#17140f] hover:bg-red-950/50 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                        title="Delete Package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </main>

      {/* Add / Edit Package Modal */}
      {isModalOpen && (
        <div
          id="admin-package-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg bg-[#17140f] border border-[rgba(245,236,226,0.15)] rounded-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <h3 className="font-serif font-bold text-xl text-[#f5ece2] mb-1">
              {editingPackage ? 'Edit Package' : 'Add New Package'}
            </h3>
            <p className="text-xs text-[#b8a89d] mb-5">
              Packages are instantly published to your public website catalogue.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePackage} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8a89d] mb-1">
                  Category
                </label>
                <div className="flex gap-2 mb-1.5 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border cursor-pointer ${
                        formCategory === cat
                          ? 'bg-[#e2417e] border-[#e2417e] text-white'
                          : 'bg-[#1f1a15] border-[rgba(245,236,226,0.1)] text-[#b8a89d]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type a custom category (e.g. Bridal & Anniversaries)..."
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.15)] text-sm text-[#f5ece2] focus:outline-none focus:border-[#e2417e]"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8a89d] mb-1">
                  Package Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deluxe Velvet Birthday Box"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.15)] text-sm text-[#f5ece2] focus:outline-none focus:border-[#e2417e]"
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8a89d] mb-1">
                    Price (Text)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₦45,000 or Priced on request"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.15)] text-sm text-[#f5ece2] focus:outline-none focus:border-[#e2417e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8a89d] mb-1">
                    Sort Order (Rank)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.15)] text-sm text-[#f5ece2] focus:outline-none focus:border-[#e2417e]"
                  />
                </div>
              </div>

              {/* Image Upload & Management */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8a89d] mb-1.5">
                  Package Picture
                </label>
                <ImageUploadField
                  value={formImageUrl}
                  onChange={(url) => setFormImageUrl(url)}
                  getAuthHeader={getAuthHeader}
                  onError={(err) => setFormError(err)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8a89d] mb-1">
                  Description &amp; Inclusions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe chocolates, customized ribbons, balloon styles, food items, etc."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.15)] text-sm text-[#f5ece2] focus:outline-none focus:border-[#e2417e]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(245,236,226,0.08)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1f1a15] hover:bg-[#0e0c0b] text-xs text-[#b8a89d] hover:text-[#f5ece2] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#e2417e] hover:bg-[#c92e6c] text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingPackage ? 'Update Package' : 'Publish Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#17140f] border border-red-500/30 rounded-2xl p-6 shadow-2xl">
            <h4 className="font-serif font-bold text-lg text-[#f5ece2] mb-2">
              Delete this package?
            </h4>
            <p className="text-xs text-[#b8a89d] mb-5">
              This action cannot be undone. It will remove the package from Rachy's public catalogue immediately.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#1f1a15] text-xs text-[#b8a89d] hover:text-[#f5ece2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePackage(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact & Social Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#17140f] border border-[rgba(245,236,226,0.15)] rounded-2xl p-6 shadow-2xl">
            <h3 className="font-serif font-bold text-xl text-[#f5ece2] mb-1">
              Contact &amp; Social Settings
            </h3>
            <p className="text-xs text-[#b8a89d] mb-5">
              Configure Rachy's phone number where customer "Order now" WhatsApp messages are routed.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8a89d] mb-1">
                  WhatsApp Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e2417e]" />
                  <input
                    type="text"
                    placeholder="e.g. 2348123456789"
                    value={settingsPhone}
                    onChange={(e) => setSettingsPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.15)] text-sm text-[#f5ece2] focus:outline-none focus:border-[#e2417e]"
                  />
                </div>
                <p className="text-[10px] text-[#b8a89d] mt-1">
                  Format with country code (e.g. 234 for Nigeria) without the + or leading 0.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8a89d] mb-1">
                  Instagram Handle
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e2417e]" />
                  <input
                    type="text"
                    placeholder="rachys_eats_and_treats"
                    value={settingsIg}
                    onChange={(e) => setSettingsIg(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1f1a15] border border-[rgba(245,236,226,0.15)] text-sm text-[#f5ece2] focus:outline-none focus:border-[#e2417e]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(245,236,226,0.08)]">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1f1a15] text-xs text-[#b8a89d] hover:text-[#f5ece2]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={settingsSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#e2417e] hover:bg-[#c92e6c] text-white text-xs font-semibold cursor-pointer"
                >
                  {settingsSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
