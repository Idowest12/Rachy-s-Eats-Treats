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
  business_name: string;
  location: string;
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

