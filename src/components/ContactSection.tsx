import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { SiteSettings } from '../types.ts';
import { trackOutreach } from '../utils/analytics.ts';

interface ContactSectionProps {
  settings?: SiteSettings;
  selectedService?: string;
  onBookingSubmitted?: (leadData: any) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  settings,
  selectedService,
  onBookingSubmitted
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [typeOfSurprise, setTypeOfSurprise] = useState('Birthday Surprises & Decor');
  const [dayOfEvent, setDayOfEvent] = useState('');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (selectedService) {
      setTypeOfSurprise(selectedService);
    }
  }, [selectedService]);

  const cleanPhone = (settings?.whatsapp_number || '2347014995254').replace(/[^0-9]/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    trackOutreach('whatsapp', `Contact Form: ${typeOfSurprise}`);

    const newLead = {
      id: `INQ-${Date.now().toString().slice(-4)}`,
      name,
      phone,
      email,
      package_title: typeOfSurprise,
      occasion: typeOfSurprise,
      celebrant_name: name,
      delivery_date: dayOfEvent || 'Pending',
      delivery_address: `${locationAddress}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}`,
      notes: additionalDetails,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (onBookingSubmitted) {
      onBookingSubmitted(newLead);
    }

    // Save lead to backend
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead)
    }).catch(() => {});

    // Format WhatsApp message
    const message = `*NEW SURPRISE INQUIRY - RACHY'S EATS & TREATS* 🎉\n\n` +
      `👤 *Client Name:* ${name}\n` +
      `📞 *Phone:* ${phone}\n` +
      `✉️ *Email:* ${email || 'Not provided'}\n` +
      `🎁 *Type of Surprise:* ${typeOfSurprise}\n` +
      `📅 *Day of Event:* ${dayOfEvent || 'Flexible'}\n` +
      `📍 *Location / Address:* ${locationAddress || 'To be confirmed'}, ${city ? `${city}, ` : ''}${state}\n` +
      (additionalDetails ? `📝 *Additional Details:* ${additionalDetails}\n` : '') +
      `\n_Sent via rachyeatstreats.com_`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setSubmitted(false);
    }, 600);
  };

  return (
    <section id="contact-section" className="py-16 sm:py-24 bg-white text-gray-900 border-t border-gray-200 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Send Us a Message (Exact layout from Image 2) */}
          <div className="lg:col-span-7">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-gray-900 mb-8">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-pink-50 border border-pink-200 text-center">
                <div className="w-14 h-14 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-xl text-gray-900 mb-1">
                  Connecting to WhatsApp...
                </h3>
                <p className="text-sm text-gray-600">
                  Redirecting your message straight to Rachy for immediate scheduling!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Row 1: Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Row 2: Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent transition-all shadow-sm"
                  />
                </div>

                {/* Row 3: Type of Surprise & Day of Event */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Type of Surprise
                    </label>
                    <select
                      value={typeOfSurprise}
                      onChange={(e) => setTypeOfSurprise(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent transition-all shadow-sm cursor-pointer"
                    >
                      <option value="Birthday Surprises & Decor">Birthday Surprises &amp; Decor</option>
                      <option value="Engagement & Proposal Setups">Engagement &amp; Proposal Setups</option>
                      <option value="Gourmet Brunch & Food Trays">Gourmet Brunch &amp; Food Trays</option>
                      <option value="Money Box & Cash Bouquets">Money Box &amp; Cash Bouquets</option>
                      <option value="Luxury Keepsake Gift Hampers">Luxury Keepsake Gift Hampers</option>
                      <option value="Romantic Bedroom / Hotel Decor">Romantic Bedroom / Hotel Decor</option>
                      <option value="Saxophonist & Serenade Surprise">Saxophonist &amp; Serenade Surprise</option>
                      <option value="Other Custom Surprise">Other Custom Surprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Day of Event
                    </label>
                    <input
                      type="date"
                      required
                      placeholder="mm/dd/yyyy"
                      value={dayOfEvent}
                      onChange={(e) => setDayOfEvent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Row 4: State & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent transition-all shadow-sm cursor-pointer"
                    >
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja FCT">Abuja FCT</option>
                      <option value="Rivers">Rivers (Port Harcourt)</option>
                      <option value="Ogun">Ogun</option>
                      <option value="Oyo">Oyo (Ibadan)</option>
                      <option value="Akwa Ibom">Akwa Ibom</option>
                      <option value="Other">Other State</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lekki, Ikeja, Victoria Island"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Row 5: Recipient's Location / Surprise Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Recipient's Location / Surprise Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full address for the surprise delivery"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent transition-all shadow-sm"
                  />
                </div>

                {/* Row 6: Additional Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Additional Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Budget, special requests, any other details..."
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent transition-all shadow-sm resize-none"
                  />
                </div>

                {/* Submit button with Rachy's brand pink and curved edges */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Us a Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Contact Info with Rachy's brand pink icons and curved cards */}
          <div className="lg:col-span-5">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-gray-900 mb-8">
              Contact Info
            </h2>

            <div className="space-y-4">
              
              {/* Phone Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-4 transition-all hover:bg-pink-50/40">
                <div className="w-12 h-12 rounded-2xl bg-[var(--pink)] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Phone
                  </h4>
                  <p className="text-sm text-gray-700 font-medium">
                    +234 701 499 5254
                  </p>
                  <p className="text-xs text-gray-500">
                    +234 810 317 3566
                  </p>
                </div>
              </div>

              {/* Email Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-4 transition-all hover:bg-pink-50/40">
                <div className="w-12 h-12 rounded-2xl bg-[var(--pink)] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Email
                  </h4>
                  <p className="text-sm text-gray-700 font-medium break-all">
                    rachyeatstreats@gmail.com
                  </p>
                </div>
              </div>

              {/* Lagos Office Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-4 transition-all hover:bg-pink-50/40">
                <div className="w-12 h-12 rounded-2xl bg-[var(--pink)] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Lagos
                  </h4>
                  <p className="text-sm text-gray-700 font-medium">
                    Lagos, Nigeria
                  </p>
                  <p className="text-xs text-gray-500">
                    Island &amp; Mainland Doorstep Delivery
                  </p>
                </div>
              </div>

              {/* Working Hours Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-4 transition-all hover:bg-pink-50/40">
                <div className="w-12 h-12 rounded-2xl bg-[var(--pink)] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Working Hours
                  </h4>
                  <p className="text-sm text-gray-700 font-medium">
                    Mon - Sat: 9am - 6pm
                  </p>
                  <p className="text-xs text-gray-500">
                    Sundays on advance booking
                  </p>
                </div>
              </div>

            </div>

            {/* Direct WhatsApp Quick Chat Banner with soft pink theme */}
            <div className="mt-8 p-6 rounded-3xl bg-pink-50/80 border border-pink-200">
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="w-5 h-5 text-[var(--pink)]" />
                <h4 className="text-sm font-bold text-gray-900">
                  Instant WhatsApp Consultation
                </h4>
              </div>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Need urgent same-day delivery or custom saxophone serenades? Chat directly with Rachy.
              </p>
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hi Rachy! I would like to quickly discuss a surprise package.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Directly on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

