import React, { useState, useRef, useEffect } from 'react';
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
  MessageCircle,
  Share2,
  Music,
  CheckCircle2,
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
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(131);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [expandedCaption, setExpandedCaption] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const instagramProfileUrl =
    instagramUrl ||
    settings?.instagram_url ||
    (settings?.instagram_handle
      ? `https://www.instagram.com/${settings.instagram_handle.replace('@', '')}`
      : 'https://www.instagram.com/rachys_eats_treats?stkn=dXBmc2t5azEzOW44');

  // Handle open reel
  const handleOpenReel = (reel: ReelItem) => {
    setActiveReel(reel);
    setIsPlaying(true);
    setHasLiked(false);
    setLikesCount(Math.floor(Math.random() * 80) + 120);
    setCopiedShare(false);
    setExpandedCaption(false);
    trackOutreach('instagram', `Clicked Reel: ${reel.title}`);
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
          text: activeReel?.caption || 'Watch this surprise setup by Rachy!',
          url: urlToShare
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(urlToShare);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  // Only display 3 primary reels or all if fewer
  const displayedReels = reels.slice(0, 3);

  return (
    <section id="reels-section" className="py-16 sm:py-24 bg-white border-t border-gray-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 mb-2.5 shadow-xs">
              <Instagram className="w-3.5 h-3.5 text-[var(--pink)]" />
              <span className="text-xs font-bold text-[var(--pink)] uppercase tracking-wider">
                Real Surprise Reactions
              </span>
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 tracking-tight">
              See Us In Action
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-xl">
              Watch genuine tears of joy, dancing saxophonists, and thrilling money-roll unboxings captured live across Lagos.
            </p>
          </div>

          <a
            href={instagramProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutreach('instagram', 'See Us In Action - View More')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-50 hover:bg-pink-100 text-xs font-bold text-[var(--pink)] border border-pink-200 transition-all group self-start sm:self-auto cursor-pointer"
          >
            <Instagram className="w-4 h-4 text-[var(--pink)]" />
            <span>@rachys_eats_treats</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 3 Featured Reels Grid with curved 9:16 portrait cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {displayedReels.map((reel, index) => {
            const coverImage = reel.thumbnail_url || FALLBACK_REEL_COVERS[index % FALLBACK_REEL_COVERS.length];

            return (
              <motion.div
                key={reel.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                onClick={() => handleOpenReel(reel)}
                className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200/90 bg-black aspect-[9/16] flex flex-col justify-between"
              >
                {/* Background Thumbnail Cover */}
                <img
                  src={coverImage}
                  alt={reel.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/40 group-hover:via-black/20 transition-colors" />

                {/* Top Badge */}
                <div className="relative z-10 p-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider border border-white/15">
                    {reel.occasion || 'Surprise Delivery'}
                  </span>
                  {reel.duration && (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-bold text-white">
                      {reel.duration}
                    </span>
                  )}
                </div>

                {/* Center Pink Play Button with Rachy's Brand Preset */}
                <div className="relative z-10 flex items-center justify-center my-auto">
                  <div className="w-14 h-14 rounded-full bg-[var(--pink)] text-white flex items-center justify-center shadow-xl group-hover:scale-115 group-hover:bg-[var(--pink-hover)] transition-all">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Content: Caption & Instagram Tag */}
                <div className="relative z-10 p-5 pt-0">
                  <div className="flex items-center gap-1.5 text-xs text-pink-300 font-semibold mb-1">
                    <Instagram className="w-3.5 h-3.5 text-[var(--pink)]" />
                    <span>Watch Reel</span>
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-white leading-tight mb-1 group-hover:text-pink-100 transition-colors">
                    {reel.title}
                  </h3>
                  {reel.caption && (
                    <p className="text-xs text-white/80 line-clamp-1 font-normal">
                      {reel.caption}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modal Video Player matching Image 1: In-Page TikTok / Reel Player */}
        <AnimatePresence>
          {activeReel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4"
              onClick={() => setActiveReel(null)}
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-black rounded-3xl overflow-hidden shadow-2xl w-full max-w-[370px] sm:max-w-[400px] aspect-[9/16] max-h-[92vh] border border-white/20 flex flex-col justify-between select-none"
              >
                {/* Close Button on top-right */}
                <button
                  onClick={() => setActiveReel(null)}
                  className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-md"
                  aria-label="Close reel player"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Video Layer */}
                <div
                  className="absolute inset-0 w-full h-full bg-neutral-950 flex items-center justify-center cursor-pointer"
                  onClick={handleTogglePlay}
                >
                  {(() => {
                    const rawUrl = activeReel.video_url || activeReel.instagram_url || '';
                    const embedUrl = getInstagramEmbedUrl(rawUrl);

                    // If it's a TikTok video
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

                    // Native Video playback (smooth loop, autoplay)
                    if (activeReel.video_url) {
                      return (
                        <video
                          ref={videoRef}
                          key={activeReel.id}
                          src={activeReel.video_url}
                          autoPlay
                          loop
                          playsInline
                          muted={isMuted}
                          className="w-full h-full object-cover"
                        />
                      );
                    }

                    // If Instagram embed iframe
                    if (embedUrl) {
                      return (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full border-0"
                          title={activeReel.title}
                          allow="autoplay; encrypted-media; fullscreen"
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

                  {/* Play/Pause overlay indicator on tap */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
                        <Play className="w-8 h-8 fill-white ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Vignette Shadow for text overlays */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
                </div>

                {/* TOP OVERLAY STICKER matching Image 1: "2 clients, 1 celebrant. She's a good woman. 🥺😍" */}
                <div className="relative z-20 pt-5 px-5 flex flex-col items-center text-center pointer-events-none">
                  <div className="bg-white text-gray-900 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold shadow-xl max-w-[280px] leading-tight border border-gray-100">
                    {activeReel.occasion === 'Birthday Setup'
                      ? '2 clients, 1 celebrant. She was overjoyed! 🥺😍'
                      : activeReel.caption?.slice(0, 48) || 'Surprise Reaction in Lagos! ✨'}
                  </div>
                </div>

                {/* IN-VIDEO BOLD SUBTITLES matching Image 1: "WOULD YOU BELIEVE THAT" */}
                <div className="relative z-10 px-6 my-auto text-center pointer-events-none">
                  <div className="inline-block px-3 py-1 bg-purple-600/90 text-white font-extrabold text-sm sm:text-base tracking-wider uppercase rounded-md shadow-lg">
                    {activeReel.title.split(' ').slice(0, 3).join(' ')}
                  </div>
                </div>

                {/* RIGHT SIDEBAR INTERACTION BUTTONS matching Image 1 */}
                <div className="absolute right-3.5 bottom-24 z-20 flex flex-col items-center gap-4 text-white">
                  {/* Avatar with Pink Plus badge */}
                  <div className="relative cursor-pointer group" onClick={() => window.open(instagramProfileUrl, '_blank')}>
                    <div className="w-11 h-11 rounded-full border-2 border-white overflow-hidden bg-[var(--pink)] flex items-center justify-center shadow-lg">
                      <span className="font-serif font-bold text-white text-xs">Rachy</span>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--pink)] text-white flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-extrabold leading-none">+</span>
                    </div>
                  </div>

                  {/* Heart / Like Button */}
                  <button
                    onClick={handleLike}
                    className="flex flex-col items-center gap-0.5 group cursor-pointer transition-transform active:scale-125"
                    aria-label="Like reel"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          hasLiked ? 'text-[var(--pink)] fill-[var(--pink)]' : 'text-white'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-white shadow-xs drop-shadow">
                      {likesCount}
                    </span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => window.open(activeReel.instagram_url || instagramProfileUrl, '_blank')}
                    className="flex flex-col items-center gap-0.5 cursor-pointer"
                    aria-label="Comment"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white fill-white/10" />
                    </div>
                    <span className="text-[11px] font-bold text-white drop-shadow">8</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-0.5 cursor-pointer"
                    aria-label="Share"
                    title={copiedShare ? 'Link copied!' : 'Share reel'}
                  >
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[11px] font-bold text-white drop-shadow">
                      {copiedShare ? 'Copied' : 'Share'}
                    </span>
                  </button>

                  {/* Mute/Unmute Toggle */}
                  <button
                    onClick={handleToggleMute}
                    className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-white/80" /> : <Volume2 className="w-4 h-4 text-white" />}
                  </button>
                </div>

                {/* BOTTOM OVERLAY matching Image 1: CTA button, author tag, caption, sound bar */}
                <div className="relative z-20 p-4 pt-2 text-white">
                  {/* "Watch on Instagram" or "Watch now" CTA banner matching Image 1 */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/15 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Instagram className="w-4 h-4 text-[var(--pink)]" />
                      <span className="font-semibold text-white/90">Watch on Instagram</span>
                    </div>
                    <a
                      href={activeReel.instagram_url || instagramProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackOutreach('instagram', `Opened Instagram Reel: ${activeReel.title}`)}
                      className="px-3.5 py-1 rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] text-white text-xs font-bold shadow-md transition-transform active:scale-95"
                    >
                      Watch now
                    </a>
                  </div>

                  {/* Author handle */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="font-bold text-xs sm:text-sm text-white">
                      @rachys_eats_treats
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--pink)] fill-[var(--pink)] text-white" />
                  </div>

                  {/* Caption with See More */}
                  <p className="text-xs text-white/90 leading-snug mb-2.5 max-w-[85%]">
                    {expandedCaption ? activeReel.caption : (
                      <>
                        {activeReel.caption?.slice(0, 75)}...{' '}
                        <button
                          onClick={() => setExpandedCaption(true)}
                          className="font-bold text-white hover:underline cursor-pointer"
                        >
                          See more
                        </button>
                      </>
                    )}
                  </p>

                  {/* Sound track ticker matching Image 1 */}
                  <div className="flex items-center gap-2 text-[11px] text-white/80 font-medium">
                    <Music className="w-3.5 h-3.5 text-[var(--pink)] animate-spin" style={{ animationDuration: '4s' }} />
                    <span className="truncate">🎵 original sound - Rachy's Eats &amp; Treats Lagos</span>
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
