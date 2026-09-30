import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import { createServer as createViteServer } from 'vite';
import { STARTER_PACKAGES } from './src/data/starterPackages.ts';
import { STARTER_SERVICES } from './src/data/starterServices.ts';
import { STARTER_REELS } from './src/data/starterReels.ts';
import { Package, SiteSettings, ServiceCategoryCard, ReelItem, BookingOrder } from './src/types.ts';
import { getSupabase } from './src/lib/supabase.ts';

const app = express();
const PORT = 3000;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rachytreats2024';
const SESSION_SECRET = process.env.SESSION_SECRET || 'rachy_eats_and_treats_lagos_secret_2024';

// Cloudinary lazy initialization
function isCloudinaryConfigured(): boolean {
  if (process.env.CLOUDINARY_URL) return true;
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function getCloudinary() {
  if (!isCloudinaryConfigured()) return null;
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }
  return cloudinary;
}

// Persistence paths
const DATA_DIR = path.join(process.cwd(), 'data');
const PACKAGES_FILE = path.join(DATA_DIR, 'packages.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');
const REELS_FILE = path.join(DATA_DIR, 'reels.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded package photos
app.use('/uploads', express.static(UPLOADS_DIR));

// Analytics models & storage
interface StoredVisit {
  id: string;
  timestamp: string;
  location: string;
  country: string;
  city: string;
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  page: string;
}

interface StoredOutreach {
  id: string;
  timestamp: string;
  channel: 'whatsapp' | 'instagram' | 'phone';
  package_title: string;
  package_id?: number;
  location: string;
  country: string;
  city: string;
  device: 'mobile' | 'desktop' | 'tablet';
}

interface AnalyticsStore {
  visits: StoredVisit[];
  outreach: StoredOutreach[];
}

function loadAnalytics(): AnalyticsStore {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        visits: Array.isArray(parsed.visits) ? parsed.visits : [],
        outreach: Array.isArray(parsed.outreach) ? parsed.outreach : []
      };
    }
  } catch (err) {
    console.error('Error loading analytics:', err);
  }
  return { visits: [], outreach: [] };
}

function saveAnalytics(data: AnalyticsStore): void {
  try {
    const trimmed: AnalyticsStore = {
      visits: data.visits.slice(-5000),
      outreach: data.outreach.slice(-2000)
    };
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving analytics:', err);
  }
}

// Location resolution based on client info and headers
function resolveLocation(req: express.Request, clientData?: { timezone?: string; country?: string; city?: string }): { country: string; city: string; location: string } {
  if (clientData?.country && clientData?.city) {
    return {
      country: clientData.country,
      city: clientData.city,
      location: `${clientData.city}, ${clientData.country}`
    };
  }

  const tz = (clientData?.timezone || '').toLowerCase();

  // High precision Nigerian & African timezone mapping
  if (tz.includes('lagos') || tz.includes('nigeria')) {
    return { country: 'Nigeria', city: 'Lagos', location: 'Lagos, Nigeria' };
  }
  if (tz.includes('accra') || tz.includes('ghana')) {
    return { country: 'Ghana', city: 'Accra', location: 'Accra, Ghana' };
  }
  if (tz.includes('johannesburg') || tz.includes('south_africa')) {
    return { country: 'South Africa', city: 'Johannesburg', location: 'Johannesburg, South Africa' };
  }
  if (tz.includes('nairobi') || tz.includes('kenya')) {
    return { country: 'Kenya', city: 'Nairobi', location: 'Nairobi, Kenya' };
  }

  // European & UK mapping
  if (tz.includes('london')) {
    return { country: 'United Kingdom', city: 'London', location: 'London, United Kingdom' };
  }
  if (tz.includes('dublin')) {
    return { country: 'Ireland', city: 'Dublin', location: 'Dublin, Ireland' };
  }
  if (tz.includes('paris')) {
    return { country: 'France', city: 'Paris', location: 'Paris, France' };
  }
  if (tz.includes('berlin')) {
    return { country: 'Germany', city: 'Berlin', location: 'Berlin, Germany' };
  }

  // North American mapping
  if (tz.includes('new_york')) {
    return { country: 'United States', city: 'New York', location: 'New York, USA' };
  }
  if (tz.includes('chicago')) {
    return { country: 'United States', city: 'Chicago', location: 'Chicago, USA' };
  }
  if (tz.includes('los_angeles')) {
    return { country: 'United States', city: 'Los Angeles', location: 'Los Angeles, USA' };
  }
  if (tz.includes('toronto')) {
    return { country: 'Canada', city: 'Toronto', location: 'Toronto, Canada' };
  }
  if (tz.includes('dubai')) {
    return { country: 'United Arab Emirates', city: 'Dubai', location: 'Dubai, UAE' };
  }

  // Check headers from cloud proxies (Cloudflare, Google Cloud Ingress)
  const headerCountry = (req.headers['cf-ipcountry'] || req.headers['x-country-code'] || req.headers['x-appengine-country']) as string;
  if (headerCountry) {
    const code = headerCountry.toUpperCase();
    if (code === 'NG') return { country: 'Nigeria', city: 'Lagos', location: 'Lagos, Nigeria' };
    if (code === 'GB' || code === 'UK') return { country: 'United Kingdom', city: 'London', location: 'London, United Kingdom' };
    if (code === 'US') return { country: 'United States', city: 'United States', location: 'United States' };
    if (code === 'CA') return { country: 'Canada', city: 'Canada', location: 'Canada' };
    return { country: code, city: code, location: code };
  }

  // Default fallback for client's core audience
  return { country: 'Nigeria', city: 'Lagos', location: 'Lagos, Nigeria' };
}

function detectDevice(req: express.Request, explicitDevice?: string): 'mobile' | 'desktop' | 'tablet' {
  if (explicitDevice === 'mobile' || explicitDevice === 'desktop' || explicitDevice === 'tablet') {
    return explicitDevice;
  }
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (ua.includes('ipad') || ua.includes('tablet')) return 'tablet';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
  return 'desktop';
}

// Supabase-first persistence with local file fallback
function getLocalPackages(): Package[] {
  try {
    if (fs.existsSync(PACKAGES_FILE)) {
      const data = fs.readFileSync(PACKAGES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local packages file:', err);
  }
  return STARTER_PACKAGES;
}

function saveLocalPackages(packages: Package[]): void {
  try {
    fs.writeFileSync(PACKAGES_FILE, JSON.stringify(packages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local packages:', err);
  }
}

async function loadPackages(): Promise<Package[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('packages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          saveLocalPackages(data);
          return data;
        }
        // If table exists but is empty, seed with starter packages
        console.log('Supabase packages table is empty. Seeding starter packages...');
        const { error: seedErr } = await sb.from('packages').insert(STARTER_PACKAGES);
        if (!seedErr) {
          saveLocalPackages(STARTER_PACKAGES);
          return STARTER_PACKAGES;
        }
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local storage:', err);
    }
  }
  return getLocalPackages();
}

async function savePackages(packages: Package[]): Promise<void> {
  saveLocalPackages(packages);
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('packages').upsert(packages, { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase packages save warning:', err);
    }
  }
}

// Initialize settings
const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_number: process.env.WHATSAPP_NUMBER || '2347014995254',
  instagram_handle: process.env.INSTAGRAM_HANDLE || 'rachys_eats_treats',
  instagram_url: 'https://www.instagram.com/rachys_eats_treats?stkn=dXBmc2t5azEzOW44',
  business_name: "Rachy's Eats & Treats",
  location: 'Lagos, Nigeria',
  phone_number: '07014995254'
};

function getLocalSettings(): SiteSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading local settings file:', err);
  }
  return DEFAULT_SETTINGS;
}

function saveLocalSettings(settings: SiteSettings): void {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local settings:', err);
  }
}

async function loadSettings(): Promise<SiteSettings> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!error && data) {
        const merged = { ...DEFAULT_SETTINGS, ...data };
        saveLocalSettings(merged);
        return merged;
      }
      if (!error && !data) {
        // Seed default settings row in Supabase
        await sb.from('site_settings').upsert({ id: 'default', ...DEFAULT_SETTINGS });
        saveLocalSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
    } catch (err) {
      console.warn('Supabase settings query failed, falling back to local storage:', err);
    }
  }
  return getLocalSettings();
}

async function saveSettings(settings: SiteSettings): Promise<void> {
  saveLocalSettings(settings);
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('site_settings').upsert({ id: 'default', ...settings });
    } catch (err) {
      console.warn('Supabase settings save warning:', err);
    }
  }
}

function getLocalServices(): ServiceCategoryCard[] {
  try {
    if (fs.existsSync(SERVICES_FILE)) {
      const data = fs.readFileSync(SERVICES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local services file:', err);
  }
  return STARTER_SERVICES;
}

function saveLocalServices(services: ServiceCategoryCard[]): void {
  try {
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local services:', err);
  }
}

async function loadServices(): Promise<ServiceCategoryCard[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('services').select('*');
      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          saveLocalServices(data);
          return data;
        }
        // Seed services if table is empty
        await sb.from('services').insert(STARTER_SERVICES);
        saveLocalServices(STARTER_SERVICES);
        return STARTER_SERVICES;
      }
    } catch (err) {
      console.warn('Supabase services query failed, falling back to local storage:', err);
    }
  }
  return getLocalServices();
}

async function saveServices(services: ServiceCategoryCard[]): Promise<void> {
  saveLocalServices(services);
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('services').upsert(services, { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase services save warning:', err);
    }
  }
}

// Reels persistence
function getLocalReels(): ReelItem[] {
  try {
    if (fs.existsSync(REELS_FILE)) {
      const data = fs.readFileSync(REELS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local reels file:', err);
  }
  return STARTER_REELS;
}

function saveLocalReels(reels: ReelItem[]): void {
  try {
    fs.writeFileSync(REELS_FILE, JSON.stringify(reels, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local reels:', err);
  }
}

async function loadReels(): Promise<ReelItem[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('reels').select('*');
      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          saveLocalReels(data);
          return data;
        }
        await sb.from('reels').insert(STARTER_REELS);
        saveLocalReels(STARTER_REELS);
        return STARTER_REELS;
      }
    } catch (err) {
      console.warn('Supabase reels query failed, falling back to local storage:', err);
    }
  }
  return getLocalReels();
}

async function saveReels(reels: ReelItem[]): Promise<void> {
  saveLocalReels(reels);
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('reels').upsert(reels, { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase reels save warning:', err);
    }
  }
}

// Bookings persistence
function getLocalBookings(): BookingOrder[] {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading local bookings file:', err);
  }
  return [];
}

function saveLocalBookings(bookings: BookingOrder[]): void {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local bookings:', err);
  }
}

async function loadBookings(): Promise<BookingOrder[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        saveLocalBookings(data);
        return data;
      }
    } catch (err) {
      console.warn('Supabase bookings query failed, falling back to local storage:', err);
    }
  }
  return getLocalBookings();
}

async function saveBooking(booking: BookingOrder): Promise<void> {
  const current = getLocalBookings();
  const existingIdx = current.findIndex(b => b.id === booking.id);
  if (existingIdx >= 0) {
    current[existingIdx] = booking;
  } else {
    current.unshift(booking);
  }
  saveLocalBookings(current);

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('bookings').upsert(booking, { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase booking save warning:', err);
    }
  }
}

// Token helper
function generateToken(): string {
  const payload = JSON.stringify({ role: 'admin', ts: Date.now() });
  const b64 = Buffer.from(payload).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64url');
  return `${b64}.${hmac}`;
}

function verifyToken(token: string): boolean {
  if (!token || !token.includes('.')) return false;
  const [b64, hmac] = token.split('.');
  const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64url');
  if (hmac !== expectedHmac) return false;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf-8'));
    // Valid for 7 days
    if (Date.now() - payload.ts > 7 * 24 * 60 * 60 * 1000) return false;
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

// Security Headers & Hardening Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.removeHeader('X-Powered-By');
  next();
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Auth middleware for admin routes
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const cookieToken = req.cookies?.rachy_session;
  const token = headerToken || cookieToken;

  if (token && verifyToken(token)) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
}

// Login rate limiting & 3-error trial tracking
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

interface LoginAttemptRecord {
  failedAttempts: number;
  lockedUntil: number | null;
}

const loginAttempts = new Map<string, LoginAttemptRecord>();

function getClientIdentifier(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'client-default';
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth trial status check
app.get('/api/auth/attempt-status', (req, res) => {
  const clientKey = getClientIdentifier(req);
  const now = Date.now();
  let record = loginAttempts.get(clientKey);

  if (record && record.lockedUntil) {
    if (now < record.lockedUntil) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return res.json({
        locked: true,
        remainingSeconds,
        failedAttempts: record.failedAttempts,
        maxAttempts: MAX_LOGIN_ATTEMPTS,
        attemptsRemaining: 0
      });
    } else {
      // Lockout period expired
      loginAttempts.delete(clientKey);
      record = undefined;
    }
  }

  const currentFailed = record ? record.failedAttempts : 0;
  return res.json({
    locked: false,
    remainingSeconds: 0,
    failedAttempts: currentFailed,
    maxAttempts: MAX_LOGIN_ATTEMPTS,
    attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - currentFailed)
  });
});

// Auth endpoints
app.post('/api/login', (req, res) => {
  const clientKey = getClientIdentifier(req);
  const now = Date.now();
  let record = loginAttempts.get(clientKey);

  // Check if locked
  if (record && record.lockedUntil) {
    if (now < record.lockedUntil) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      return res.status(429).json({
        error: `Portal is temporarily locked due to 3 failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} (${remainingSeconds}s).`,
        locked: true,
        remainingSeconds,
        attemptsRemaining: 0,
        failedAttempts: record.failedAttempts,
        maxAttempts: MAX_LOGIN_ATTEMPTS
      });
    } else {
      // Lockout expired
      record = { failedAttempts: 0, lockedUntil: null };
      loginAttempts.set(clientKey, record);
    }
  }

  if (!record) {
    record = { failedAttempts: 0, lockedUntil: null };
    loginAttempts.set(clientKey, record);
  }

  const { password } = req.body;
  const inputPwd = (typeof password === 'string' ? password.trim() : '');
  const targetPwd = ADMIN_PASSWORD.trim();

  // Timing-safe comparison to prevent side-channel password length & prefix leakage
  let passwordsMatch = false;
  try {
    const inputBuf = crypto.createHash('sha256').update(inputPwd).digest();
    const targetBuf = crypto.createHash('sha256').update(targetPwd).digest();
    passwordsMatch = crypto.timingSafeEqual(inputBuf, targetBuf);
  } catch {
    passwordsMatch = false;
  }

  if (!passwordsMatch) {
    record.failedAttempts += 1;

    if (record.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;
      loginAttempts.set(clientKey, record);
      return res.status(429).json({
        error: 'Security Lockout: You have reached the maximum 3 failed attempts. The admin portal is locked for 15 minutes.',
        locked: true,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        attemptsRemaining: 0,
        failedAttempts: record.failedAttempts,
        maxAttempts: MAX_LOGIN_ATTEMPTS
      });
    }

    const attemptsRemaining = MAX_LOGIN_ATTEMPTS - record.failedAttempts;
    loginAttempts.set(clientKey, record);

    return res.status(401).json({
      error: `Incorrect password. You have ${attemptsRemaining} trial attempt${attemptsRemaining === 1 ? '' : 's'} remaining before lockout.`,
      locked: false,
      remainingSeconds: 0,
      attemptsRemaining,
      failedAttempts: record.failedAttempts,
      maxAttempts: MAX_LOGIN_ATTEMPTS
    });
  }

  // Successful login -> reset attempts
  loginAttempts.delete(clientKey);

  const token = generateToken();

  // Set signed/secure httpOnly cookie
  res.cookie('rachy_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return res.json({
    success: true,
    token,
    message: 'Welcome back, Rachy!'
  });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('rachy_session');
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/status', (req, res) => {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const cookieToken = req.cookies?.rachy_session;
  const token = headerToken || cookieToken;

  const authenticated = !!(token && verifyToken(token));
  return res.json({ authenticated });
});

// Endpoint to automatically fetch and cache real Instagram reel thumbnail
app.get('/api/instagram-thumbnail', async (req, res) => {
  try {
    const rawUrl = (req.query.url as string) || '';
    if (!rawUrl) {
      return res.status(400).json({ error: 'url parameter is required' });
    }

    const shortcodeMatch = rawUrl.match(/instagram\.com\/(?:reel|reels|p|tv)\/([^/?#&]+)/i);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : null;

    if (!shortcode) {
      return res.status(400).json({ error: 'Invalid Instagram reel URL' });
    }

    // Check if we already cached this thumbnail locally
    const publicReelsDir = path.join(process.cwd(), 'public', 'reels');
    if (!fs.existsSync(publicReelsDir)) {
      fs.mkdirSync(publicReelsDir, { recursive: true });
    }
    const cachedFile = path.join(publicReelsDir, `${shortcode}.jpg`);
    if (fs.existsSync(cachedFile)) {
      return res.json({ success: true, thumbnailUrl: `/reels/${shortcode}.jpg` });
    }

    // Fetch Instagram page to parse og:image
    const igUrl = `https://www.instagram.com/reel/${shortcode}/`;
    const resp = await fetch(igUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const htmlText = await resp.text();
    const ogMatch = htmlText.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

    if (ogMatch && ogMatch[1]) {
      const imgCdnUrl = ogMatch[1].replace(/&amp;/g, '&');
      // Download and cache
      const imgResp = await fetch(imgCdnUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (imgResp.ok) {
        const buffer = Buffer.from(await imgResp.arrayBuffer());
        fs.writeFileSync(cachedFile, buffer);
        return res.json({ success: true, thumbnailUrl: `/reels/${shortcode}.jpg` });
      }
    }

    return res.json({ success: false, error: 'Could not extract Instagram thumbnail' });
  } catch (err: any) {
    console.error('Error fetching IG thumbnail:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Packages endpoints
app.get('/api/packages', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    const packages = await loadPackages();
    // Sort by category then sort_order ascending
    const sorted = [...packages].sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
    res.json(sorted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load packages' });
  }
});

app.post('/api/packages', requireAdmin, async (req, res) => {
  try {
    const { category, title, price, image_url, description, sort_order } = req.body;

    if (!category || !title || !price || !image_url) {
      return res.status(400).json({ error: 'Category, title, price, and image URL are required' });
    }

    const packages = await loadPackages();
    const newId = packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1;

    const newPackage: Package = {
      id: newId,
      category: category.trim(),
      title: title.trim(),
      price: price.trim(),
      image_url: image_url.trim(),
      description: description ? description.trim() : '',
      sort_order: typeof sort_order === 'number' ? sort_order : (packages.filter(p => p.category === category).length + 1),
      created_at: new Date().toISOString()
    };

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('packages').insert(newPackage);
      } catch (err) {
        console.warn('Supabase insert package warning:', err);
      }
    }

    packages.push(newPackage);
    saveLocalPackages(packages);

    return res.status(201).json(newPackage);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create package' });
  }
});

app.put('/api/packages/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid package ID' });

    const packages = await loadPackages();
    const index = packages.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const { category, title, price, image_url, description, sort_order } = req.body;

    const updatedPackage: Package = {
      ...packages[index],
      category: category !== undefined ? category.trim() : packages[index].category,
      title: title !== undefined ? title.trim() : packages[index].title,
      price: price !== undefined ? price.trim() : packages[index].price,
      image_url: image_url !== undefined ? image_url.trim() : packages[index].image_url,
      description: description !== undefined ? description.trim() : packages[index].description,
      sort_order: typeof sort_order === 'number' ? sort_order : packages[index].sort_order
    };

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('packages').update(updatedPackage).eq('id', id);
      } catch (err) {
        console.warn('Supabase update package warning:', err);
      }
    }

    packages[index] = updatedPackage;
    saveLocalPackages(packages);
    return res.json(packages[index]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update package' });
  }
});

app.delete('/api/packages/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid package ID' });

    let packages = await loadPackages();
    const existing = packages.find(p => p.id === id);
    if (!existing) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('packages').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete package warning:', err);
      }
    }

    packages = packages.filter(p => p.id !== id);
    saveLocalPackages(packages);
    return res.json({ success: true, message: `Package "${existing.title}" deleted` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete package' });
  }
});

app.post('/api/packages/reset', requireAdmin, async (req, res) => {
  try {
    await savePackages(STARTER_PACKAGES);
    return res.json({ success: true, message: 'Reset packages to starter catalogue', packages: STARTER_PACKAGES });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to reset packages' });
  }
});

// Settings endpoints
app.get('/api/settings', async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json(await loadSettings());
});

app.post('/api/settings', requireAdmin, async (req, res) => {
  try {
    const current = await loadSettings();
    const updated: SiteSettings = {
      ...current,
      whatsapp_number: req.body.whatsapp_number ? req.body.whatsapp_number.trim() : current.whatsapp_number,
      instagram_handle: req.body.instagram_handle ? req.body.instagram_handle.trim() : current.instagram_handle,
      instagram_url: req.body.instagram_url ? req.body.instagram_url.trim() : current.instagram_url,
      phone_number: req.body.phone_number ? req.body.phone_number.trim() : current.phone_number,
      business_name: req.body.business_name ? req.body.business_name.trim() : current.business_name,
      location: req.body.location ? req.body.location.trim() : current.location,
      hero_title: req.body.hero_title !== undefined ? req.body.hero_title.trim() : current.hero_title,
      hero_subtitle: req.body.hero_subtitle !== undefined ? req.body.hero_subtitle.trim() : current.hero_subtitle,
      hero_image_url: req.body.hero_image_url !== undefined ? req.body.hero_image_url.trim() : current.hero_image_url,
    };
    await saveSettings(updated);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update settings' });
  }
});

// Services Showcase endpoints
app.get('/api/services', async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json(await loadServices());
});

app.post('/api/services', requireAdmin, async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      await saveServices(req.body);
      return res.json(req.body);
    }
    return res.status(400).json({ error: 'Expected an array of service cards' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save services' });
  }
});

// Reels Showcase endpoints
app.get('/api/reels', async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json(await loadReels());
});

app.post('/api/reels', requireAdmin, async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      await saveReels(req.body);
      return res.json(req.body);
    }
    return res.status(400).json({ error: 'Expected an array of reels' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save reels' });
  }
});

// Bookings endpoints
app.get('/api/bookings', requireAdmin, async (req, res) => {
  try {
    res.json(await loadBookings());
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load bookings' });
  }
});

// Booking & Contact Submission Throttle / Anti-Spam protection
const formSubmissionLog = new Map<string, number[]>();
const FORM_THROTTLE_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_FORM_SUBMISSIONS_PER_MINUTE = 5; // max 5 submissions per minute per IP

function throttleFormSubmissions(req: express.Request, res: express.Response, next: express.NextFunction) {
  const clientKey = getClientIdentifier(req);
  const now = Date.now();
  let timestamps = formSubmissionLog.get(clientKey) || [];

  // Evict timestamps outside the window
  timestamps = timestamps.filter(ts => now - ts < FORM_THROTTLE_WINDOW_MS);

  if (timestamps.length >= MAX_FORM_SUBMISSIONS_PER_MINUTE) {
    const oldest = timestamps[0];
    const waitSeconds = Math.ceil((FORM_THROTTLE_WINDOW_MS - (now - oldest)) / 1000);
    return res.status(429).json({
      error: `Too many submissions from your connection. Please wait ${waitSeconds} seconds before submitting another inquiry.`,
      retryAfter: waitSeconds
    });
  }

  timestamps.push(now);
  formSubmissionLog.set(clientKey, timestamps);
  next();
}

app.post('/api/bookings', throttleFormSubmissions, async (req, res) => {
  try {
    const bookingData = req.body;
    // Accept either customer_name/customer_phone or client_name/client_phone or name/phone
    const name = bookingData.customer_name || bookingData.client_name || bookingData.name;
    const phone = bookingData.customer_phone || bookingData.client_phone || bookingData.phone;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Customer name and phone number are required' });
    }

    // Input sanitization and length bounds
    if (typeof name !== 'string' || name.length > 150) {
      return res.status(400).json({ error: 'Invalid name provided' });
    }
    if (typeof phone !== 'string' || phone.length > 50) {
      return res.status(400).json({ error: 'Invalid phone provided' });
    }

    const newBooking: BookingOrder = {
      ...bookingData,
      id: bookingData.id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      client_name: String(name).trim().slice(0, 150),
      client_phone: String(phone).trim().slice(0, 50),
      recipient_name: bookingData.recipient_name ? String(bookingData.recipient_name).trim().slice(0, 150) : String(name).trim().slice(0, 150),
      created_at: bookingData.created_at || new Date().toISOString(),
      status: bookingData.status || 'Inquiry'
    };
    await saveBooking(newBooking);
    return res.status(201).json(newBooking);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to record booking' });
  }
});

app.put('/api/bookings/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const bookings = await loadBookings();
    const target = bookings.find(b => b.id === id);
    if (!target) return res.status(404).json({ error: 'Booking not found' });
    target.status = status;
    await saveBooking(target);
    return res.json(target);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update booking status' });
  }
});

// Database & Supabase connection status check (Admin protected to prevent architecture disclosure)
app.get('/api/database/status', requireAdmin, async (req, res) => {
  const sb = getSupabase();
  const url = process.env.SUPABASE_URL || 'https://wydjticoyawzdkvykekd.supabase.co';

  if (!sb) {
    return res.json({
      connected: false,
      provider: 'local',
      url,
      tables: {
        packages: false,
        services: false,
        settings: false,
        bookings: false,
        reels: false
      },
      message: 'Supabase client not initialized. Using local disk JSON persistence.'
    });
  }

  // Check tables presence
  const tableChecks: Record<string, boolean> = {
    packages: false,
    services: false,
    settings: false,
    bookings: false,
    reels: false
  };

  try {
    const [pkgRes, srvRes, setRes, bkgRes, relRes] = await Promise.all([
      sb.from('packages').select('id').limit(1),
      sb.from('services').select('id').limit(1),
      sb.from('site_settings').select('id').limit(1),
      sb.from('bookings').select('id').limit(1),
      sb.from('reels').select('id').limit(1)
    ]);

    tableChecks.packages = !pkgRes.error;
    tableChecks.services = !srvRes.error;
    tableChecks.settings = !setRes.error;
    tableChecks.bookings = !bkgRes.error;
    tableChecks.reels = !relRes.error;

    const allConnected = Object.values(tableChecks).every(Boolean);

    return res.json({
      connected: allConnected,
      provider: 'supabase',
      url,
      tables: tableChecks,
      message: allConnected
        ? 'Supabase PostgreSQL connected and all tables are live and synced!'
        : 'Connected to Supabase project, but one or more tables need to be created in the SQL Editor.'
    });
  } catch (err: any) {
    return res.json({
      connected: false,
      provider: 'local',
      url,
      tables: tableChecks,
      message: `Error connecting to Supabase: ${err.message}`
    });
  }
});

// Storage status check (Admin protected)
app.get('/api/storage/status', requireAdmin, (req, res) => {
  const configured = isCloudinaryConfigured();
  return res.json({
    provider: configured ? 'cloudinary' : 'local',
    cloudinaryConfigured: configured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || (process.env.CLOUDINARY_URL ? 'Connected via URL' : null),
    message: configured
      ? 'Cloudinary CDN active: Uploaded photos are stored in Cloudinary for permanent hosting and lightning-fast global CDN delivery.'
      : 'Local disk storage active: Photos are stored on server disk. Add Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) to .env to store all package images permanently on Cloudinary.'
  });
});

// Photo Upload endpoint (Admin only - Cloudinary with local fallback)
app.post('/api/upload', requireAdmin, async (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // 1. Try Cloudinary if configured
    const cld = getCloudinary();
    if (cld) {
      try {
        const uploadResult = await cld.uploader.upload(image, {
          folder: 'rachys_eats_and_treats',
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });

        return res.status(201).json({
          success: true,
          url: uploadResult.secure_url,
          storage: 'cloudinary',
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          message: 'Stored securely on Cloudinary'
        });
      } catch (cldErr: any) {
        console.error('Cloudinary upload warning (falling back to disk):', cldErr.message || cldErr);
      }
    }

    // 2. Fallback to server local disk storage
    let buffer: Buffer;
    let ext = 'jpg';

    if (image.startsWith('data:image/')) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid base64 image data' });
      }
      const rawExt = matches[1].toLowerCase();
      ext = rawExt === 'jpeg' ? 'jpg' : rawExt === 'svg+xml' ? 'svg' : rawExt;
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      return res.status(400).json({ error: 'Image must be base64 data URL' });
    }

    const uniqueId = `pkg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const cleanFileName = `${uniqueId}.${ext}`;
    const targetPath = path.join(UPLOADS_DIR, cleanFileName);

    fs.writeFileSync(targetPath, buffer);
    const publicUrl = `/uploads/${cleanFileName}`;

    return res.status(201).json({
      success: true,
      url: publicUrl,
      storage: 'local',
      cloudinaryConfigured: false,
      filename: cleanFileName,
      size: buffer.length
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to upload photo' });
  }
});

// Real-time visitor visit tracking (Public)
app.post('/api/analytics/visit', (req, res) => {
  try {
    const clientData = req.body || {};
    const { country, city, location } = resolveLocation(req, clientData);
    const device = detectDevice(req, clientData.device);
    const userAgent = req.headers['user-agent'] || 'Browser';
    const browser = userAgent.includes('Chrome')
      ? 'Chrome'
      : userAgent.includes('Safari')
      ? 'Safari'
      : userAgent.includes('Firefox')
      ? 'Firefox'
      : 'Browser';
    const page = typeof clientData.page === 'string' ? clientData.page : '/';

    const visit: StoredVisit = {
      id: `v_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      location,
      country,
      city,
      device,
      browser,
      page
    };

    const store = loadAnalytics();
    store.visits.push(visit);
    saveAnalytics(store);

    return res.status(201).json({ success: true, recorded: true, location });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to record visit' });
  }
});

// Real-time customer outreach tracking (Public - WhatsApp / Instagram / Phone)
app.post('/api/analytics/outreach', (req, res) => {
  try {
    const clientData = req.body || {};
    const { country, city, location } = resolveLocation(req, clientData);
    const device = detectDevice(req, clientData.device);
    const channel = clientData.channel === 'instagram' ? 'instagram' : 'whatsapp';
    const package_title = typeof clientData.package_title === 'string' ? clientData.package_title.trim() : 'General Consultation';
    const package_id = typeof clientData.package_id === 'number' ? clientData.package_id : undefined;

    const event: StoredOutreach = {
      id: `out_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      channel,
      package_title,
      package_id,
      location,
      country,
      city,
      device
    };

    const store = loadAnalytics();
    store.outreach.push(event);
    saveAnalytics(store);

    return res.status(201).json({ success: true, recorded: true, event });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to record outreach' });
  }
});

// Analytics Summary endpoint (Admin only)
app.get('/api/analytics/summary', requireAdmin, (req, res) => {
  try {
    const store = loadAnalytics();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    const totalVisits = store.visits.length;
    const visitsToday = store.visits.filter(v => new Date(v.timestamp).getTime() >= todayStart).length;
    const visits7d = store.visits.filter(v => new Date(v.timestamp).getTime() >= sevenDaysAgo).length;

    const totalOutreach = store.outreach.length;
    const outreachToday = store.outreach.filter(o => new Date(o.timestamp).getTime() >= todayStart).length;
    const outreach7d = store.outreach.filter(o => new Date(o.timestamp).getTime() >= sevenDaysAgo).length;

    const conversionRate = totalVisits > 0 ? ((totalOutreach / totalVisits) * 100).toFixed(1) + '%' : '0.0%';

    // Location aggregations & percentages
    const locationCounts = new Map<string, { count: number; country: string; city: string }>();
    store.visits.forEach(v => {
      const locKey = v.location || `${v.city}, ${v.country}` || 'Lagos, Nigeria';
      const current = locationCounts.get(locKey) || { count: 0, country: v.country || 'Nigeria', city: v.city || 'Lagos' };
      current.count += 1;
      locationCounts.set(locKey, current);
    });

    const locations = Array.from(locationCounts.entries()).map(([loc, data]) => ({
      location: loc,
      country: data.country,
      city: data.city,
      count: data.count,
      percentage: totalVisits > 0 ? Math.round((data.count / totalVisits) * 1000) / 10 : 0
    })).sort((a, b) => b.count - a.count);

    // Device aggregations & percentages
    const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
    store.visits.forEach(v => {
      if (deviceCounts[v.device] !== undefined) {
        deviceCounts[v.device] += 1;
      } else {
        deviceCounts.desktop += 1;
      }
    });

    const devices = Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      count,
      percentage: totalVisits > 0 ? Math.round((count / totalVisits) * 1000) / 10 : 0
    }));

    // Recent feeds
    const recentVisits = [...store.visits].reverse().slice(0, 50);
    const recentOutreach = [...store.outreach].reverse().slice(0, 50);

    return res.json({
      totalVisits,
      visitsToday,
      visits7d,
      totalOutreach,
      outreachToday,
      outreach7d,
      conversionRate,
      locations,
      devices,
      recentVisits,
      recentOutreach
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to compute analytics' });
  }
});

// Clear analytics logs (Admin only)
app.post('/api/analytics/clear', requireAdmin, (req, res) => {
  try {
    saveAnalytics({ visits: [], outreach: [] });
    return res.json({ success: true, message: 'Analytics logs reset successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to reset analytics' });
  }
});

// Start Server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
