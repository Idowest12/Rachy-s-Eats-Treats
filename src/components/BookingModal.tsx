import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, MapPin, Sparkles, MessageCircle, Heart, User, Check } from 'lucide-react';
import { SiteSettings, BookingOrder } from '../types.ts';
import { trackOutreach } from '../utils/analytics.ts';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  preselectedService?: string;
  onBookingSubmitted?: (booking: BookingOrder) => void;
}

const LAGOS_AREAS = [
  'Lekki Phase 1 / Oniru',
  'Victoria Island (VI)',
  'Ikoyi / Banana Island',
  'Ikeja GRA / Maryland',
  'Surulere / Yaba',
  'Ajah / Sangotedo',
  'Magodo / Gbagada',
  'Festac / Amuwo',
  'Other Lagos Location'
];

const OCCASIONS = [
  'Birthday Surprise',
  'Proposal & Engagement',
  'Anniversary',
  'Gourmet Breakfast in Bed',
  'Romantic Hotel Bedroom Decor',
  'Money Box Surprise',
  'Apology / Reconnection',
  'Just Because'
];

const POPULAR_ADDONS = [
  { id: 'sax', label: 'Live Saxophonist Serenade 🎷', price: '+₦35,000' },
  { id: 'cake', label: 'Custom 4-inch Bento Cake 🎂', price: '+₦15,000' },
  { id: 'bubble', label: 'Personalized Bubble Balloon 🎈', price: '+₦12,000' },
  { id: 'photos', label: 'Printed Polaroid Memory Strip 📸', price: '+₦5,000' },
  { id: 'sparklers', label: 'Celebration Handheld Sparklers ✨', price: '+₦4,000' }
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  settings,
  preselectedService,
  onBookingSubmitted
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [occasion, setOccasion] = useState(preselectedService || 'Birthday Surprise');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('Morning (8:00 AM - 11:00 AM)');
  const [locationArea, setLocationArea] = useState(LAGOS_AREAS[0]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [budgetEstimate, setBudgetEstimate] = useState('₦45,000 - ₦80,000');

  if (!isOpen) return null;

  const toggleAddon = (addonLabel: string) => {
    if (selectedAddons.includes(addonLabel)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== addonLabel));
    } else {
      setSelectedAddons([...selectedAddons, addonLabel]);
    }
  };

  const handleSendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = (settings?.whatsapp_number || '2347014995254').replace(/[^0-9]/g, '');

    const bookingData: BookingOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      client_name: clientName || 'Anonymous Client',
      client_phone: clientPhone || 'Via WhatsApp',
      recipient_name: recipientName || 'Celebrant',
      occasion,
      package_title: occasion,
      delivery_date: deliveryDate || 'Soonest',
      delivery_time: deliveryTime,
      location_area: locationArea,
      delivery_address: deliveryAddress || locationArea,
      add_ons: selectedAddons,
      budget_estimate: budgetEstimate,
      status: 'Inquiry',
      created_at: new Date().toISOString(),
      notes: specialNotes
    };

    if (onBookingSubmitted) {
      onBookingSubmitted(bookingData);
    }

    // Compose formatted WhatsApp message
    const messageLines = [
      `🎉 *NEW SURPRISE INQUIRY - RACHY'S EATS & TREATS*`,
      `-----------------------------------------`,
      `👤 *Client Name:* ${clientName || 'N/A'}`,
      `📞 *Client Phone:* ${clientPhone || 'N/A'}`,
      `💝 *Celebrant / Recipient:* ${recipientName || 'N/A'}`,
      `✨ *Occasion:* ${occasion}`,
      `📅 *Date:* ${deliveryDate || 'Flexible'}`,
      `⏰ *Preferred Time:* ${deliveryTime}`,
      `📍 *Location in Lagos:* ${locationArea}`,
      deliveryAddress ? `🏠 *Address:* ${deliveryAddress}` : null,
      selectedAddons.length > 0 ? `🎷 *Requested Add-ons:* ${selectedAddons.join(', ')}` : null,
      `💰 *Budget Range:* ${budgetEstimate}`,
      specialNotes ? `📝 *Special Notes:* ${specialNotes}` : null,
      `-----------------------------------------`,
      `_Sent from Rachy's Website Booking System_`
    ].filter(Boolean);

    const fullMessage = messageLines.join('\n');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`;

    trackOutreach('whatsapp', `Booked Surprise: ${occasion} for ${recipientName}`);
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white dark:bg-[#17140f] rounded-3xl shadow-2xl max-w-xl w-full border border-line overflow-hidden my-6 text-[var(--cream)]"
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-line bg-[var(--background)] flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--pink-light)] text-[var(--pink)] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step-by-Step Curation</span>
            </div>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--cream)] leading-tight">
              Curate a Special Surprise
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              Tell us your vision. We will coordinate every detail and dispatch with total secrecy!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[var(--muted)] hover:text-[var(--cream)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSendToWhatsApp} className="p-6 sm:p-7 space-y-5 max-h-[72vh] overflow-y-auto">
          
          {/* Occasion Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
              1. What Are We Celebrating?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {OCCASIONS.map((occ) => (
                <button
                  type="button"
                  key={occ}
                  onClick={() => setOccasion(occ)}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left transition-all border cursor-pointer ${
                    occasion === occ
                      ? 'bg-[var(--pink)] text-white border-[var(--pink)] font-semibold shadow-sm'
                      : 'bg-[var(--surface-2)] text-[var(--cream)] border-line hover:border-[var(--pink)]/40'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sandra Adeleke"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-line text-sm text-[var(--cream)] focus:outline-none focus:border-[var(--pink)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Recipient / Celebrant's Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tunde (Husband / Friend)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-line text-sm text-[var(--cream)] focus:outline-none focus:border-[var(--pink)]"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Your WhatsApp / Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +234 801 234 5678"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-line text-sm text-[var(--cream)] focus:outline-none focus:border-[var(--pink)]"
            />
          </div>

          {/* Date, Time & Lagos Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Surprise Date
              </label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-line text-xs sm:text-sm text-[var(--cream)] focus:outline-none focus:border-[var(--pink)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Preferred Time
              </label>
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-line text-xs sm:text-sm text-[var(--cream)] focus:outline-none focus:border-[var(--pink)]"
              >
                <option>Early Dawn (6:30 AM - 8:30 AM)</option>
                <option>Morning (8:30 AM - 11:30 AM)</option>
                <option>Afternoon (12:00 PM - 3:30 PM)</option>
                <option>Evening Sunset (4:00 PM - 7:00 PM)</option>
                <option>Night Surprise (7:30 PM - 10:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Lagos Location
              </label>
              <select
                value={locationArea}
                onChange={(e) => setLocationArea(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-line text-xs sm:text-sm text-[var(--cream)] focus:outline-none focus:border-[var(--pink)]"
              >
                {LAGOS_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Street Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Specific Address / Hotel (Optional for now)
            </label>
            <input
              type="text"
              placeholder="e.g. Admiralty Way, Lekki Phase 1 or Radisson Blu VI"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-line text-sm text-[var(--cream)] focus:outline-none focus:border-[var(--pink)]"
            />
          </div>

          {/* Add-ons Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
              Select Luxury Add-ons (Optional)
            </label>
            <div className="space-y-2">
              {POPULAR_ADDONS.map((addon) => {
                const isSelected = selectedAddons.includes(addon.label);
                return (
                  <button
                    type="button"
                    key={addon.id}
                    onClick={() => toggleAddon(addon.label)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--pink-light)] border-[var(--pink)] text-[var(--pink)] font-semibold'
                        : 'bg-[var(--surface-2)] border-line text-[var(--cream)] hover:border-[var(--pink)]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected ? 'bg-[var(--pink)] border-[var(--pink)] text-white' : 'border-neutral-400'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{addon.label}</span>
                    </div>
                    <span className="font-bold">{addon.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Your Target Budget
            </label>
            <select
              value={budgetEstimate}
              onChange={(e) => setBudgetEstimate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-line text-sm text-[var(--cream)] focus:outline-none focus:border-[var(--pink)]"
            >
              <option>₦25,000 - ₦40,000 (Mini Treats &amp; Box)</option>
              <option>₦45,000 - ₦80,000 (Executive Trays &amp; Velvet Box)</option>
              <option>₦85,000 - ₦150,000 (Grand Setups + Saxophonist)</option>
              <option>₦150,000+ (Full Suite Proposal &amp; Money Towers)</option>
              <option>Bespoke / Open to recommendations</option>
            </select>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Special Instructions / Secret Delivery Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Please do not call recipient before 10 AM, surprise will be at her office reception..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-line text-sm text-[var(--cream)] focus:outline-none focus:border-[var(--pink)] resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white/20" />
              <span>Continue to WhatsApp Booking →</span>
            </button>
            <p className="text-center text-[11px] text-[var(--muted)] mt-2">
              Instant response from Rachy • No advance payment taken on website
            </p>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
