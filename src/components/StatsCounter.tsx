import React, { useEffect, useState, useRef } from 'react';

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  formatCommas?: boolean;
  startTrigger: boolean;
}

const AnimatedNumber: React.FC<CounterProps> = ({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  formatCommas = false,
  startTrigger
}) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!startTrigger) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Ease-out cubic easing curve: decelerates gracefully as it approaches the end
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeOut * end);

      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [end, duration, startTrigger]);

  const formatted = formatCommas ? count.toLocaleString('en-US') : count.toString();

  return (
    <span className="tabular-nums font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-[#e2417e] tracking-tight">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export const StatsCounter: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasScrolledIntoView, setHasScrolledIntoView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasScrolledIntoView(true);
        }
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Also fallback to scroll position check if already visible
    const handleScroll = () => {
      if (sectionRef.current && !hasScrolledIntoView) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          setHasScrolledIntoView(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasScrolledIntoView]);

  return (
    <section
      id="impact-stats"
      ref={sectionRef}
      className="relative py-20 sm:py-28 bg-[#0e0c0b] border-t border-[rgba(245,236,226,0.08)] overflow-hidden"
    >
      {/* Subtle warm pink ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full pointer-events-none opacity-20 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, #e2417e 0%, rgba(226,65,126,0.1) 40%, transparent 70%)'
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Editorial Headline */}
        <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#f5ece2] tracking-tight leading-[1.15] mb-5">
          Gifts curated with care, delivered on time.
        </h2>

        {/* Narrative Paragraph */}
        <p className="font-sans text-sm sm:text-base md:text-lg text-[#b8a89d] max-w-2xl mx-auto leading-relaxed mb-14 sm:mb-20">
          Every box is packed by hand and every delivery is planned around the moment it's meant for — a birthday, a proposal, a thank you that needed saying properly.
        </p>

        {/* 3 Animated Number Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          
          {/* Stat 1: 430+ Orders delivered */}
          <div id="stat-orders" className="flex flex-col items-center justify-center p-4">
            <div className="min-h-[60px] flex items-center justify-center">
              <AnimatedNumber
                end={430}
                duration={2200}
                suffix="+"
                startTrigger={hasScrolledIntoView}
              />
            </div>
            <span className="font-sans text-xs sm:text-sm text-[#b8a89d] mt-2 tracking-wide font-medium">
              Orders delivered
            </span>
          </div>

          {/* Stat 2: 1,592 Instagram community */}
          <div id="stat-instagram" className="flex flex-col items-center justify-center p-4">
            <div className="min-h-[60px] flex items-center justify-center">
              <AnimatedNumber
                end={1592}
                duration={2500}
                formatCommas={true}
                startTrigger={hasScrolledIntoView}
              />
            </div>
            <span className="font-sans text-xs sm:text-sm text-[#b8a89d] mt-2 tracking-wide font-medium">
              Instagram community
            </span>
          </div>

          {/* Stat 3: Lagos Same-day delivery */}
          <div id="stat-location" className="flex flex-col items-center justify-center p-4">
            <div className="min-h-[60px] flex items-center justify-center">
              <span
                className={`font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-[#e2417e] tracking-tight transition-all duration-1000 ${
                  hasScrolledIntoView
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-4 scale-95'
                }`}
              >
                Lagos
              </span>
            </div>
            <span className="font-sans text-xs sm:text-sm text-[#b8a89d] mt-2 tracking-wide font-medium">
              Same-day delivery
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
