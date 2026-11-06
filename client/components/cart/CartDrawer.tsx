'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Truck,
  MessageSquareHeart,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
  useCartStore,
  FREE_SHIPPING_MILESTONE,
  STANDARD_DELIVERY_FEE,
} from '@/store/useCartStore';
import { formatINR } from '@/lib/format';

export default function CartDrawer() {
  const router = useRouter();
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const giftMessage = useCartStore((s) => s.giftMessage);
  const setGiftMessage = useCartStore((s) => s.setGiftMessage);
  const stockNotice = useCartStore((s) => s.stockNotice);
  const clearStockNotice = useCartStore((s) => s.clearStockNotice);

  const [greetingOpen, setGreetingOpen] = useState(Boolean(giftMessage));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_MILESTONE - subtotal);
  const milestonePercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_MILESTONE) * 100));

  const shippingFee =
    items.length === 0 || subtotal >= FREE_SHIPPING_MILESTONE ? 0 : STANDARD_DELIVERY_FEE;
  const estimatedTotal = subtotal + shippingFee;
  const inclusiveGst = Math.round((subtotal * 0.12) / 1.12);

  const handleProceedToCheckout = () => {
    closeDrawer();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
            aria-label="Shopping Bag Drawer"
            className="w-full max-w-md bg-white shadow-2xl z-50 fixed inset-y-0 right-0 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border bg-brand-blush">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-crimson" />
                <h2 className="font-serif uppercase tracking-widest text-base text-brand-charcoal">
                  Your Craft Bag ({items.reduce((s, i) => s + i.quantity, 0)})
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close shopping bag"
                className="p-1.5 text-brand-muted hover:text-brand-charcoal transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Express Delivery Milestone Progress Bar */}
            <div className="px-5 py-3 bg-brand-surface border-b border-brand-border">
              <div className="flex items-center gap-2 text-xs text-brand-charcoal mb-2">
                <Truck className="w-4 h-4 text-brand-gold shrink-0" />
                {remainingForFreeShipping > 0 ? (
                  <p>
                    You are{' '}
                    <strong className="text-brand-crimson">
                      {formatINR(remainingForFreeShipping)}
                    </strong>{' '}
                    away from <strong>Free Express Delivery & Luxury Ribbon Wrap!</strong>
                  </p>
                ) : (
                  <p className="font-medium text-emerald-800">
                    ✨ Complimentary Express Delivery & Luxury Ribbon Wrap unlocked!
                  </p>
                )}
              </div>
              <div className="w-full h-1.5 bg-brand-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gold transition-all duration-500 rounded-full"
                  style={{ width: `${milestonePercent}%` }}
                />
              </div>
            </div>

            {/* Live Stock Sync Alert */}
            {stockNotice && (
              <div className="mx-5 mt-3 p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                  <span>{stockNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={clearStockNotice}
                  className="text-amber-700 hover:text-amber-950 font-semibold"
                >
                  ×
                </button>
              </div>
            )}

            {/* Line Items Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand-blush flex items-center justify-center text-brand-gold">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-lg text-brand-charcoal">Your craft bag is empty</p>
                    <p className="font-serif italic text-xs text-brand-gold">
                      something handmade is so much more beautiful
                    </p>
                  </div>
                  <Link
                    href="/collections/all"
                    onClick={closeDrawer}
                    className="px-7 py-3 bg-brand-charcoal text-white hover:bg-brand-gold text-xs font-semibold uppercase tracking-widest transition-colors"
                  >
                    Explore Hampers & Keepsakes
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-brand-border">
                    {items.map((item) => (
                      <div key={item.cartLineId} className="py-3.5 first:pt-0 flex gap-3.5">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeDrawer}
                          className="shrink-0"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-[70px] h-[84px] object-cover border border-brand-border"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={closeDrawer}
                              className="text-sm font-medium text-brand-charcoal hover:text-brand-crimson line-clamp-2 leading-snug"
                            >
                              {item.title}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(item.cartLineId)}
                              aria-label="Remove item"
                              className="p-1 text-brand-muted hover:text-brand-crimson transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Customized Craft Attributes */}
                          {item.customization && (
                            <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] text-brand-muted">
                              {item.customization.selectedTag && (
                                <span className="px-2 py-0.5 bg-brand-blush border border-brand-border text-brand-charcoal">
                                  Tag: {item.customization.selectedTag}
                                </span>
                              )}
                              {item.customization.selectedRibbon && (
                                <span className="px-2 py-0.5 bg-brand-blush border border-brand-border text-brand-charcoal">
                                  Ribbon: {item.customization.selectedRibbon}
                                </span>
                              )}
                              {item.customization.customerUploadedPhotos &&
                                item.customization.customerUploadedPhotos.length > 0 && (
                                  <span className="px-2 py-0.5 bg-brand-gold-light text-brand-charcoal font-medium">
                                    {item.customization.customerUploadedPhotos.length} Photo(s) Attached
                                  </span>
                                )}
                            </div>
                          )}

                          {/* Quantity Stepper & Line Price */}
                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="inline-flex items-center border border-brand-border">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.cartLineId, item.quantity - 1)
                                }
                                className="p-1.5 text-brand-charcoal hover:bg-brand-blush transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 text-xs font-semibold text-brand-charcoal">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={item.quantity >= item.maxStock}
                                onClick={() =>
                                  updateQuantity(item.cartLineId, item.quantity + 1)
                                }
                                className="p-1.5 text-brand-charcoal hover:bg-brand-blush transition-colors disabled:opacity-30"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-bold text-brand-charcoal">
                                {formatINR(item.price * item.quantity)}
                              </p>
                              {item.quantity >= item.maxStock && (
                                <p className="text-[10px] text-brand-crimson">
                                  Max available stock
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expandable Personal Greeting Box */}
                  <div className="border border-brand-border bg-brand-surface">
                    <button
                      type="button"
                      onClick={() => setGreetingOpen((o) => !o)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-brand-charcoal"
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquareHeart className="w-4 h-4 text-brand-crimson" />
                        <span>Add a personal message for the recipient...</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-brand-muted transition-transform ${
                          greetingOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {greetingOpen && (
                      <div className="px-3.5 pb-3.5">
                        <textarea
                          rows={3}
                          maxLength={220}
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="Write your heartfelt note here — we will transcribe it neatly inside your gift..."
                          className="w-full text-xs border-brand-border bg-white focus:border-brand-gold focus:ring-brand-gold"
                        />
                        <p className="text-right text-[10px] text-brand-muted mt-0.5">
                          {giftMessage.length}/220
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Checkout Action Footer */}
            {items.length > 0 && (
              <div className="border-t border-brand-border bg-brand-canvas p-5 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-brand-muted">
                    <span>Subtotal</span>
                    <span className="font-medium text-brand-charcoal">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-brand-muted">
                    <span>Pan-India Cushioned Shipping</span>
                    <span className="font-medium text-emerald-700">
                      {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-brand-border">
                    <div>
                      <span className="text-sm font-bold text-brand-charcoal">Estimated Total</span>
                      <span className="block text-[10px] text-brand-muted">
                        Inclusive of {formatINR(inclusiveGst)} GST
                      </span>
                    </div>
                    <span className="text-lg font-bold text-brand-charcoal">
                      {formatINR(estimatedTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 bg-brand-charcoal hover:bg-brand-crimson text-white text-xs font-semibold uppercase tracking-widest transition-colors shadow-md"
                >
                  Proceed to Checkout
                </button>

                <div className="text-center">
                  <Link
                    href="/cart"
                    onClick={closeDrawer}
                    className="text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-charcoal underline"
                  >
                    View Full Shopping Bag
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
