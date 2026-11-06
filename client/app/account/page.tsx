'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { apiRequest } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { Order } from '@/types';

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const logout = useAuthStore((s) => s.logout);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    apiRequest<{ orders: Order[] }>('/orders/my-orders')
      .then((res) => setOrders(res.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (initialized && !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif uppercase tracking-widest text-2xl text-brand-charcoal">
          My Artistic Fusion Account
        </h1>
        <p className="text-xs text-brand-muted">
          Sign in to track your handcrafted hampers, view customized photos, and manage saved
          addresses.
        </p>
        <button
          type="button"
          onClick={openAuthModal}
          className="px-8 py-3.5 bg-brand-charcoal text-white hover:bg-brand-gold text-xs font-semibold uppercase tracking-widest"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
      <div className="bg-white border border-brand-border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-gold font-semibold">
            Customer Profile
          </p>
          <h1 className="font-serif text-2xl text-brand-charcoal mt-0.5">{user?.name}</h1>
          <p className="text-xs text-brand-muted">{user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {user && ['admin', 'staff'].includes(user.role) && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-crimson text-white text-xs font-semibold uppercase tracking-wider"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Admin Portal</span>
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-brand-border text-xs font-semibold uppercase tracking-wider text-brand-charcoal hover:border-brand-crimson"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <h2 className="font-serif uppercase tracking-widest text-lg text-brand-charcoal flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-gold" />
          <span>My Handcrafted Orders ({orders.length})</span>
        </h2>

        {loading ? (
          <div className="h-40 bg-white border border-brand-border animate-pulse" />
        ) : orders.length === 0 ? (
          <div className="bg-white border border-brand-border p-10 text-center space-y-3">
            <p className="font-serif text-lg text-brand-charcoal">
              You haven&apos;t placed an order yet
            </p>
            <Link
              href="/collections/all"
              className="inline-block px-6 py-3 bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest"
            >
              Explore Hampers & Keepsakes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-brand-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-brand-charcoal">
                      {order.orderNumber}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-brand-blush border border-brand-gold/40 text-brand-crimson">
                      {order.fulfillmentStatus}
                    </span>
                    <span className="text-xs text-brand-muted">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted">
                    {order.items.map((i) => `${i.title} (×${i.quantity})`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5">
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-charcoal">
                      {formatINR(order.pricing.total)}
                    </p>
                    <p className="text-[11px] text-brand-muted">
                      {order.paymentMethod} · {order.paymentStatus}
                    </p>
                  </div>
                  <Link
                    href={`/order-success/${order.orderNumber}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-charcoal hover:bg-brand-gold text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    <span>Track Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
