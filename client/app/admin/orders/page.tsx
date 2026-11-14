'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowRight, Sparkles, Image as ImageIcon, Truck, CheckCircle2, Calendar } from 'lucide-react';
import { FulfillmentStatus, Order } from '@/types';
import { apiRequest } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { formatINR } from '@/lib/format';

const COLUMNS: { status: FulfillmentStatus; title: string; badgeClass: string }[] = [
  {
    status: 'RECEIVED',
    title: '1. Received',
    badgeClass: 'bg-amber-100 text-amber-900',
  },
  {
    status: 'HANDCRAFTING',
    title: '2. Handcrafting',
    badgeClass: 'bg-brand-petal text-brand-crimson',
  },
  {
    status: 'PACKED',
    title: '3. Ribbon Packed',
    badgeClass: 'bg-brand-gold-light text-brand-charcoal',
  },
  {
    status: 'SHIPPED',
    title: '4. Shipped',
    badgeClass: 'bg-blue-100 text-blue-900',
  },
  {
    status: 'DELIVERED',
    title: '5. Delivered',
    badgeClass: 'bg-emerald-100 text-emerald-900',
  },
];

const NEXT_STAGE_MAP: Partial<Record<FulfillmentStatus, { next: FulfillmentStatus; label: string }>> =
  {
    RECEIVED: { next: 'HANDCRAFTING', label: 'Start Handcrafting' },
    HANDCRAFTING: { next: 'PACKED', label: 'Mark Packed' },
    PACKED: { next: 'SHIPPED', label: 'Dispatch & Ship' },
    SHIPPED: { next: 'DELIVERED', label: 'Mark Delivered' },
  };

export default function AdminOrdersKanbanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const fetchOrders = useCallback(async () => {
    try {
      const res = await apiRequest<{ orders: Order[] }>('/orders');
      setOrders(res.orders || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const socket = getSocket();

    const onCreated = (payload: { order: Order }) => {
      if (!payload?.order) return;
      setOrders((prev) =>
        prev.some((o) => o._id === payload.order._id) ? prev : [payload.order, ...prev]
      );
    };

    const onUpdated = (payload: { order: Order }) => {
      if (!payload?.order) return;
      setOrders((prev) =>
        prev.map((o) => (o._id === payload.order._id ? payload.order : o))
      );
    };

    socket.on('order:created', onCreated);
    socket.on('order:updated', onUpdated);

    return () => {
      socket.off('order:created', onCreated);
      socket.off('order:updated', onUpdated);
    };
  }, [fetchOrders]);

  const advanceOrder = async (order: Order, nextStatus: FulfillmentStatus) => {
    setUpdatingId(order._id);
    try {
      const trackingCode = trackingInputs[order._id]?.trim();
      const res = await apiRequest<{ order: Order }>(`/orders/${order._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          fulfillmentStatus: nextStatus,
          ...(trackingCode ? { trackingCode } : {}),
        }),
      });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? res.order : o)));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold">
          Artisan Assembly & Dispatch Pipeline
        </p>
        <h1 className="font-serif uppercase tracking-widest text-2xl text-brand-charcoal mt-0.5">
          Order Fulfillment Kanban ({orders.length})
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Inspect ribbon colors, custom foil tag text, recipient greeting notes, and customer-uploaded
          photos directly on each craft ticket.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-96 bg-white border border-brand-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colOrders = orders.filter((o) => o.fulfillmentStatus === col.status);
            return (
              <div
                key={col.status}
                className="bg-brand-canvas border border-brand-border flex flex-col min-h-[420px]"
              >
                <div className="px-4 py-3 border-b border-brand-border bg-brand-blush flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                    {col.title}
                  </h2>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${col.badgeClass}`}
                  >
                    {colOrders.length}
                  </span>
                </div>

                <div className="p-3 space-y-3 flex-1">
                  {colOrders.length === 0 ? (
                    <p className="text-[11px] text-brand-muted text-center py-8 italic">
                      No orders in this stage
                    </p>
                  ) : (
                    colOrders.map((order) => {
                      const nextStage = NEXT_STAGE_MAP[order.fulfillmentStatus];
                      return (
                        <div
                          key={order._id}
                          className="p-3.5 bg-brand-surface border border-brand-border space-y-3 shadow-2xs"
                        >
                          {/* Ticket Top Row */}
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-brand-charcoal">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs font-bold text-brand-crimson">
                              {formatINR(order.pricing.total)}
                            </span>
                          </div>

                          {/* Customer & PIN */}
                          <div className="text-[11px] text-brand-muted">
                            <p className="font-semibold text-brand-charcoal">
                              {order.customer.name} · {order.customer.phone}
                            </p>
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.pincode} (
                              {order.paymentMethod})
                            </p>
                          </div>

                          {/* Customer Target Date & Estimated Delivery */}
                          {(order.requestedDeliveryDate || order.estimatedDeliveryWindow) && (
                            <div className="p-2 bg-brand-blush/80 border border-brand-gold/40 text-[10px] space-y-0.5">
                              {order.requestedDeliveryDate && (
                                <p className="font-semibold text-brand-charcoal flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-brand-crimson shrink-0" />
                                  <span>Needed: {order.requestedDeliveryDate}</span>
                                </p>
                              )}
                              {order.estimatedDeliveryWindow && (
                                <p className="text-emerald-800 font-medium">
                                  Est. Delivery: {order.estimatedDeliveryWindow}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Craft Items & Customizations */}
                          <div className="space-y-2 pt-2 border-t border-brand-border">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-[11px] space-y-1">
                                <p className="font-medium text-brand-charcoal">
                                  {item.quantity}× {item.title}
                                </p>
                                {item.customization && (
                                  <div className="flex flex-wrap gap-1 text-[10px]">
                                    {item.customization.selectedRibbon && (
                                      <span className="px-1.5 py-0.5 bg-white border border-brand-border">
                                        🎀 {item.customization.selectedRibbon}
                                      </span>
                                    )}
                                    {item.customization.selectedTag && (
                                      <span className="px-1.5 py-0.5 bg-white border border-brand-border">
                                        🏷️ {item.customization.selectedTag}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Customer Uploaded Photos for Printing */}
                                {item.customization?.customerUploadedPhotos &&
                                  item.customization.customerUploadedPhotos.length > 0 && (
                                    <div className="pt-1">
                                      <p className="text-[10px] font-semibold text-brand-gold flex items-center gap-1 mb-1">
                                        <ImageIcon className="w-3 h-3" />
                                        Customer Print Photos:
                                      </p>
                                      <div className="flex gap-1.5 flex-wrap">
                                        {item.customization.customerUploadedPhotos.map(
                                          (photoUrl, pIdx) => (
                                            <a
                                              key={pIdx}
                                              href={photoUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="block w-10 h-10 border border-brand-gold overflow-hidden"
                                              title="Open full-res customer photo"
                                            >
                                              <img
                                                src={photoUrl}
                                                alt="Customer upload"
                                                className="w-full h-full object-cover"
                                              />
                                            </a>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>

                          {/* Wax Seal Upsell & Recipient Note */}
                          {order.addGiftCardUpsell && (
                            <div className="px-2 py-1 bg-brand-gold-light text-[10px] font-semibold text-brand-charcoal flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-brand-gold" />
                              Include Wax-Sealed Handwritten Card
                            </div>
                          )}

                          {order.giftMessage && (
                            <p className="p-2 bg-white border border-brand-border text-[11px] italic text-brand-muted">
                              &ldquo;{order.giftMessage}&rdquo;
                            </p>
                          )}

                          {/* Optional Tracking Code Input when PACKED */}
                          {order.fulfillmentStatus === 'PACKED' && (
                            <div className="pt-1">
                              <input
                                type="text"
                                value={trackingInputs[order._id] || ''}
                                onChange={(e) =>
                                  setTrackingInputs((prev) => ({
                                    ...prev,
                                    [order._id]: e.target.value,
                                  }))
                                }
                                placeholder="Courier AWB / Tracking # (optional)"
                                className="w-full text-[11px] py-1.5 px-2 border-brand-border bg-white"
                              />
                            </div>
                          )}

                          {order.trackingCode && (
                            <p className="text-[10px] font-mono text-blue-900 flex items-center gap-1">
                              <Truck className="w-3 h-3" /> AWB: {order.trackingCode}
                            </p>
                          )}

                          {/* Action Button */}
                          {nextStage ? (
                            <button
                              type="button"
                              disabled={updatingId === order._id}
                              onClick={() => advanceOrder(order, nextStage.next)}
                              className="w-full py-2 px-3 bg-brand-charcoal hover:bg-brand-crimson text-white text-[10px] font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                            >
                              <span>
                                {updatingId === order._id ? 'Updating...' : nextStage.label}
                              </span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <div className="py-1.5 text-center text-[11px] font-semibold text-emerald-800 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completed & Paid</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
