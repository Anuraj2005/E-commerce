'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 'hampers',
    kicker: 'HANDCRAFTED LUXURY GIFTS',
    title: 'Make Moments Unforgettable',
    subhead:
      'Discover curated celebration hampers, bespoke albums, and floral arrangements designed with love.',
    ctaText: 'EXPLORE HAMPERS',
    ctaHref: '/collections/hampers',
    image:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1800&q=85',
  },
  {
    id: 'celebrations',
    kicker: 'CRIMSON & GOLD FESTIVE CONCIERGE',
    title: 'Grand Celebration Trunks & Boxes',
    subhead:
      'Finished with hand-poured botanical wax seals, satin ribbons, and personalized calligraphy tags.',
    ctaText: 'SHOP CELEBRATION HAMPERS',
    ctaHref: '/collections/celebration-hampers',
    image:
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1800&q=85',
  },
  {
    id: 'keepsakes',
    kicker: 'BESPOKE HEIRLOOM KEEPSAKES',
    title: 'Hand-Stitched Albums & Pressed-Flower Frames',
    subhead:
      'Upload your cherished memories and let our artisans print, mount, and gift-wrap them to perfection.',
    ctaText: 'CUSTOMIZE KEEPSAKES',
    ctaHref: '/collections/albums',
    image:
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1800&q=85',
  },
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const current = SLIDES[active];

  return (
    <section className="relative w-full aspect-product md:aspect-[16/7] overflow-hidden bg-brand-charcoal">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0.35, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.35 }}
          transition={{ duration: 0.65 }}
          className="absolute inset-0"
        >
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20 md:from-black/65 md:via-black/35 md:to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex items-center">
        <div className="max-w-xl text-white space-y-4">
          <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.28em] text-brand-gold-light">
            {current.kicker}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[52px] leading-[1.14] font-normal">
            {current.title}
          </h1>
          <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-lg">
            {current.subhead}
          </p>
          <p className="font-serif italic text-sm md:text-base text-brand-gold-light">
            “something handmade is so much more beautiful”
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href={current.ctaHref}
              className="inline-block bg-brand-charcoal text-white hover:bg-brand-gold px-8 py-3.5 text-xs font-semibold tracking-widest uppercase transition-all border border-white/25"
            >
              {current.ctaText}
            </Link>
            <Link
              href="/collections/all"
              className="inline-block bg-white/15 backdrop-blur-xs text-white hover:bg-white hover:text-brand-charcoal px-6 py-3.5 text-xs font-semibold tracking-widest uppercase transition-all"
            >
              VIEW ALL CRAFTS
            </Link>
          </div>
        </div>
      </div>

      {/* Prev / Next Controls */}
      <button
        type="button"
        onClick={() => setActive((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-brand-charcoal items-center justify-center backdrop-blur-xs transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => setActive((prev) => (prev + 1) % SLIDES.length)}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-brand-charcoal items-center justify-center backdrop-blur-xs transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Dots */}
      <div className="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-2">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Slide ${idx + 1}`}
            onClick={() => setActive(idx)}
            className={`h-1.5 transition-all rounded-full ${
              idx === active ? 'w-8 bg-brand-gold' : 'w-2 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
