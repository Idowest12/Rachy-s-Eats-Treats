// Instagram Reel & Video helper utilities

export function getInstagramShortcode(url: string): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([^/?#&]+)/i);
  return match ? match[1] : null;
}

export function getInstagramEmbedUrl(url: string, captioned: boolean = false): string | null {
  const code = getInstagramShortcode(url);
  if (!code) return null;
  return captioned
    ? `https://www.instagram.com/reel/${code}/embed/captioned/`
    : `https://www.instagram.com/reel/${code}/embed/`;
}

export function getInstagramWatchUrl(url: string): string {
  const code = getInstagramShortcode(url);
  if (code) {
    return `https://www.instagram.com/reel/${code}/`;
  }
  return url || 'https://www.instagram.com/rachys_eats_treats';
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

// Fallback authentic celebration covers
export const FALLBACK_REEL_COVERS = [
  '/reels/reel-1.jpg',
  '/reels/reel-2.jpg',
  '/reels/real_reaction_1.jpg',
  '/reels/real_sax_serenade.jpg',
  '/reels/celebration_cake.jpg',
  '/reels/surprise_balloons.jpg'
];
