'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, ShoppingBag, X, Heart, Instagram } from 'lucide-react';
import { InstagramPost } from '@/types';
import { formatINR } from '@/lib/format';
import { useCartStore } from '@/store/useCartStore';

interface InstagramGridProps {
  posts: InstagramPost[];
}

export default function InstagramGrid({ posts }: InstagramGridProps) {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-brand-canvas border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-crimson">
            <Instagram className="w-4 h-4" />
            <span>@artisticfusion.in</span>
          </div>
          <h2 className="font-serif uppercase tracking-widest text-brand-charcoal text-xl md:text-3xl text-center font-normal">
            Shop Our Craft Table & Lookbook
          </h2>
          <p className="font-serif italic text-sm md:text-base text-brand-gold">
            Tap any studio snapshot below to shop the exact handmade hampers & keepsakes featured
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {posts.map((post) => (
            <button
              key={post._id}
              type="button"
              onClick={() => setSelectedPost(post)}
              className="group relative aspect-square overflow-hidden bg-brand-surface border border-brand-border text-left"
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Reel Indicator Icon */}
              {post.isReel && (
                <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs">
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                </span>
              )}

              {/* Hover Shop Overlay */}
              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-center text-white">
                <ShoppingBag className="w-5 h-5 mb-1.5 text-brand-gold-light" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">
                  Shop the Look
                </span>
                <span className="text-[11px] text-white/80 mt-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-white" /> {post.likesCount}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick-Shop Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-sm overflow-hidden shadow-2xl border border-brand-border grid grid-cols-1 md:grid-cols-2 max-h-[90vh]">
            <div className="relative bg-brand-charcoal aspect-square md:aspect-auto">
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.caption}
                className="w-full h-full object-cover"
              />
              {selectedPost.isReel && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/65 text-white text-[10px] uppercase tracking-widest flex items-center gap-1">
                  <Play className="w-3 h-3 fill-white" /> Studio Reel
                </span>
              )}
            </div>

            <div className="flex flex-col justify-between p-5 md:p-6 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                  <span className="text-xs font-semibold text-brand-crimson">
                    {selectedPost.handle}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedPost(null)}
                    className="p-1 text-brand-muted hover:text-brand-charcoal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-brand-muted leading-relaxed mt-3">
                  {selectedPost.caption}
                </p>

                <h4 className="text-[11px] font-semibold uppercase tracking-widest text-brand-charcoal mt-5 mb-3">
                  Featured Handmade Items ({selectedPost.products?.length || 0})
                </h4>

                <div className="space-y-3">
                  {(selectedPost.products || []).map((prod) => (
                    <div
                      key={prod._id}
                      className="flex items-center gap-3 p-2.5 border border-brand-border bg-brand-blush/50"
                    >
                      <img
                        src={prod.images?.[0]?.url}
                        alt={prod.title}
                        className="w-14 h-16 object-cover border border-brand-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${prod.slug}`}
                          onClick={() => setSelectedPost(null)}
                          className="text-xs font-semibold text-brand-charcoal hover:text-brand-crimson block truncate"
                        >
                          {prod.title}
                        </Link>
                        <p className="text-xs font-bold text-brand-charcoal mt-0.5">
                          {formatINR(prod.price)}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            type="button"
                            disabled={prod.stock <= 0}
                            onClick={() => {
                              setSelectedPost(null);
                              addItem(prod, 1);
                            }}
                            className="px-3 py-1 bg-brand-charcoal hover:bg-brand-gold text-white text-[10px] font-semibold uppercase tracking-widest transition-colors disabled:opacity-40"
                          >
                            {prod.stock <= 0 ? 'Sold Out' : '+ Add to Bag'}
                          </button>
                          <Link
                            href={`/products/${prod.slug}`}
                            onClick={() => setSelectedPost(null)}
                            className="text-[10px] uppercase tracking-wider text-brand-muted hover:text-brand-charcoal underline"
                          >
                            Customize
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] font-serif italic text-brand-gold mt-6 pt-3 border-t border-brand-border">
                “something handmade is so much more beautiful”
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
