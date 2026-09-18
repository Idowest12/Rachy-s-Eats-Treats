export interface Package {
  id: number;
  category: string;
  title: string;
  price: string;
  image_url: string;
  description?: string;
  sort_order: number;
  created_at?: string;
}

export interface SiteSettings {
  whatsapp_number: string;
  instagram_handle: string;
  instagram_url?: string;
  phone_number?: string;
  email?: string;
  business_name: string;
  location: string;
  delivery_areas?: string[];
  hero_title?: string;
  hero_subtitle?: string;
  hero_badge?: string;
  hero_image_url?: string;
}

export interface ServiceCategoryCard {
  id: string;
  categoryKey: string;
  badge: string;
  title: string;
  price: string;
  tagline: string;
  image_url: string;
  whatsappMessage: string;
}

export interface ReelItem {
  id: string;
  title: string;
  occasion: string;
  video_url?: string;
  thumbnail_url?: string;
  instagram_url?: string;
  caption?: string;
  duration?: string;
}

export interface BookingOrder {
  id: string;
  client_name: string;
  client_phone: string;
  recipient_name: string;
  occasion: string;
  package_title: string;
  delivery_date: string;
  delivery_time: string;
  location_area: string;
  delivery_address: string;
  add_ons: string[];
  budget_estimate: string;
  status: 'Inquiry' | 'Confirmed' | 'Decorating' | 'Delivered';
  created_at: string;
  notes?: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image_url: string;
  starting_price: string;
  features: string[];
}

export interface AdminAuthResponse {
  authenticated: boolean;
  message?: string;
}

export interface LocationStat {
  location: string;
  country: string;
  city: string;
  count: number;
  percentage: number;
}

export interface DeviceStat {
  device: string;
  count: number;
  percentage: number;
}

export interface VisitEvent {
  id: string;
  timestamp: string;
  location: string;
  country: string;
  city: string;
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  page: string;
}

export interface OutreachEvent {
  id: string;
  timestamp: string;
  channel: 'whatsapp' | 'instagram' | 'phone';
  package_title?: string;
  package_id?: number;
  location: string;
  country: string;
  city: string;
  device: 'mobile' | 'desktop' | 'tablet';
}

export interface AnalyticsSummary {
  totalVisits: number;
  visitsToday: number;
  visits7d: number;
  totalOutreach: number;
  outreachToday: number;
  outreach7d: number;
  conversionRate: string;
  locations: LocationStat[];
  devices: DeviceStat[];
  recentVisits: VisitEvent[];
  recentOutreach: OutreachEvent[];
}

export interface StorageStatus {
  provider: 'cloudinary' | 'local';
  cloudinaryConfigured: boolean;
  cloudName?: string | null;
  message: string;
}

