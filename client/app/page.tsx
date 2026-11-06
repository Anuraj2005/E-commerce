'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import HeroSlider from '@/components/home/HeroSlider';
import StoryHighlights from '@/components/home/StoryHighlights';
import ProductCard from '@/components/product/ProductCard';
import InstagramGrid from '@/components/home/InstagramGrid';
import { useCatalogStore } from '@/store/useCatalogStore';

export default function HomePage() {
  const categories = useCatalogStore((s) => s.categories);
  const products = useCatalogStore((s) => s.products);
  const instagramPosts = useCatalogStore((s) => s.instagramPosts);
  const isLoading = useCatalogStore((s) => s.isLoading);

  const bestsellers = products
    .filter((p) => p.badges?.includes('BESTSELLER'))
    .slice(0, 4);
  const displayBestsellers = bestsellers.length >= 4 ? bestsellers : products.slice(0, 4);

  const keepsakesAndFlorals = products.slice(4, 12);

  return (
    <div>
      {/* Mobile-First Story Highlights immediately below Navbar */}
      <StoryHighlights categories={categories} className="md:hidden" />

      {/* Full-Width Hero Banner Slider */}
      <HeroSlider />

      {/* Desktop Story Highlights immediately below Hero */}
      <StoryHighlights categories={categories} className="hidden md:block" />

      {/* Section 1: Signature Bestsellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <p className="font-serif italic text-sm md:text-base text-brand-gold">
            something handmade is so much more beautiful
          </p>
          <h2 className="font-serif uppercase tracking-widest text-brand-charcoal text-xl md:text-3xl text-center font-normal">
            Most-Loved Signature Hampers
          </h2>
        </div>

        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-product bg-brand-surface animate-pulse border border-brand-border"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {displayBestsellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/collections/all?badge=BESTSELLER"
            className="inline-flex items-center gap-2 px-8 py-3 border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            <span>View All Bestsellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Dual Editorial Split Banner (Joker & Witch High-Conversion Pattern) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/collections/albums"
            className="group relative aspect-[16/10] overflow-hidden border border-brand-border bg-brand-charcoal"
          >
            <img
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85"
              alt="Handcrafted Memory Albums & A5 Frames"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
              <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold-light">
                Upload Photos Directly Online
              </span>
              <h3 className="font-serif text-2xl md:text-3xl mt-1">
                Heirloom Albums & A5 Frames
              </h3>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white group-hover:text-brand-gold-light">
                <span>Personalize Yours</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          <Link
            href="/collections/celebration-hampers"
            className="group relative aspect-[16/10] overflow-hidden border border-brand-border bg-brand-charcoal"
          >
            <img
              src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1000&q=85"
              alt="Crimson & Gold Celebration Hampers"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
              <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold-light">
                Weddings · Anniversaries · Milestones
              </span>
              <h3 className="font-serif text-2xl md:text-3xl mt-1">
                Crimson & Gold Celebration Trunks
              </h3>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white group-hover:text-brand-gold-light">
                <span>Explore Hampers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Section 2: Curated Keepsakes, Bouquets & Stationery */}
      <section className="bg-brand-surface border-t border-brand-border py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-brand-crimson font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh From Our Craft Table</span>
            </div>
            <h2 className="font-serif uppercase tracking-widest text-brand-charcoal text-xl md:text-3xl text-center font-normal">
              Keepsakes, Bouquets & Invitations
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {keepsakesAndFlorals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/collections/all"
              className="inline-block bg-brand-charcoal text-white hover:bg-brand-gold px-9 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors"
            >
              Shop Complete Collection ({products.length})
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: UGC & Instagram Shop-the-Look Grid */}
      <InstagramGrid posts={instagramPosts} />
    </div>
  );
}
