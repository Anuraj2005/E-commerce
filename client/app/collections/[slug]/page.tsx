'use client';

import { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { useCatalogStore } from '@/store/useCatalogStore';

function CollectionContent() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();

  const slug = decodeURIComponent(params?.slug || 'all').toLowerCase();
  const initialBadge = searchParams?.get('badge') || 'ALL';

  const categories = useCatalogStore((s) => s.categories);
  const products = useCatalogStore((s) => s.products);
  const isLoading = useCatalogStore((s) => s.isLoading);

  const [selectedBadge, setSelectedBadge] = useState<string>(initialBadge);
  const [priceBand, setPriceBand] = useState<'all' | 'under-1500' | '1500-2500' | 'over-2500'>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug.toLowerCase() === slug),
    [categories, slug]
  );

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (slug !== 'all') {
      list = list.filter((p) => {
        const catSlug =
          typeof p.category === 'object' ? p.category.slug?.toLowerCase() : '';
        return catSlug === slug;
      });
    }

    if (selectedBadge !== 'ALL') {
      list = list.filter((p) => p.badges?.includes(selectedBadge as never));
    }

    if (priceBand === 'under-1500') {
      list = list.filter((p) => p.price < 1500);
    } else if (priceBand === '1500-2500') {
      list = list.filter((p) => p.price >= 1500 && p.price <= 2500);
    } else if (priceBand === 'over-2500') {
      list = list.filter((p) => p.price > 2500);
    }

    if (onlyInStock) {
      list = list.filter((p) => p.stock > 0);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
    }

    return list;
  }, [products, slug, selectedBadge, priceBand, onlyInStock, sortBy]);

  const FilterControls = (
    <div className="space-y-6 text-xs">
      {/* Category Switcher */}
      <div>
        <h3 className="font-serif uppercase tracking-widest text-xs font-semibold text-brand-charcoal mb-3">
          Craft Collections
        </h3>
        <ul className="space-y-2">
          <li>
            <Link
              href="/collections/all"
              className={`block py-1 transition-colors ${
                slug === 'all' ? 'text-brand-crimson font-semibold' : 'text-brand-muted hover:text-brand-charcoal'
              }`}
            >
              All Handcrafted Gifts
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat._id}>
              <Link
                href={`/collections/${cat.slug}`}
                className={`block py-1 transition-colors ${
                  slug === cat.slug
                    ? 'text-brand-crimson font-semibold'
                    : 'text-brand-muted hover:text-brand-charcoal'
                }`}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Curated Tags */}
      <div className="pt-5 border-t border-brand-border">
        <h3 className="font-serif uppercase tracking-widest text-xs font-semibold text-brand-charcoal mb-3">
          Collection Highlight
        </h3>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'BESTSELLER', 'NEW', 'LIMITED'].map((badge) => (
            <button
              key={badge}
              type="button"
              onClick={() => setSelectedBadge(badge)}
              className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider border transition-colors ${
                selectedBadge === badge
                  ? 'bg-brand-charcoal text-white border-brand-charcoal'
                  : 'bg-white text-brand-charcoal border-brand-border hover:border-brand-gold'
              }`}
            >
              {badge}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="pt-5 border-t border-brand-border">
        <h3 className="font-serif uppercase tracking-widest text-xs font-semibold text-brand-charcoal mb-3">
          Price Range
        </h3>
        <div className="space-y-2">
          {[
            { id: 'all', label: 'All Prices' },
            { id: 'under-1500', label: 'Under ₹1,500' },
            { id: '1500-2500', label: '₹1,500 – ₹2,500' },
            { id: 'over-2500', label: 'Above ₹2,500' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-brand-charcoal">
              <input
                type="radio"
                name="priceBand"
                checked={priceBand === opt.id}
                onChange={() => setPriceBand(opt.id as typeof priceBand)}
                className="text-brand-crimson focus:ring-brand-gold"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="pt-5 border-t border-brand-border">
        <label className="flex items-center gap-2.5 cursor-pointer text-brand-charcoal font-medium">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
            className="rounded-xs text-brand-crimson focus:ring-brand-gold"
          />
          <span>Exclude Sold Out Items</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-blush">
      {/* Collection Header Banner */}
      <div className="bg-brand-canvas border-b border-brand-border py-8 md:py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="font-serif italic text-sm text-brand-gold">
            something handmade is so much more beautiful
          </p>
          <h1 className="font-serif uppercase tracking-widest text-brand-charcoal text-2xl md:text-3xl font-normal">
            {activeCategory ? activeCategory.name : 'All Handcrafted Collections'}
          </h1>
          <p className="text-xs md:text-sm text-brand-muted max-w-xl mx-auto">
            {activeCategory?.description ||
              'Explore our studio’s complete collection of ribbon-wrapped celebration hampers, hand-stitched linen albums, preserved bouquets, and keepsake frames.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Utility Toolbar */}
        <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-brand-border text-xs font-semibold uppercase tracking-wider"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
            <p className="text-xs text-brand-muted">
              Showing <strong className="text-brand-charcoal">{filteredProducts.length}</strong>{' '}
              handcrafted {filteredProducts.length === 1 ? 'creation' : 'creations'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="hidden sm:inline text-xs text-brand-muted">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs bg-white border-brand-border py-2 pl-3 pr-8 focus:border-brand-gold focus:ring-brand-gold"
            >
              <option value="featured">Featured Curations</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 bg-white p-6 border border-brand-border h-fit sticky top-28">
            {FilterControls}
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {isLoading && products.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="aspect-product bg-white/70 animate-pulse border border-brand-border"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-brand-border p-12 text-center space-y-4">
                <p className="font-serif text-xl text-brand-charcoal">
                  No crafts match your selected filters
                </p>
                <p className="text-xs text-brand-muted">
                  Try resetting your price band or badge filter to explore all studio creations.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBadge('ALL');
                    setPriceBand('all');
                    setOnlyInStock(false);
                  }}
                  className="px-6 py-2.5 bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white h-full z-10 p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-brand-border">
                <span className="font-serif uppercase tracking-widest text-sm font-semibold">
                  Filter Crafts
                </span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-brand-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {FilterControls}
            </div>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="mt-6 w-full py-3 bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest"
            >
              Show {filteredProducts.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-blush" />}>
      <CollectionContent />
    </Suspense>
  );
}
