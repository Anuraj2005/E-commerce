'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  Sparkles,
  Truck,
  Home,
  Scissors,
  Gift,
  Calendar,
} from 'lucide-react';
import { Order, FulfillmentStatus } from '@/types';
import { apiRequest } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { formatINR } from '@/lib/format';

const STEPS: { status: FulfillmentStatus; label: string; icon: React.ElementType }[] = [
  { status: 'RECEIVED', label: 'Order Received', icon: CheckCircle2 },
  { status: 'HANDCRAFTING', label: 'Handcrafting', icon: Scissors },
  { status: 'PACKED', label: 'Ribbon & Wax Packed', icon: Gift },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: Home },
];

export default function OrderSuccessPage() {
  const params = useParams<{ id: string }>();
  const orderId = decodeURIComponent(params?.id || '');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<{ order: Order }>(`/orders/${orderId}`)
      .then((res) => {
        if (!active) return;
        setOrder(res.order);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load order');
        setLoading(false);
      });

    const socket = getSocket();
    const handleOrderUpdated = (payload: { order: Order }) => {
      if (
        payload?.order &&
        (payload.order.orderNumber === orderId.toUpperCase() || payload.order._id === orderId)
      ) {
        setOrder(payload.order);
      }
    };
    socket.on('order:updated', handleOrderUpdated);

    return () => {
      active = false;
      socket.off('order:updated', handleOrderUpdated);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="h-80 bg-white border border-brand-border animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-2xl uppercase tracking-widest text-brand-charcoal">
          Order Details Unavailable
        </h1>
        <p className="text-xs text-brand-muted">
          {error || 'Please ensure you are signed into the account that placed this order.'}
        </p>
        <Link
          href="/account"
          className="inline-block px-7 py-3 bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  const activeStepIdx = STEPS.findIndex((s) => s.status === order.fulfillmentStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">
      {/* Celebration Confirmation Header */}
      <div className="bg-white border border-brand-border p-7 md:p-10 text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
          <Sparkles className="w-7 h-7" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
          Thank You For Supporting Handmade
        </p>
        <h1 className="font-serif uppercase tracking-widest text-2xl md:text-3xl text-brand-charcoal">
          Order Confirmed · {order.orderNumber}
        </h1>
        <p className="text-xs md:text-sm text-brand-muted max-w-lg mx-auto">
          Our artisans have received your customization notes and queued your creation on our craft
          table. Watch your live fulfillment progress below!
        </p>
      </div>

      {/* Live Fulfillment Progress Tracker */}
      <div className="bg-white border border-brand-border p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal">
            Live Craft & Delivery Status
          </h2>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-brand-blush border border-brand-gold/40 text-brand-crimson">
            {order.fulfillmentStatus}
          </span>
        </div>

        {order.fulfillmentStatus === 'CANCELLED' ? (
          <div className="p-4 bg-red-50 border border-red-200 text-xs text-brand-crimson">
            This order was cancelled.
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 text-center">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const completed = idx <= activeStepIdx;
              return (
                <div key={step.status} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      completed
                        ? 'bg-brand-crimson border-brand-crimson text-white'
                        : 'bg-brand-surface border-brand-border text-brand-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`mt-2 text-[10px] sm:text-xs font-medium leading-tight ${
                      completed ? 'text-brand-charcoal font-semibold' : 'text-brand-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {(order.requestedDeliveryDate || order.estimatedDeliveryWindow) && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-brand-surface border border-brand-border text-xs">
            {order.requestedDeliveryDate && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Needed By (Customer Date)</span>
                </p>
                <p className="font-semibold text-brand-charcoal mt-0.5">
                  {order.requestedDeliveryDate}
                </p>
              </div>
            )}
            {order.estimatedDeliveryWindow && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Estimated Delivery Window</span>
                </p>
                <p className="font-bold text-emerald-700 mt-0.5">
                  {order.estimatedDeliveryWindow}
                </p>
              </div>
            )}
          </div>
        )}

        {order.trackingCode && (
          <div className="mt-6 p-3.5 bg-brand-surface border border-brand-border text-xs flex items-center justify-between">
            <span className="text-brand-muted">Courier AWB / Tracking Reference:</span>
            <strong className="text-brand-charcoal font-mono">{order.trackingCode}</strong>
          </div>
        )}
      </div>

      {/* Itemized Receipt & Address */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-white border border-brand-border p-6 space-y-4">
          <h3 className="font-serif uppercase tracking-widest text-xs font-semibold text-brand-charcoal pb-3 border-b border-brand-border flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-gold" />
            <span>Handcrafted Items Ordered</span>
          </h3>
          <div className="divide-y divide-brand-border">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 first:pt-0 flex gap-3.5">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-20 object-cover border border-brand-border shrink-0"
                />
                <div className="flex-1 text-xs space-y-1">
                  <p className="font-semibold text-brand-charcoal">{item.title}</p>
                  <p className="text-brand-muted">
                    Qty: {item.quantity} × {formatINR(item.price)}
                  </p>
                  {item.customization && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {item.customization.selectedTag && (
                        <span className="px-2 py-0.5 bg-brand-blush border border-brand-border">
                          Tag: {item.customization.selectedTag}
                        </span>
                      )}
                      {item.customization.selectedRibbon && (
                        <span className="px-2 py-0.5 bg-brand-blush border border-brand-border">
                          Ribbon: {item.customization.selectedRibbon}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-brand-charcoal">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {order.giftMessage && (
            <div className="p-3.5 bg-brand-blush border border-brand-gold/30 text-xs">
              <p className="font-semibold text-brand-charcoal mb-1">Personal Greeting Card Note:</p>
              <p className="italic text-brand-muted">&ldquo;{order.giftMessage}&rdquo;</p>
            </div>
          )}
        </div>

        <div className="md:col-span-5 bg-white border border-brand-border p-6 space-y-5">
          <div>
            <h3 className="font-serif uppercase tracking-widest text-xs font-semibold text-brand-charcoal pb-2 border-b border-brand-border">
              Delivery Destination
            </h3>
            <div className="mt-3 text-xs text-brand-muted space-y-1">
              <p className="font-semibold text-brand-charcoal">{order.customer.name}</p>
              <p>{order.shippingAddress.addressLine}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} –{' '}
                {order.shippingAddress.pincode}
              </p>
              <p>Phone: {order.customer.phone}</p>
              {order.requestedDeliveryDate && (
                <p className="pt-1.5 text-brand-charcoal">
                  Needed By: <strong className="font-semibold">{order.requestedDeliveryDate}</strong>
                </p>
              )}
              {order.estimatedDeliveryWindow && (
                <p className="text-emerald-700">
                  Est. Delivery:{' '}
                  <strong className="font-semibold">{order.estimatedDeliveryWindow}</strong>
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-serif uppercase tracking-widest text-xs font-semibold text-brand-charcoal pb-2 border-b border-brand-border">
              Payment Summary ({order.paymentMethod})
            </h3>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span>{formatINR(order.pricing.subtotal)}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-{formatINR(order.pricing.discount)}</span>
                </div>
              )}
              {order.pricing.giftWrapFee > 0 && (
                <div className="flex justify-between text-brand-muted">
                  <span>Wax-Sealed Card</span>
                  <span>{formatINR(order.pricing.giftWrapFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-muted">
                <span>Shipping</span>
                <span>
                  {order.pricing.shippingFee === 0
                    ? 'FREE'
                    : formatINR(order.pricing.shippingFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-brand-border flex justify-between font-bold text-sm text-brand-charcoal">
                <span>Total ({order.paymentStatus})</span>
                <span>{formatINR(order.pricing.total)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/account"
              className="w-full py-3 text-center border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors"
            >
              View All My Orders
            </Link>
            <Link
              href="/collections/all"
              className="w-full py-3 text-center bg-brand-charcoal text-white hover:bg-brand-gold text-xs font-semibold uppercase tracking-widest transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
