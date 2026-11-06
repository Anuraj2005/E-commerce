'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Star, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatINR } from '@/lib/format';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const wishlistIds = useCartStore((s) => s.wishlistIds);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);

  const isWishlisted = wishlistIds.includes(product._id);
  const isSoldOut = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 4;

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '';
  const secondaryImage =
    product.images.find((img) => !img.isPrimary)?.url || product.images[1]?.url || primaryImage;

  const topBadge = product.badges?.[0];
  const requiresPhotos = Boolean(product.customizationOptions?.requiresPhotoUpload);

  const handleQuickAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;

    if (requiresPhotos) {
      router.push(`/products/${product.slug}`);
      return;
    }

    addItem(product, 1);
  };

  return (
    <div className="group flex flex-col bg-brand-canvas border border-brand-border/80 hover:border-brand-gold/50 transition-all duration-300">
      {/* 4:5 Aspect Ratio Image Container */}
      <div className="relative aspect-product w-full overflow-hidden bg-brand-surface">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {/* Primary Wrapped Gift Image */}
          <img
            src={primaryImage}
            alt={product.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-500 ${
              secondaryImage !== primaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'
            } ${isSoldOut ? 'grayscale opacity-65' : ''}`}
          />

          {/* Secondary Interior / Unboxed Image on Hover */}
          {secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.title} interior view`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 scale-100 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
          )}
        </Link>

        {/* Top-Left Badge Stack */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {topBadge && !isSoldOut && (
            <span
              className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                topBadge === 'LIMITED'
                  ? 'bg-brand-crimson text-white'
                  : topBadge === 'BESTSELLER'
                  ? 'bg-brand-gold text-white'
                  : 'bg-brand-charcoal text-white'
              }`}
            >
              {topBadge}
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-gold-light text-brand-charcoal border border-brand-gold/40">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'text-brand-crimson fill-brand-crimson' : 'text-brand-charcoal'
            }`}
          />
        </button>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
            <span className="bg-brand-charcoal text-white px-4 py-2 text-xs font-semibold uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}

        {/* Slide-Up Quick Add / Customize CTA */}
        {!isSoldOut && (
          <div className="absolute inset-x-2.5 bottom-2.5 z-10 translate-y-2 opacity-95 md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              type="button"
              onClick={handleQuickAction}
              className="w-full py-2.5 px-3 bg-brand-charcoal/95 hover:bg-brand-gold text-white text-[11px] font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg transition-colors"
            >
              {requiresPhotos ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Customize Photos</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ Quick Add</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Details Footer */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1.5">
        <div>
          {/* Star Rating */}
          <div className="flex items-center gap-1 text-[11px] text-brand-muted mb-1">
            <div className="flex items-center text-brand-gold">
              <Star className="w-3.5 h-3.5 fill-brand-gold" />
            </div>
            <span className="font-medium text-brand-charcoal">
              {product.ratings?.average?.toFixed(1) || '4.9'}
            </span>
            <span>· {product.ratings?.count || 24} reviews</span>
          </div>

          {/* Product Title */}
          <Link
            href={`/products/${product.slug}`}
            className="font-sans font-medium text-sm md:text-base text-brand-charcoal hover:text-brand-crimson transition-colors block truncate"
            title={product.title}
          >
            {product.title}
          </Link>
        </div>

        {/* Clean Price Block (No Offer Tag / MRP Strike-Through) */}
        <div className="pt-1 flex items-baseline">
          <span className="font-sans font-bold text-base text-brand-charcoal">
            {formatINR(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
