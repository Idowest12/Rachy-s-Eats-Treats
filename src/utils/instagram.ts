// Instagram Reel & Video helper utilities

export function getInstagramShortcode(url: string): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([^/?#&]+)/i);
  return match ? match[1] : null;
}

export function getInstagramEmbedUrl(url: string): string | null {
  const code = getInstagramShortcode(url);
  return code ? `https://www.instagram.com/reel/${code}/embed/captioned/` : null;
}

export function isInstagramUrl(url: string): boolean {
  if (!url) return false;
  return /instagram\.com\/(?:reel|reels|p|tv)\//i.test(url);
}

export function isTikTokUrl(url: string): boolean {
  if (!url) return false;
  return /tiktok\.com\//i.test(url);
}

export function getTikTokEmbedUrl(url: string): string | null {
  const match = url.match(/video\/(\d+)/);
  return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null;
}

// Fallback high quality surprise celebration covers
export const FALLBACK_REEL_COVERS = [
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'
];
