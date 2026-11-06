'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import {
  useCartStore,
  FREE_SHIPPING_MILESTONE,
  STANDARD_DELIVERY_FEE,
} from '@/store/useCartStore';
import { formatINR } from '@/lib/format';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const giftMessage = useCartStore((s) => s.giftMessage);
  const setGiftMessage = useCartStore((s) => s.setGiftMessage);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee =
    items.length === 0 || subtotal >= FREE_SHIPPING_MILESTONE ? 0 : STANDARD_DELIVERY_FEE;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-gold">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="font-serif uppercase tracking-widest text-2xl text-brand-charcoal">
          Your Craft Bag Is Empty
        </h1>
        <p className="font-serif italic text-sm text-brand-gold">
          something handmade is so much more beautiful
        </p>
        <Link
          href="/collections/all"
          className="inline-block px-8 py-3.5 bg-brand-charcoal text-white hover:bg-brand-gold text-xs font-semibold uppercase tracking-widest transition-colors"
        >
          Explore Hampers & Keepsakes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <h1 className="font-serif uppercase tracking-widest text-2xl md:text-3xl text-brand-charcoal mb-8">
        Your Shopping Bag ({items.reduce((a, b) => a + b.quantity, 0)})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-brand-border divide-y divide-brand-border">
            {items.map((item) => (
              <div key={item.cartLineId} className="p-5 flex gap-4 sm:gap-6">
                <Link href={`/products/${item.slug}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-24 sm:w-24 sm:h-28 object-cover border border-brand-border"
                  />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-medium text-sm sm:text-base text-brand-charcoal hover:text-brand-crimson"
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.cartLineId)}
                        className="text-brand-muted hover:text-brand-crimson p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.customization && (
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-brand-muted">
                        {item.customization.selectedTag && (
                          <span className="px-2.5 py-0.5 bg-brand-blush border border-brand-border text-brand-charcoal">
                            Tag: {item.customization.selectedTag}
                          </span>
                        )}
                        {item.customization.selectedRibbon && (
                          <span className="px-2.5 py-0.5 bg-brand-blush border border-brand-border text-brand-charcoal">
                            Ribbon: {item.customization.selectedRibbon}
                          </span>
                        )}
                        {item.customization.customerUploadedPhotos &&
                          item.customization.customerUploadedPhotos.length > 0 && (
                            <span className="px-2.5 py-0.5 bg-brand-gold-light text-brand-charcoal font-medium">
                              {item.customization.customerUploadedPhotos.length} Custom Photo(s)
                            </span>
                          )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="inline-flex items-center border border-brand-border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartLineId, item.quantity - 1)}
                        className="p-2 hover:bg-brand-blush"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-xs font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.maxStock}
                        onClick={() => updateQuantity(item.cartLineId, item.quantity + 1)}
                        className="p-2 hover:bg-brand-blush disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-base text-brand-charcoal">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Personal Recipient Greeting Note */}
          <div className="bg-white border border-brand-border p-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal mb-1.5">
              Personal Recipient Greeting Note (Complimentary)
            </label>
            <textarea
              rows={3}
              maxLength={220}
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="Write a personal note for the recipient..."
              className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
            />
          </div>
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-brand-border p-6 space-y-4 sticky top-28">
            <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal pb-3 border-b border-brand-border">
              Order Summary
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Items Subtotal</span>
                <span className="font-medium text-brand-charcoal">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Pan-India Express Delivery</span>
                <span className="font-medium text-emerald-700">
                  {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
                </span>
              </div>
              <div className="pt-3 border-t border-brand-border flex justify-between items-baseline">
                <span className="text-sm font-bold text-brand-charcoal">Total Payable</span>
                <span className="text-xl font-bold text-brand-charcoal">{formatINR(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 bg-brand-charcoal hover:bg-brand-crimson text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
