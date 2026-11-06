'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  ShoppingBag,
  Scissors,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AdminStats } from '@/types';
import { apiRequest } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { formatINR } from '@/lib/format';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await apiRequest<{ stats: AdminStats }>('/admin/stats');
      setStats(res.stats);
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();

    const socket = getSocket();
    const refresh = () => loadStats();

    socket.on('order:created', refresh);
    socket.on('order:updated', refresh);
    socket.on('product:updated', refresh);

    return () => {
      socket.off('order:created', refresh);
      socket.off('order:updated', refresh);
      socket.off('product:updated', refresh);
    };
  }, [loadStats]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white border border-brand-border animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-white border border-brand-border animate-pulse" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold">
            Real-Time Studio Telemetry
          </p>
          <h1 className="font-serif uppercase tracking-widest text-2xl text-brand-charcoal mt-0.5">
            Live Metrics Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Socket.io Live Sync Active
          </span>
          <button
            type="button"
            onClick={loadStats}
            className="p-2 bg-white border border-brand-border text-brand-charcoal hover:border-brand-gold"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-brand-border p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-brand-muted">
            <span className="uppercase tracking-wider font-semibold">Total Studio Revenue</span>
            <IndianRupee className="w-4 h-4 text-brand-gold" />
          </div>
          <p className="text-2xl font-bold text-brand-charcoal">{formatINR(stats.totalRevenue)}</p>
          <p className="text-[11px] text-emerald-700 font-medium">
            Today: {formatINR(stats.todayRevenue)}
          </p>
        </div>

        <div className="bg-white border border-brand-border p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-brand-muted">
            <span className="uppercase tracking-wider font-semibold">Active Orders</span>
            <ShoppingBag className="w-4 h-4 text-brand-crimson" />
          </div>
          <p className="text-2xl font-bold text-brand-charcoal">{stats.totalOrders}</p>
          <p className="text-[11px] text-brand-muted">
            {stats.todayOrdersCount} placed today
          </p>
        </div>

        <div className="bg-white border border-brand-border p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-brand-muted">
            <span className="uppercase tracking-wider font-semibold">Handcrafting Queue</span>
            <Scissors className="w-4 h-4 text-brand-gold" />
          </div>
          <p className="text-2xl font-bold text-brand-crimson">
            {stats.pendingHandcraftingCount}
          </p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-charcoal hover:text-brand-crimson"
          >
            <span>Open Kanban Board</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-brand-border p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-brand-muted">
            <span className="uppercase tracking-wider font-semibold">Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700">{stats.lowStockCount}</p>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-charcoal hover:text-brand-crimson"
          >
            <span>Restock Inventory</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Charts & Low Stock Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-brand-border p-6">
          <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal mb-5">
            Live Inventory Units by Subcategory
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="stock" fill="#C5A059" radius={[2, 2, 0, 0]} name="Available Units" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Action Table */}
        <div className="lg:col-span-5 bg-white border border-brand-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal">
                Low Stock Crafts (≤ 5 Units)
              </h2>
              <Link
                href="/admin/products"
                className="text-xs text-brand-crimson font-semibold hover:underline"
              >
                Edit Stock →
              </Link>
            </div>

            {stats.lowStockProducts.length === 0 ? (
              <p className="text-xs text-emerald-700 py-8 text-center">
                All handcrafted items are well stocked!
              </p>
            ) : (
              <div className="divide-y divide-brand-border">
                {stats.lowStockProducts.map((prod) => (
                  <div key={prod._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.images?.[0]?.url}
                        alt={prod.title}
                        className="w-10 h-12 object-cover border border-brand-border shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-brand-charcoal truncate">
                          {prod.title}
                        </p>
                        <p className="text-[11px] text-brand-muted">{prod.subCategory}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold shrink-0 ${
                        prod.stock === 0
                          ? 'bg-red-100 text-brand-crimson'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {prod.stock === 0 ? 'SOLD OUT' : `${prod.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin/products/new"
            className="mt-5 block w-full py-3 bg-brand-charcoal hover:bg-brand-gold text-white text-center text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            + Launch New Handcrafted Product
          </Link>
        </div>
      </div>

      {/* Recent Orders Queue */}
      <div className="bg-white border border-brand-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal">
            Recent Incoming Craft Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-brand-crimson hover:underline"
          >
            Manage All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-[11px] uppercase tracking-wider text-brand-muted">
                <th className="py-3 pr-4">Order #</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Items & Customizations</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-brand-blush/40">
                  <td className="py-3.5 pr-4 font-bold text-brand-charcoal">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className="font-medium text-brand-charcoal">{order.customer.name}</p>
                    <p className="text-[11px] text-brand-muted">
                      {order.shippingAddress.city} ({order.shippingAddress.pincode})
                    </p>
                  </td>
                  <td className="py-3.5 pr-4 max-w-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="truncate text-brand-charcoal">
                        {item.quantity}× {item.title}{' '}
                        {item.customization?.selectedRibbon && (
                          <span className="text-brand-gold">
                            [{item.customization.selectedRibbon}]
                          </span>
                        )}
                      </div>
                    ))}
                  </td>
                  <td className="py-3.5 pr-4 font-bold text-brand-charcoal">
                    {formatINR(order.pricing.total)}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="text-[11px] font-medium">
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 bg-brand-blush border border-brand-gold/40 text-[10px] font-semibold uppercase tracking-wider text-brand-crimson">
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
