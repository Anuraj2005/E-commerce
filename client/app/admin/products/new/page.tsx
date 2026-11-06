'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, X, ArrowLeft, Sparkles, Plus, Palette } from 'lucide-react';
import { Category, Product, ProductBadge, ProductImage, SubCategoryName } from '@/types';
import { apiRequest } from '@/lib/api';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';
import { getRibbonSwatch } from '@/lib/format';

const SUBCATEGORIES: SubCategoryName[] = [
  'Gift Hampers',
  'Celebration Hampers',
  'Albums',
  'Bouquets',
  'A5 Frames',
  'Invitation Cards',
  'Event Décor',
];

const DEFAULT_RIBBON_PALETTE = ['Crimson Red', 'Blush Rose', 'Royal Gold', 'Ivory'];
const CUSTOM_RIBBON_STORAGE_KEY = 'af_custom_ribbon_palette_v1';
const BADGE_OPTIONS: ProductBadge[] = ['NEW', 'BESTSELLER', 'LIMITED'];

function slugify(val: string) {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminCreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('1999');
  const [stock, setStock] = useState('12');
  const [leadTimeDays, setLeadTimeDays] = useState('2');
  const [categoryId, setCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState<SubCategoryName>('Gift Hampers');

  const [images, setImages] = useState<ProductImage[]>([]);
  const [externalImageUrl, setExternalImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Customization settings & expandable ribbon color palette
  const [isCustomizable, setIsCustomizable] = useState(true);
  const [allowCustomTag, setAllowCustomTag] = useState(true);
  const [defaultTagsInput, setDefaultTagsInput] = useState(
    'Just for you, Happy Birthday, With Love, Congratulations'
  );
  const [ribbonPalette, setRibbonPalette] = useState<string[]>(DEFAULT_RIBBON_PALETTE);
  const [selectedRibbons, setSelectedRibbons] = useState<string[]>([
    'Crimson Red',
    'Blush Rose',
    'Royal Gold',
  ]);
  const [newRibbonName, setNewRibbonName] = useState('');
  const [newRibbonHex, setNewRibbonHex] = useState('#2E6F40');

  const [requiresPhotoUpload, setRequiresPhotoUpload] = useState(false);
  const [maxPhotosAllowed, setMaxPhotosAllowed] = useState('4');

  const [inclusionsInput, setInclusionsInput] = useState(
    'Handcrafted signature keepsake presentation box\nSatin ribbon bow & botanical wax seal\nComplimentary personalized greeting tag'
  );
  const [badges, setBadges] = useState<ProductBadge[]>(['NEW']);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ categories: Category[] }>('/categories')
      .then((res) => {
        setCategories(res.categories || []);
        if (res.categories?.[0]) {
          setCategoryId(res.categories[0]._id);
        }
      })
      .catch(() => null);

    // Load any custom satin ribbon colors previously created by Admin
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(
          window.localStorage.getItem(CUSTOM_RIBBON_STORAGE_KEY) || '[]'
        ) as string[];
        if (Array.isArray(stored) && stored.length > 0) {
          setRibbonPalette((prev) => Array.from(new Set([...prev, ...stored])));
        }
      } catch {
        // Ignore storage parse error
      }
    }
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleAddCustomRibbonColor = () => {
    const trimmedName = newRibbonName.trim();
    if (!trimmedName) return;

    const cleanName = trimmedName.replace(/\|/g, '');
    const customEntry = `${cleanName}|${newRibbonHex}`;

    // Avoid duplicate label
    const existingMatch = ribbonPalette.find(
      (item) => getRibbonSwatch(item).label.toLowerCase() === cleanName.toLowerCase()
    );

    if (existingMatch) {
      if (!selectedRibbons.includes(existingMatch)) {
        setSelectedRibbons((prev) => [...prev, existingMatch]);
      }
      setNewRibbonName('');
      return;
    }

    const updatedPalette = [...ribbonPalette, customEntry];
    setRibbonPalette(updatedPalette);
    setSelectedRibbons((prev) => [...prev, customEntry]);
    setNewRibbonName('');

    if (typeof window !== 'undefined') {
      const customOnly = updatedPalette.filter((c) => !DEFAULT_RIBBON_PALETTE.includes(c));
      window.localStorage.setItem(CUSTOM_RIBBON_STORAGE_KEY, JSON.stringify(customOnly));
    }
  };

  const handleRemoveCustomPaletteColor = (entry: string) => {
    const updatedPalette = ribbonPalette.filter((c) => c !== entry);
    setRibbonPalette(updatedPalette);
    setSelectedRibbons((prev) => prev.filter((c) => c !== entry));
    if (typeof window !== 'undefined') {
      const customOnly = updatedPalette.filter((c) => !DEFAULT_RIBBON_PALETTE.includes(c));
      window.localStorage.setItem(CUSTOM_RIBBON_STORAGE_KEY, JSON.stringify(customOnly));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    setError(null);
    try {
      const uploaded: ProductImage[] = [];
      for (const file of files) {
        const res = await uploadToCloudinary(file, 'artistic_fusion/products');
        uploaded.push({
          url: res.secure_url,
          public_id: res.public_id,
          isPrimary: images.length === 0 && uploaded.length === 0,
        });
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Direct Cloudinary upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddExternalUrl = () => {
    if (!externalImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        url: externalImageUrl.trim(),
        public_id: `artistic_fusion/products/ext_${Date.now()}`,
        isPrimary: prev.length === 0,
      },
    ]);
    setExternalImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError(
        'Please upload or attach at least 1 product image (upload 2 images to enable exterior-to-unboxed hover swap!).'
      );
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        title,
        slug: slug || slugify(title),
        description,
        price: Number(price),
        compareAtPrice: null,
        stock: Number(stock),
        leadTimeDays: Number(leadTimeDays),
        category: categoryId,
        subCategory,
        images: images.map((img, i) => ({ ...img, isPrimary: i === 0 })),
        inclusions: inclusionsInput
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
        isCustomizable,
        customizationOptions: {
          allowCustomTag,
          defaultTags: defaultTagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          ribbonColors: selectedRibbons,
          requiresPhotoUpload,
          maxPhotosAllowed: requiresPhotoUpload ? Number(maxPhotosAllowed) || 4 : 0,
        },
        badges,
        isActive: true,
      };

      await apiRequest<{ product: Product }>('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      router.push('/admin/products');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish product');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-charcoal mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
        <h1 className="font-serif uppercase tracking-widest text-2xl text-brand-charcoal">
          Product Creation Studio
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Images upload directly from your browser to Cloudinary CDN via signed tokens — zero
          multipart binary buffering on the Express server.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-xs text-brand-crimson font-medium">
            {error}
          </div>
        )}

        {/* Basic Details */}
        <div className="bg-white border border-brand-border p-6 space-y-4">
          <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal pb-2 border-b border-brand-border">
            1. Craft Identity & Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder='e.g. Wrapped "Just for You" Luxury Rose Hamper'
                className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                URL Slug
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setSlug(slugify(e.target.value));
                }}
                className="w-full text-xs font-mono bg-brand-surface border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Storefront Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Craft Subcategory *
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value as SubCategoryName)}
                className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              >
                {SUBCATEGORIES.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Selling Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Initial Stock Units *
              </label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Handcrafting Lead Time (Days)
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Artisanal Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the materials, keepsake presentation, ribbons, and gift contents..."
                className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Hamper Inclusions (One item per line)
              </label>
              <textarea
                rows={3}
                value={inclusionsInput}
                onChange={(e) => setInclusionsInput(e.target.value)}
                className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>
          </div>
        </div>

        {/* Direct Signed Cloudinary Upload Dropzone */}
        <div className="bg-white border border-brand-border p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal">
              2. Product Photography (4:5 Exterior + Unboxed Hover View)
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-brand-gold font-semibold">
              Signed Direct Cloudinary CDN
            </span>
          </div>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-gold/60 bg-brand-blush/50 py-8 px-4 cursor-pointer hover:bg-brand-blush transition-colors text-center">
            <UploadCloud className="w-8 h-8 text-brand-gold mb-2" />
            <span className="text-xs font-semibold text-brand-charcoal">
              {uploadingImage
                ? 'Uploading directly to Cloudinary CDN...'
                : 'Click to upload Exterior Wrapped Photo (1st) & Interior Unboxed Photo (2nd)'}
            </span>
            <span className="text-[11px] text-brand-muted mt-1">
              Auto-WebP optimized · Recommended 4:5 portrait ratio
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploadingImage}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Optional Direct Image URL Helper */}
          <div className="flex gap-2">
            <input
              type="url"
              value={externalImageUrl}
              onChange={(e) => setExternalImageUrl(e.target.value)}
              placeholder="Or paste an existing Cloudinary / Unsplash image URL..."
              className="flex-1 text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
            />
            <button
              type="button"
              onClick={handleAddExternalUrl}
              className="px-4 py-2 bg-brand-surface border border-brand-border text-xs font-semibold hover:border-brand-gold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add URL
            </button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((img, idx) => (
                <div
                  key={img.public_id + idx}
                  className="relative aspect-product border border-brand-border overflow-hidden bg-brand-surface"
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/75 text-white text-[10px] uppercase tracking-wider">
                    {idx === 0 ? 'Primary Cover' : idx === 1 ? 'Hover Flip View' : `Photo ${idx + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customization & Badges Configuration */}
        <div className="bg-white border border-brand-border p-6 space-y-5">
          <h2 className="font-serif uppercase tracking-widest text-sm font-semibold text-brand-charcoal pb-2 border-b border-brand-border">
            3. Craft Customization Engine & Badges
          </h2>

          <label className="flex items-center gap-2.5 text-xs font-semibold text-brand-charcoal cursor-pointer">
            <input
              type="checkbox"
              checked={isCustomizable}
              onChange={(e) => setIsCustomizable(e.target.checked)}
              className="rounded-xs text-brand-crimson focus:ring-brand-gold"
            />
            <span>Enable Ribbon & Keepsake Tag Personalization on PDP</span>
          </label>

          {isCustomizable && (
            <div className="pl-6 space-y-5 border-l-2 border-brand-gold/40">
              <label className="flex items-center gap-2.5 text-xs text-brand-charcoal cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCustomTag}
                  onChange={(e) => setAllowCustomTag(e.target.checked)}
                  className="rounded-xs text-brand-crimson focus:ring-brand-gold"
                />
                <span>Allow Gift Tag Selection & Custom Text Input</span>
              </label>

              {allowCustomTag && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                    Preset Tag Options (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={defaultTagsInput}
                    onChange={(e) => setDefaultTagsInput(e.target.value)}
                    className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                  />
                </div>
              )}

              {/* Available Satin Ribbon Colors + Custom Color Creator */}
              <div className="space-y-3">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal">
                  Available Satin Ribbon Colors ({selectedRibbons.length} selected)
                </label>

                <div className="flex flex-wrap gap-2">
                  {ribbonPalette.map((entry) => {
                    const swatch = getRibbonSwatch(entry);
                    const checked = selectedRibbons.includes(entry);
                    const isCustom = !DEFAULT_RIBBON_PALETTE.includes(entry);
                    return (
                      <div key={entry} className="inline-flex items-center">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRibbons((prev) =>
                              checked ? prev.filter((c) => c !== entry) : [...prev, entry]
                            )
                          }
                          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs border transition-colors ${
                            checked
                              ? 'bg-brand-charcoal text-white border-brand-charcoal'
                              : 'bg-white text-brand-charcoal border-brand-border hover:border-brand-gold'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border shrink-0"
                            style={{
                              backgroundColor: swatch.hex,
                              borderColor: checked ? '#FFFFFF' : swatch.border,
                            }}
                          />
                          <span>{swatch.label}</span>
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomPaletteColor(entry)}
                            title={`Remove ${swatch.label}`}
                            className="px-1.5 py-1.5 border border-l-0 border-brand-border bg-brand-surface text-brand-muted hover:text-brand-crimson text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add More Satin Ribbon Colors Input Row */}
                <div className="p-3.5 bg-brand-blush/70 border border-brand-gold/40 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Add New Satin Ribbon Color</span>
                  </p>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <input
                      type="color"
                      value={newRibbonHex}
                      onChange={(e) => setNewRibbonHex(e.target.value)}
                      title="Pick satin ribbon shade"
                      className="w-10 h-9 p-0.5 bg-white border border-brand-border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={newRibbonName}
                      onChange={(e) => setNewRibbonName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomRibbonColor();
                        }
                      }}
                      placeholder="Type color name (e.g. Emerald Green, Lavender, Champagne)..."
                      className="flex-1 text-xs bg-white border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomRibbonColor}
                      className="px-4 py-2 bg-brand-charcoal hover:bg-brand-crimson text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Color</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2.5 text-xs text-brand-charcoal cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={requiresPhotoUpload}
                    onChange={(e) => setRequiresPhotoUpload(e.target.checked)}
                    className="rounded-xs text-brand-crimson focus:ring-brand-gold"
                  />
                  <span>Require Customer Photo Uploads (for Albums / A5 Frames)</span>
                </label>

                {requiresPhotoUpload && (
                  <div className="flex items-center gap-2 text-xs">
                    <span>Max Photos:</span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={maxPhotosAllowed}
                      onChange={(e) => setMaxPhotosAllowed(e.target.value)}
                      className="w-16 text-xs py-1 border-brand-border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-brand-border">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-2">
              Promotional Card Badges
            </label>
            <div className="flex flex-wrap gap-2">
              {BADGE_OPTIONS.map((badge) => {
                const active = badges.includes(badge);
                return (
                  <button
                    key={badge}
                    type="button"
                    onClick={() =>
                      setBadges((prev) =>
                        active ? prev.filter((b) => b !== badge) : [...prev, badge]
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border ${
                      active
                        ? 'bg-brand-crimson text-white border-brand-crimson'
                        : 'bg-white text-brand-muted border-brand-border'
                    }`}
                  >
                    {badge}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="w-full py-4 bg-brand-charcoal hover:bg-brand-crimson text-white text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-40"
        >
          <Sparkles className="w-4 h-4" />
          <span>{submitting ? 'Publishing to Live Catalog...' : 'Publish Handcrafted Product'}</span>
        </button>
      </form>
    </div>
  );
}
