'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  PlusCircle,
  Search,
  Minus,
  Plus,
  Check,
  ExternalLink,
  Palette,
  X,
} from 'lucide-react';
import { Product, ProductBadge } from '@/types';
import { apiRequest } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { formatINR, getRibbonSwatch } from '@/lib/format';

const ALL_BADGES: ProductBadge[] = ['NEW', 'BESTSELLER', 'LIMITED'];
const DEFAULT_RIBBON_PALETTE = ['Crimson Red', 'Blush Rose', 'Royal Gold', 'Ivory'];
const CUSTOM_RIBBON_STORAGE_KEY = 'af_custom_ribbon_palette_v1';

const columnHelper = createColumnHelper<Product>();

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [flashSavedId, setFlashSavedId] = useState<string | null>(null);

  // Modal state to edit / add Satin Ribbon Colors on any existing product
  const [editingRibbonProduct, setEditingRibbonProduct] = useState<Product | null>(null);
  const [modalPalette, setModalPalette] = useState<string[]>(DEFAULT_RIBBON_PALETTE);
  const [modalSelectedRibbons, setModalSelectedRibbons] = useState<string[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2E6F40');

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await apiRequest<{ products: Product[] }>(
        '/products?limit=100&includeInactive=true'
      );
      setProducts(res.products || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
    const socket = getSocket();
    const onProductUpdated = (payload: { product: Product }) => {
      if (!payload?.product) return;
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p._id === payload.product._id);
        if (idx === -1) return [payload.product, ...prev];
        const next = [...prev];
        next[idx] = payload.product;
        return next;
      });
    };
    socket.on('product:updated', onProductUpdated);
    return () => {
      socket.off('product:updated', onProductUpdated);
    };
  }, [fetchCatalog]);

  const patchProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setSavingId(id);
    try {
      const res = await apiRequest<{ product: Product }>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setProducts((prev) => prev.map((p) => (p._id === id ? res.product : p)));
      setFlashSavedId(id);
      setTimeout(() => {
        setFlashSavedId((cur) => (cur === id ? null : cur));
      }, 1400);
    } finally {
      setSavingId(null);
    }
  }, []);

  const openRibbonModal = useCallback((prod: Product) => {
    let savedCustom: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        savedCustom = JSON.parse(
          window.localStorage.getItem(CUSTOM_RIBBON_STORAGE_KEY) || '[]'
        );
      } catch {
        savedCustom = [];
      }
    }
    const existingRibbons = prod.customizationOptions?.ribbonColors || [];
    const combined = Array.from(
      new Set([...DEFAULT_RIBBON_PALETTE, ...savedCustom, ...existingRibbons])
    );
    setModalPalette(combined);
    setModalSelectedRibbons(existingRibbons);
    setNewColorName('');
    setEditingRibbonProduct(prod);
  }, []);

  const handleAddModalRibbonColor = () => {
    const cleanName = newColorName.trim().replace(/\|/g, '');
    if (!cleanName) return;

    const existing = modalPalette.find(
      (c) => getRibbonSwatch(c).label.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) {
      if (!modalSelectedRibbons.includes(existing)) {
        setModalSelectedRibbons((prev) => [...prev, existing]);
      }
      setNewColorName('');
      return;
    }

    const entry = `${cleanName}|${newColorHex}`;
    const nextPalette = [...modalPalette, entry];
    setModalPalette(nextPalette);
    setModalSelectedRibbons((prev) => [...prev, entry]);
    setNewColorName('');

    if (typeof window !== 'undefined') {
      const customOnly = nextPalette.filter((c) => !DEFAULT_RIBBON_PALETTE.includes(c));
      window.localStorage.setItem(CUSTOM_RIBBON_STORAGE_KEY, JSON.stringify(customOnly));
    }
  };

  const saveModalRibbonColors = async () => {
    if (!editingRibbonProduct) return;
    await patchProduct(editingRibbonProduct._id, {
      isCustomizable: true,
      customizationOptions: {
        ...editingRibbonProduct.customizationOptions,
        ribbonColors: modalSelectedRibbons,
      },
    });
    setEditingRibbonProduct(null);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Handcrafted Creation',
        cell: (info) => {
          const prod = info.row.original;
          return (
            <div className="flex items-center gap-3 min-w-[230px]">
              <img
                src={prod.images?.[0]?.url}
                alt={prod.title}
                className="w-11 h-14 object-cover border border-brand-border shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-xs text-brand-charcoal truncate max-w-[190px]">
                    {prod.title}
                  </p>
                  <Link
                    href={`/products/${prod.slug}`}
                    target="_blank"
                    className="text-brand-muted hover:text-brand-crimson"
                    title="Open on storefront"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-[11px] text-brand-muted">{prod.subCategory}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: 'Price (INR)',
        cell: (info) => {
          const prod = info.row.original;
          return (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                defaultValue={prod.price}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val) && val !== prod.price) {
                    patchProduct(prod._id, { price: val });
                  }
                }}
                className="w-24 text-xs py-1 px-2 border-brand-border focus:border-brand-gold focus:ring-brand-gold font-semibold"
              />
              <span className="text-[11px] text-brand-muted hidden xl:inline">
                ({formatINR(prod.price)})
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('stock', {
        header: 'Live Stock',
        cell: (info) => {
          const prod = info.row.original;
          return (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={savingId === prod._id || prod.stock <= 0}
                onClick={() => patchProduct(prod._id, { stock: Math.max(0, prod.stock - 1) })}
                className="p-1.5 border border-brand-border bg-brand-surface hover:bg-brand-blush disabled:opacity-35"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span
                className={`min-w-[38px] text-center text-xs font-bold py-1 px-2 ${
                  prod.stock === 0
                    ? 'bg-red-100 text-brand-crimson'
                    : prod.stock <= 4
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                {prod.stock}
              </span>
              <button
                type="button"
                disabled={savingId === prod._id}
                onClick={() => patchProduct(prod._id, { stock: prod.stock + 1 })}
                className="p-1.5 border border-brand-border bg-brand-surface hover:bg-brand-blush disabled:opacity-35"
              >
                <Plus className="w-3 h-3" />
              </button>
              {flashSavedId === prod._id && (
                <span className="text-[10px] text-emerald-700 flex items-center gap-0.5 font-semibold">
                  <Check className="w-3 h-3" /> Synced
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'ribbons',
        header: 'Satin Ribbons',
        cell: (info) => {
          const prod = info.row.original;
          const colors = prod.customizationOptions?.ribbonColors || [];
          return (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {colors.slice(0, 5).map((raw, i) => {
                  const sw = getRibbonSwatch(raw);
                  return (
                    <span
                      key={raw + i}
                      title={sw.label}
                      className="w-4 h-4 rounded-full border border-white ring-1 ring-brand-border"
                      style={{ backgroundColor: sw.hex }}
                    />
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => openRibbonModal(prod)}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-brand-blush hover:bg-brand-petal border border-brand-border text-brand-charcoal transition-colors"
              >
                <Palette className="w-3 h-3 text-brand-gold" />
                <span>+ Colors ({colors.length})</span>
              </button>
            </div>
          );
        },
      }),
      columnHelper.accessor('badges', {
        header: 'Badges',
        cell: (info) => {
          const prod = info.row.original;
          const currentBadges = prod.badges || [];
          return (
            <div className="flex flex-wrap gap-1 max-w-[180px]">
              {ALL_BADGES.map((badge) => {
                const active = currentBadges.includes(badge);
                return (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? currentBadges.filter((b) => b !== badge)
                        : [...currentBadges, badge];
                      patchProduct(prod._id, { badges: next });
                    }}
                    className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border transition-colors ${
                      active
                        ? 'bg-brand-charcoal text-white border-brand-charcoal'
                        : 'bg-white text-brand-muted border-brand-border hover:border-brand-gold'
                    }`}
                  >
                    {badge}
                  </button>
                );
              })}
            </div>
          );
        },
      }),
      columnHelper.accessor('isActive', {
        header: 'Visibility',
        cell: (info) => {
          const prod = info.row.original;
          return (
            <button
              type="button"
              onClick={() => patchProduct(prod._id, { isActive: !prod.isActive })}
              className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                prod.isActive
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              {prod.isActive ? 'Active' : 'Hidden'}
            </button>
          );
        },
      }),
    ],
    [patchProduct, savingId, flashSavedId, openRibbonModal]
  );

  const table = useReactTable({
    data: products,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold">
            Catalog & Live Stock Engine
          </p>
          <h1 className="font-serif uppercase tracking-widest text-2xl text-brand-charcoal mt-0.5">
            Product Catalog Manager ({products.length})
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Adjusting stock, price, or satin ribbon colors below broadcasts via Socket.io to all
            open storefront visitors immediately.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-crimson hover:bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Product</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-brand-border p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-brand-gold shrink-0" />
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filter catalog by title, subcategory, or price..."
          className="w-full text-xs border-0 focus:ring-0 p-0 text-brand-charcoal"
        />
      </div>

      {/* TanStack Data Table */}
      <div className="bg-white border border-brand-border overflow-hidden">
        {loading ? (
          <div className="h-64 animate-pulse bg-brand-surface" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-blush border-b border-brand-border text-[11px] uppercase tracking-wider text-brand-charcoal">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3.5 font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-brand-border">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-brand-surface/70">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="px-4 py-3 border-t border-brand-border bg-brand-surface flex items-center justify-between text-xs">
          <span className="text-brand-muted">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {Math.max(1, table.getPageCount())}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 bg-white border border-brand-border disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 bg-white border border-brand-border disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Ribbon Colors Editor Modal for Existing Products */}
      {editingRibbonProduct && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg border border-brand-border shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-brand-border pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-brand-gold font-semibold">
                  Manage Satin Ribbon Options
                </p>
                <h3 className="font-serif text-lg text-brand-charcoal">
                  {editingRibbonProduct.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRibbonProduct(null)}
                className="p-1 text-brand-muted hover:text-brand-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                Select Active Ribbon Colors ({modalSelectedRibbons.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {modalPalette.map((entry) => {
                  const sw = getRibbonSwatch(entry);
                  const active = modalSelectedRibbons.includes(entry);
                  return (
                    <button
                      key={entry}
                      type="button"
                      onClick={() =>
                        setModalSelectedRibbons((prev) =>
                          active ? prev.filter((c) => c !== entry) : [...prev, entry]
                        )
                      }
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs border transition-colors ${
                        active
                          ? 'bg-brand-charcoal text-white border-brand-charcoal'
                          : 'bg-white text-brand-charcoal border-brand-border hover:border-brand-gold'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border shrink-0"
                        style={{
                          backgroundColor: sw.hex,
                          borderColor: active ? '#FFFFFF' : sw.border,
                        }}
                      />
                      <span>{sw.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add More Custom Color */}
            <div className="p-3.5 bg-brand-blush border border-brand-gold/40 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal">
                + Add More Satin Ribbon Colors
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-10 h-9 p-0.5 bg-white border border-brand-border cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddModalRibbonColor();
                    }
                  }}
                  placeholder="e.g. Emerald Green, Lavender, Champagne..."
                  className="flex-1 text-xs bg-white border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                />
                <button
                  type="button"
                  onClick={handleAddModalRibbonColor}
                  className="px-3.5 py-2 bg-brand-charcoal hover:bg-brand-crimson text-white text-xs font-semibold uppercase tracking-wider shrink-0"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-brand-border">
              <button
                type="button"
                onClick={() => setEditingRibbonProduct(null)}
                className="px-4 py-2.5 border border-brand-border text-xs font-semibold uppercase tracking-wider text-brand-muted hover:text-brand-charcoal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveModalRibbonColors}
                className="px-6 py-2.5 bg-brand-crimson hover:bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Save Ribbon Colors
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
