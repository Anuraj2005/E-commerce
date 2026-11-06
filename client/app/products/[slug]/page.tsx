'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  Heart,
  Zap,
  UploadCloud,
  X,
  Truck,
  ChevronDown,
  CheckCircle2,
  Play,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Product } from '@/types';
import { apiRequest } from '@/lib/api';
import { formatINR, getRibbonSwatch } from '@/lib/format';
import { estimateIndianPincodeDelivery, PincodeEstimateResult } from '@/lib/pincodeEstimator';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';
import { useCartStore } from '@/store/useCartStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = decodeURIComponent(params?.slug || '');

  const catalogProducts = useCatalogStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistIds = useCartStore((s) => s.wishlistIds);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);

  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Gallery state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [mediaTab, setMediaTab] = useState<'photos' | 'reel'>('photos');

  // Craft Customizer state
  const [tagMode, setTagMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetTag, setSelectedPresetTag] = useState('Just for you');
  const [customTagText, setCustomTagText] = useState('');
  const [selectedRibbonLabel, setSelectedRibbonLabel] = useState('Blush Rose');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Pincode estimator state
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState<PincodeEstimateResult | null>(null);

  // Accordions
  const [openAccordion, setOpenAccordion] = useState<string>('inclusions');

  // Prefer live Socket.io updated version from catalog store if present
  const liveMatch = useMemo(
    () => catalogProducts.find((p) => p.slug === slug),
    [catalogProducts, slug]
  );
  const product = liveMatch || fetchedProduct;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    apiRequest<{ product: Product; relatedProducts: Product[] }>(`/products/${slug}`)
      .then((data) => {
        if (!active) return;
        setFetchedProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);

        const firstTag =
          data.product.customizationOptions?.defaultTags?.[0] || 'Just for you';
        const firstRibbonRaw =
          data.product.customizationOptions?.ribbonColors?.[0] || 'Blush Rose';
        setSelectedPresetTag(firstTag);
        setSelectedRibbonLabel(getRibbonSwatch(firstRibbonRaw).label);
        setActiveImageIdx(0);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setNotFound(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 aspect-product bg-white animate-pulse border border-brand-border" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 bg-white animate-pulse w-3/4" />
            <div className="h-6 bg-white animate-pulse w-1/3" />
            <div className="h-40 bg-white animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-2xl uppercase tracking-widest text-brand-charcoal">
          Craft Creation Not Found
        </h1>
        <p className="text-xs text-brand-muted">
          This handmade item may have been archived or moved to another seasonal collection.
        </p>
        <Link
          href="/collections/all"
          className="inline-block px-7 py-3 bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest"
        >
          Browse All Hampers & Keepsakes
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(product._id);
  const isSoldOut = product.stock <= 0;
  const requiresPhotos = Boolean(product.customizationOptions?.requiresPhotoUpload);
  const maxPhotos = product.customizationOptions?.maxPhotosAllowed || 4;
  const presetTags = product.customizationOptions?.defaultTags?.length
    ? product.customizationOptions.defaultTags
    : ['Just for you', 'Happy Birthday', 'With Love', 'Congratulations'];
  const ribbonChoices = product.customizationOptions?.ribbonColors?.length
    ? product.customizationOptions.ribbonColors
    : ['Crimson Red', 'Blush Rose', 'Royal Gold', 'Ivory'];

  const topBadge = product.badges?.[0];

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxPhotos - uploadedPhotos.length;
    const slice = files.slice(0, remainingSlots);
    if (slice.length === 0) {
      setUploadError(`Maximum ${maxPhotos} photographs allowed for this craft.`);
      return;
    }

    setIsUploadingPhoto(true);
    setUploadError(null);
    try {
      const uploadedUrls: string[] = [];
      for (const file of slice) {
        const res = await uploadToCloudinary(file, 'artistic_fusion/customer_uploads');
        uploadedUrls.push(res.secure_url);
      }
      setUploadedPhotos((prev) => [...prev, ...uploadedUrls]);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const buildCustomization = () => ({
    selectedTag:
      tagMode === 'custom' && customTagText.trim()
        ? customTagText.trim()
        : selectedPresetTag,
    selectedRibbon: selectedRibbonLabel,
    customNote: '',
    customerUploadedPhotos: uploadedPhotos,
  });

  const handleAddToCart = (buyNow = false) => {
    if (isSoldOut) return;
    if (requiresPhotos && uploadedPhotos.length === 0) {
      setUploadError(
        'Please upload at least 1 photograph so our studio can print and mount your keepsake.'
      );
      return;
    }
    setUploadError(null);
    addItem(product, quantity, buildCustomization(), !buyNow);
    if (buyNow) {
      router.push('/checkout');
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const res = estimateIndianPincodeDelivery(pincodeInput, product.leadTimeDays || 2);
    setPincodeResult(res);
  };

  const categoryObj = typeof product.category === 'object' ? product.category : null;

  return (
    <div className="bg-brand-blush pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-brand-muted flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-brand-charcoal">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/collections/${categoryObj?.slug || 'all'}`}
          className="hover:text-brand-charcoal"
        >
          {categoryObj?.name || product.subCategory}
        </Link>
        <span>/</span>
        <span className="text-brand-charcoal font-medium truncate">{product.title}</span>
      </div>

      {/* Main 2-Column PDP Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Multi-Angle Gallery + Vertical Strip + Video/Reel Tab */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex border border-brand-border bg-white p-0.5 text-[11px] font-semibold uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => setMediaTab('photos')}
                  className={`px-3.5 py-1.5 transition-colors ${
                    mediaTab === 'photos'
                      ? 'bg-brand-charcoal text-white'
                      : 'text-brand-muted hover:text-brand-charcoal'
                  }`}
                >
                  Gallery ({product.images.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab('reel')}
                  className={`px-3.5 py-1.5 flex items-center gap-1.5 transition-colors ${
                    mediaTab === 'reel'
                      ? 'bg-brand-crimson text-white'
                      : 'text-brand-muted hover:text-brand-charcoal'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Craft Unboxing Look</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleWishlist(product._id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border text-xs font-medium text-brand-charcoal hover:border-brand-crimson"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'text-brand-crimson fill-brand-crimson' : 'text-brand-charcoal'
                  }`}
                />
                <span>{isWishlisted ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {mediaTab === 'photos' ? (
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                {/* Vertical Thumbnail Strip */}
                <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:w-20 shrink-0">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.public_id + idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-16 h-20 sm:w-20 sm:h-24 shrink-0 overflow-hidden border-2 transition-all ${
                        activeImageIdx === idx
                          ? 'border-brand-crimson shadow-sm'
                          : 'border-brand-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.title} angle ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Primary 4:5 Hero Frame */}
                <div className="relative flex-1 aspect-product bg-white border border-brand-border overflow-hidden">
                  <img
                    src={product.images[activeImageIdx]?.url || product.images[0]?.url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {topBadge && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-brand-crimson text-white text-[10px] font-semibold uppercase tracking-widest">
                      {topBadge}
                    </span>
                  )}
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-xs text-[11px] text-brand-charcoal border border-brand-border">
                    {activeImageIdx === 0 ? 'Exterior Ribbon View' : 'Unboxed Interior View'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative aspect-product bg-brand-charcoal border border-brand-border overflow-hidden flex flex-col items-center justify-center text-white p-8 text-center">
                <img
                  src={product.images[1]?.url || product.images[0]?.url}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
                />
                <div className="relative z-10 max-w-md space-y-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-crimson text-white text-[10px] uppercase tracking-widest font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> Studio Craft Preview
                  </span>
                  <h3 className="font-serif text-2xl">
                    Hand-Wrapped Ribbon & Wax Seal Presentation
                  </h3>
                  <p className="text-xs text-white/85 leading-relaxed">
                    Every {product.subCategory.toLowerCase()} piece is assembled on our craft table
                    with satin ribbons, protective tissue layers, and your personalized greeting tag
                    before cushioned dispatch.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMediaTab('photos')}
                    className="px-6 py-2.5 bg-white text-brand-charcoal text-xs font-semibold uppercase tracking-widest"
                  >
                    Back to High-Res Photos
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Information & Craft Customizer */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-brand-border p-6 md:p-7 space-y-6 lg:sticky lg:top-28">
              {/* Header, Ratings & Clean Price */}
              <div className="space-y-2.5 border-b border-brand-border pb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-widest text-brand-gold font-semibold">
                    {product.subCategory}
                  </span>
                  <div className="flex items-center gap-1 text-brand-charcoal">
                    <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                    <span className="font-semibold">{product.ratings?.average?.toFixed(1)}</span>
                    <span className="text-brand-muted">({product.ratings?.count} reviews)</span>
                  </div>
                </div>

                <h1 className="font-serif text-2xl md:text-[26px] text-brand-charcoal leading-snug">
                  {product.title}
                </h1>

                <div className="flex items-baseline pt-1">
                  <span className="font-sans font-bold text-2xl text-brand-charcoal">
                    {formatINR(product.price)}
                  </span>
                </div>
                <p className="text-[11px] text-brand-muted">
                  Inclusive of all taxes · Free Pan-India Express Delivery above ₹1,999
                </p>

                {/* Urgency / Lead-Time Indicator */}
                <div className="mt-3 p-3 bg-brand-blush border border-brand-gold/30 flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-2 text-brand-charcoal font-medium">
                    <Zap className="w-4 h-4 text-brand-gold fill-brand-gold shrink-0" />
                    <span>
                      Handcrafted to order — Current lead time: {product.leadTimeDays || 2}{' '}
                      business days
                    </span>
                  </span>
                  {!isSoldOut && product.stock <= 6 && (
                    <span className="text-[11px] font-semibold text-brand-crimson shrink-0">
                      {product.stock} left
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs md:text-sm text-brand-muted leading-relaxed">
                {product.description}
              </p>

              {/* Craft Customization Engine */}
              {product.isCustomizable && (
                <div className="space-y-5 pt-1">
                  {/* 1. Gift Tag Message Selector */}
                  {product.customizationOptions?.allowCustomTag && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                          1. Keepsake Gift Tag Message
                        </label>
                        <span className="text-[11px] text-brand-gold font-medium">Included Free</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {presetTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setTagMode('preset');
                              setSelectedPresetTag(tag);
                            }}
                            className={`px-3 py-1.5 text-xs border transition-all ${
                              tagMode === 'preset' && selectedPresetTag === tag
                                ? 'bg-brand-charcoal text-white border-brand-charcoal'
                                : 'bg-brand-surface text-brand-charcoal border-brand-border hover:border-brand-gold'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setTagMode('custom')}
                          className={`px-3 py-1.5 text-xs border transition-all ${
                            tagMode === 'custom'
                              ? 'bg-brand-crimson text-white border-brand-crimson'
                              : 'bg-brand-surface text-brand-charcoal border-brand-border hover:border-brand-gold'
                          }`}
                        >
                          + Custom Tag Text
                        </button>
                      </div>

                      {tagMode === 'custom' && (
                        <div className="mt-2.5">
                          <input
                            type="text"
                            maxLength={35}
                            value={customTagText}
                            onChange={(e) => setCustomTagText(e.target.value)}
                            placeholder="Type custom foil tag (max 35 chars, e.g. Happy Engagement!)"
                            className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
                          />
                          <p className="text-right text-[10px] text-brand-muted mt-1">
                            {customTagText.length}/35 characters
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Satin Ribbon Color Picker */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                        2. Satin Ribbon Color
                      </label>
                      <span className="text-xs font-medium text-brand-crimson">
                        {selectedRibbonLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {ribbonChoices.map((rawEntry) => {
                        const swatch = getRibbonSwatch(rawEntry);
                        const isSelected = selectedRibbonLabel === swatch.label;
                        return (
                          <button
                            key={rawEntry}
                            type="button"
                            onClick={() => setSelectedRibbonLabel(swatch.label)}
                            title={swatch.label}
                            className={`flex items-center gap-2 px-3 py-1.5 border text-xs transition-all ${
                              isSelected
                                ? 'border-brand-charcoal bg-brand-blush font-semibold shadow-2xs'
                                : 'border-brand-border bg-white hover:border-brand-gold'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border shrink-0"
                              style={{
                                backgroundColor: swatch.hex,
                                borderColor: swatch.border,
                              }}
                            />
                            <span>{swatch.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Conditional Direct Cloudinary Photo Uploader (Albums / A5 Frames) */}
                  {requiresPhotos && (
                    <div className="p-4 bg-brand-blush border border-brand-gold/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                          3. Upload Your Photographs ({uploadedPhotos.length}/{maxPhotos}) *
                        </label>
                        <span className="text-[10px] uppercase tracking-wider text-brand-gold font-semibold">
                          Direct Secure Upload
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-muted">
                        Our studio prints your photos on archival matte stock and mounts them inside
                        your {product.subCategory.toLowerCase()}.
                      </p>

                      {uploadedPhotos.length < maxPhotos && (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-gold/60 bg-white py-5 px-4 cursor-pointer hover:bg-brand-surface transition-colors text-center">
                          <UploadCloud className="w-6 h-6 text-brand-gold mb-1.5" />
                          <span className="text-xs font-medium text-brand-charcoal">
                            {isUploadingPhoto
                              ? 'Uploading high-res photo to studio...'
                              : 'Click to select photos from your phone or computer'}
                          </span>
                          <span className="text-[10px] text-brand-muted mt-0.5">
                            JPG, PNG, or WebP · Up to {maxPhotos} photos
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={isUploadingPhoto}
                            onChange={handlePhotoSelect}
                            className="hidden"
                          />
                        </label>
                      )}

                      {uploadedPhotos.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          {uploadedPhotos.map((url, i) => (
                            <div
                              key={url + i}
                              className="relative aspect-square border border-brand-border bg-white overflow-hidden"
                            >
                              <img
                                src={url}
                                alt={`Uploaded memory ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== i))
                                }
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {uploadError && (
                        <p className="text-xs text-brand-crimson font-medium">{uploadError}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Quantity & Primary Purchase CTAs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border border-brand-border bg-brand-surface h-12">
                    <button
                      type="button"
                      disabled={isSoldOut || quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3.5 h-full text-brand-charcoal hover:bg-brand-blush disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-sm font-semibold text-brand-charcoal">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isSoldOut || quantity >= product.stock}
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="px-3.5 h-full text-brand-charcoal hover:bg-brand-blush disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isSoldOut || isUploadingPhoto}
                    onClick={() => handleAddToCart(false)}
                    className="flex-1 h-12 bg-brand-charcoal hover:bg-brand-gold text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isSoldOut ? 'Currently Sold Out' : 'Add to Craft Bag'}</span>
                  </button>
                </div>

                {!isSoldOut && (
                  <button
                    type="button"
                    disabled={isUploadingPhoto}
                    onClick={() => handleAddToCart(true)}
                    className="w-full h-11 bg-brand-crimson hover:bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest transition-colors"
                  >
                    Buy It Now · Cash on Delivery Available
                  </button>
                )}
              </div>

              {/* Rule-Based Pincode Delivery Estimator */}
              <div className="p-4 bg-brand-surface border border-brand-border space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                  <Truck className="w-4 h-4 text-brand-gold" />
                  <span>Check Delivery & Handcrafting Timeline</span>
                </div>
                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit Indian PIN (e.g. 560038)"
                    className="flex-1 text-xs border-brand-border bg-white focus:border-brand-gold focus:ring-brand-gold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-gold transition-colors"
                  >
                    Check
                  </button>
                </form>
                {pincodeResult && (
                  <div
                    className={`text-xs pt-1 flex items-start gap-2 ${
                      pincodeResult.valid ? 'text-emerald-800' : 'text-brand-crimson'
                    }`}
                  >
                    {pincodeResult.valid && (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
                    )}
                    <div>
                      <p className="font-medium">{pincodeResult.message}</p>
                      {pincodeResult.valid && (
                        <p className="text-[11px] text-brand-muted mt-0.5">
                          {pincodeResult.zoneLabel} · Cash on Delivery & Express Cushion Box eligible
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Detail Accordions */}
              <div className="divide-y divide-brand-border border-t border-b border-brand-border">
                {/* 1. Hamper Inclusions & Contents */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion((cur) => (cur === 'inclusions' ? '' : 'inclusions'))
                    }
                    className="w-full py-3.5 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-brand-charcoal"
                  >
                    <span>Hamper Inclusions & Contents</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openAccordion === 'inclusions' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'inclusions' && (
                    <ul className="pb-4 space-y-1.5 text-xs text-brand-muted list-disc pl-5">
                      {(product.inclusions || []).map((inc, idx) => (
                        <li key={idx}>{inc}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 2. Dimensions & Care Instructions */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion((cur) => (cur === 'dimensions' ? '' : 'dimensions'))
                    }
                    className="w-full py-3.5 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-brand-charcoal"
                  >
                    <span>Dimensions & Care Instructions</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openAccordion === 'dimensions' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'dimensions' && (
                    <div className="pb-4 space-y-2 text-xs text-brand-muted leading-relaxed">
                      <p>
                        <strong className="text-brand-charcoal">Dimensions:</strong>{' '}
                        {product.dimensions ||
                          '28 cm × 24 cm × 12 cm · Protective multi-layer transit cushioning'}
                      </p>
                      <p>
                        <strong className="text-brand-charcoal">Studio Care:</strong>{' '}
                        {product.careInstructions ||
                          'Keep away from direct moisture and harsh sunlight. Wipe gently with a soft dry cloth.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Shipping & Damage-Free Guarantee */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion((cur) => (cur === 'shipping' ? '' : 'shipping'))
                    }
                    className="w-full py-3.5 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-brand-charcoal"
                  >
                    <span>Shipping & Damage-Free Guarantee</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openAccordion === 'shipping' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'shipping' && (
                    <p className="pb-4 text-xs text-brand-muted leading-relaxed">
                      Every Artistic Fusion creation is packed inside a 5-ply corrugated outer
                      carton with honeycomb bubble wrap so satin bows, frames, and keepsake corners
                      arrive pristine. Complimentary replacement if transit damage occurs.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Creations */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-brand-border">
            <h2 className="font-serif uppercase tracking-widest text-brand-charcoal text-xl md:text-2xl text-center mb-8">
              Complete the Celebration
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel._id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
