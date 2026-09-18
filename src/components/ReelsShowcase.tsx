import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Instagram,
  X,
  ArrowRight,
  ExternalLink,
  Heart,
  Share2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { ReelItem, SiteSettings } from '../types.ts';
import { trackOutreach } from '../utils/analytics.ts';
import {
  getInstagramEmbedUrl,
  isInstagramUrl,
  isTikTokUrl,
  getTikTokEmbedUrl,
  FALLBACK_REEL_COVERS
} from '../utils/instagram.ts';

interface ReelsShowcaseProps {
  reels?: ReelItem[];
  settings?: SiteSettings;
  instagramUrl?: string;
}

export const ReelsShowcase: React.FC<ReelsShowcaseProps> = ({
  reels = [],
  settings,
  instagramUrl
}) => {
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);
  const [inlineReelId, setInlineReelId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(142);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [expandedCaption, setExpandedCaption] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const rawPhone = settings?.whatsapp_number || '+2347014995254';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

  const instagramProfileUrl =
    instagramUrl ||
    settings?.instagram_url ||
    (settings?.instagram_handle
      ? `https://www.instagram.com/${settings.instagram_handle.replace('@', '')}`
      : 'https://www.instagram.com/rachys_eats_treats?stkn=dXBmc2t5azEzOW44');

  // Display up to 6 reels for a compact 3x2 mobile grid
  const displayedReels = reels.slice(0, 6);

  // Handle open reel in modal
  const handleOpenReel = (reel: ReelItem) => {
    setActiveReel(reel);
    setIsPlaying(true);
    setHasLiked(false);
    setLikesCount(Math.floor(Math.random() * 50) + 120);
    setCopiedShare(false);
    setExpandedCaption(false);
    trackOutreach('instagram', `Clicked Reel: ${reel.title}`);
  };

  const currentIndex = activeReel ? displayedReels.findIndex((r) => r.id === activeReel.id) : -1;

  const handleNextReel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex >= 0 && displayedReels.length > 0) {
      const nextReel = displayedReels[(currentIndex + 1) % displayedReels.length];
      handleOpenReel(nextReel);
    }
  };

  const handlePrevReel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex >= 0 && displayedReels.length > 0) {
      const prevReel = displayedReels[(currentIndex - 1 + displayedReels.length) % displayedReels.length];
      handleOpenReel(prevReel);
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLiked) {
      setHasLiked(true);
      setLikesCount((prev) => prev + 1);
    } else {
      setHasLiked(false);
      setLikesCount((prev) => prev - 1);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const urlToShare = activeReel?.instagram_url || instagramProfileUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeReel?.title || "Rachy's Surprise Reel",
          text: activeReel?.caption || 'Watch this surprise setup in Lagos by Rachy!',
          url: urlToShare
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(urlToShare);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <section id="reels-section" className="py-12 sm:py-20 bg-white text-neutral-900 border-t border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching User Reference Image 2 */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-8">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
              WATCH
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-neutral-900 tracking-tight">
              See Us In Action
            </h2>
          </div>

          <a
            href={instagramProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutreach('instagram', 'See Us In Action - View More')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-900 transition-colors group cursor-pointer"
          >
            <span>View More</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 3-Column Compact Grid matching User Reference Image 2 (no infinite vertical scrolling!) */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3.5 max-w-7xl mx-auto">
          {displayedReels.map((reel, index) => {
            const coverImage = reel.thumbnail_url || FALLBACK_REEL_COVERS[index % FALLBACK_REEL_COVERS.length];
            const isTikTok = reel.video_url?.includes('tiktok.com') || reel.instagram_url?.includes('tiktok.com');

            return (
              <motion.div
                key={reel.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleOpenReel(reel)}
                className="group relative aspect-[9/15] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 bg-neutral-900 cursor-pointer flex flex-col justify-between border border-gray-100"
              >
                {/* Background Thumbnail Cover */}
                <img
                  src={coverImage}
                  alt={reel.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_REEL_COVERS[index % FALLBACK_REEL_COVERS.length];
                  }}
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent group-hover:from-black/90 transition-colors" />

                {/* Center Orange Play Button matching User Screenshot */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-orange-600 transition-all duration-200">
                    <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Overlay Label with Instagram/TikTok icon matching User Screenshot */}
                <div className="relative z-10 p-2 sm:p-3 mt-auto flex items-center gap-1 text-[9px] sm:text-xs text-white font-medium truncate drop-shadow-md">
                  {isTikTok ? (
                    <span className="text-[10px] font-bold">♪</span>
                  ) : (
                    <Instagram className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
                  )}
                  <span className="truncate">{reel.occasion || "Rachy's Reel"}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modal Video Player */}
        <AnimatePresence>
          {activeReel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4"
              onClick={() => setActiveReel(null)}
            >
              {/* Navigation: Previous Reel button (on desktop left side) */}
              <button
                onClick={handlePrevReel}
                className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all cursor-pointer border border-white/20 shadow-xl"
                title="Previous Reel"
                aria-label="Previous Reel"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Navigation: Next Reel button (on desktop right side) */}
              <button
                onClick={handleNextReel}
                className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all cursor-pointer border border-white/20 shadow-xl"
                title="Next Reel"
                aria-label="Next Reel"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl w-full max-w-[420px] max-h-[94vh] border border-neutral-800 flex flex-col justify-between select-none"
              >
                {/* Top Header Bar */}
                <div className="flex items-center justify-between px-4 py-3.5 bg-neutral-900/90 backdrop-blur-md border-b border-white/10 z-30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--pink)] flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                      R
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-white truncate">
                          @rachys_eats_treats
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 fill-pink-400 shrink-0" />
                      </div>
                      <span className="text-[10px] text-pink-300 font-medium block truncate">
                        {activeReel.occasion || 'Surprise Delivery'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                      title={copiedShare ? 'Copied!' : 'Share'}
                      aria-label="Share reel"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveReel(null)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
                      aria-label="Close player"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Video Stage Layer */}
                <div className="relative w-full h-[470px] sm:h-[500px] bg-black flex items-center justify-center overflow-hidden">
                  {(() => {
                    const rawUrl = activeReel.video_url || activeReel.instagram_url || '';
                    const embedUrl = getInstagramEmbedUrl(rawUrl, false);

                    // If TikTok
                    if (isTikTokUrl(rawUrl)) {
                      const ttEmbed = getTikTokEmbedUrl(rawUrl);
                      if (ttEmbed) {
                        return (
                          <iframe
                            src={ttEmbed}
                            className="w-full h-full border-0"
                            title={activeReel.title}
                            allow="autoplay; encrypted-media; fullscreen"
                          />
                        );
                      }
                    }

                    // Native Video playback (if provided)
                    if (activeReel.video_url) {
                      return (
                        <div className="relative w-full h-full" onClick={handleTogglePlay}>
                          <video
                            ref={videoRef}
                            key={activeReel.id}
                            src={activeReel.video_url}
                            autoPlay
                            loop
                            playsInline
                            muted={isMuted}
                            className="w-full h-full object-cover cursor-pointer"
                          />
                          {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                              <div className="w-16 h-16 rounded-full bg-black/70 flex items-center justify-center text-white">
                                <Play className="w-8 h-8 fill-white ml-1" />
                              </div>
                            </div>
                          )}
                          <button
                            onClick={handleToggleMute}
                            className="absolute bottom-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                        </div>
                      );
                    }

                    // Instagram embed iframe (unobstructed, fully interactive for live playback)
                    if (embedUrl) {
                      return (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full border-0"
                          title={activeReel.title}
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          allowFullScreen
                          scrolling="no"
                        />
                      );
                    }

                    // Fallback cover image
                    return (
                      <img
                        src={activeReel.thumbnail_url || FALLBACK_REEL_COVERS[0]}
                        alt={activeReel.title}
                        className="w-full h-full object-cover filter brightness-80"
                      />
                    );
                  })()}
                </div>

                {/* Bottom Action Drawer */}
                <div className="p-4 bg-neutral-900/95 backdrop-blur-md border-t border-white/10 z-30 flex flex-col gap-3">
                  {/* Title & Caption */}
                  <div>
                    <h4 className="font-serif font-bold text-sm text-white leading-snug">
                      {activeReel.title}
                    </h4>
                    {activeReel.caption && (
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        {expandedCaption
                          ? activeReel.caption
                          : `${activeReel.caption.slice(0, 100)}${activeReel.caption.length > 100 ? '...' : ''}`}
                        {activeReel.caption.length > 100 && (
                          <button
                            onClick={() => setExpandedCaption(!expandedCaption)}
                            className="ml-1 text-pink-400 font-semibold hover:underline cursor-pointer"
                          >
                            {expandedCaption ? ' Less' : ' More'}
                          </button>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Quick CTAs */}
                  <div className="flex items-center gap-2 pt-1">
                    {/* Watch on Instagram App */}
                    <a
                      href={activeReel.instagram_url || instagramProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackOutreach('instagram', `Watch on Instagram: ${activeReel.title}`)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Watch on Instagram</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {/* Order via WhatsApp */}
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Hi Rachy's Eats & Treats! I just watched your Instagram Reel "${activeReel.title}" (${activeReel.occasion}) and I'd like to book this surprise setup in Lagos!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackOutreach('whatsapp', `Reel Inquiry: ${activeReel.title}`)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                      title="Inquire about this surprise on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Book Setup</span>
                    </a>

                    {/* Like button */}
                    <button
                      onClick={handleLike}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                        hasLiked
                          ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                      title="Like"
                      aria-label="Like"
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-pink-400 text-pink-400' : ''}`} />
                      <span>{likesCount}</span>
                    </button>
                  </div>

                  {/* Navigation dots for mobile */}
                  <div className="flex md:hidden items-center justify-between pt-1 text-xs text-neutral-400">
                    <button
                      onClick={handlePrevReel}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <span className="text-[11px] text-neutral-400">
                      {currentIndex + 1} of {displayedReels.length}
                    </span>
                    <button
                      onClick={handleNextReel}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
