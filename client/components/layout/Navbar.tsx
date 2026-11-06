'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Heart,
  User as UserIcon,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  LogOut,
  Package,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import { formatINR } from '@/lib/format';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const items = useCartStore((s) => s.items);
  const wishlistIds = useCartStore((s) => s.wishlistIds);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const addItem = useCartStore((s) => s.addItem);

  const user = useAuthStore((s) => s.user);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const logout = useAuthStore((s) => s.logout);

  const products = useCatalogStore((s) => s.products);

  const cartCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 4);
    return products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [products, searchQuery]);

  const wishlistedProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p._id)),
    [products, wishlistIds]
  );

  return (
    <>
      <header className="relative bg-brand-canvas/95 backdrop-blur-md border-b border-brand-border">
        {/* Top Row: Left Quick Search / Mobile Menu | Center Brand Crest | Right Utility Icons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 md:h-[68px] gap-3 sm:gap-6">
            {/* Left Cell: Hamburger (Mobile) & Quick Search Pill (Desktop) */}
            <div className="flex items-center justify-start min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="md:hidden p-2 -ml-2 text-brand-charcoal hover:text-brand-gold transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search crafts"
                className="hidden md:inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-brand-border bg-brand-surface/80 hover:border-brand-gold text-xs text-brand-muted hover:text-brand-charcoal transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span className="whitespace-nowrap">
                  Search <span className="hidden lg:inline">hampers, albums...</span>
                </span>
              </button>
            </div>

            {/* Center Cell: Unobstructed Symmetrical Brand Identity */}
            <div className="flex flex-col items-center justify-center text-center shrink-0">
              <Link href="/" className="group flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="hidden sm:inline-flex w-6 h-6 md:w-7 md:h-7 rounded-full bg-brand-blush border border-brand-gold/60 items-center justify-center text-brand-gold shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-serif text-base sm:text-xl md:text-2xl lg:text-[25px] tracking-[0.18em] text-brand-charcoal uppercase font-medium leading-none whitespace-nowrap">
                    Artistic Fusion
                  </span>
                </div>
                <span className="font-serif italic text-[10px] sm:text-xs text-brand-gold mt-1 leading-none whitespace-nowrap">
                  something handmade is so much more beautiful
                </span>
              </Link>
            </div>

            {/* Right Cell: Utility Icons */}
            <div className="flex items-center justify-end gap-1 sm:gap-3 min-w-0">
              {/* Mobile Search Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search crafts"
                className="md:hidden p-2 text-brand-charcoal hover:text-brand-gold transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Trigger */}
              <button
                type="button"
                onClick={() => setWishlistOpen(true)}
                aria-label="Saved wishlist"
                className="relative p-2 text-brand-charcoal hover:text-brand-crimson transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-brand-petal text-brand-charcoal text-[10px] font-bold flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </button>

              {/* User Account Dropdown / Auth Trigger */}
              <div className="relative hidden sm:block">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen((o) => !o)}
                      className="flex items-center gap-1.5 p-2 text-brand-charcoal hover:text-brand-gold transition-colors"
                    >
                      <span className="w-7 h-7 rounded-full bg-brand-gold-light border border-brand-gold/40 text-brand-charcoal text-xs font-semibold flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </button>
                    {userDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-border shadow-xl rounded-sm py-2.5 z-50 text-xs">
                          <div className="px-4 py-2 border-b border-brand-border">
                            <p className="font-semibold text-brand-charcoal truncate">
                              {user.name}
                            </p>
                            <p className="text-brand-muted truncate text-[11px]">{user.email}</p>
                          </div>
                          {['admin', 'staff'].includes(user.role) && (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-brand-crimson font-semibold hover:bg-brand-blush transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              <span>Admin Craft Studio</span>
                            </Link>
                          )}
                          <Link
                            href="/account"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-brand-charcoal hover:bg-brand-blush transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            <span>My Orders & Profile</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-brand-muted hover:text-brand-crimson hover:bg-brand-blush transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={openAuthModal}
                    aria-label="Sign in"
                    className="p-2 text-brand-charcoal hover:text-brand-gold transition-colors"
                  >
                    <UserIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openDrawer}
                aria-label="Open shopping bag"
                className="relative p-2 text-brand-charcoal hover:text-brand-gold transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-crimson text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Category Navigation Bar (Centered, Single-Line, Never Overlaps Brand) */}
        <div className="hidden md:block border-t border-brand-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Primary categories"
              className="flex items-center justify-center gap-6 lg:gap-10 h-11 text-[11px] lg:text-xs font-medium uppercase tracking-[0.16em] text-brand-charcoal"
            >
              <Link
                href="/collections/all?badge=NEW"
                className="relative inline-flex items-center gap-1.5 h-full whitespace-nowrap leading-none hover:text-brand-crimson transition-colors"
              >
                <span>New In</span>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-crimson opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-crimson" />
                </span>
              </Link>

              {/* Hampers Dropdown */}
              <div className="relative group h-full flex items-center">
                <Link
                  href="/collections/hampers"
                  className={`inline-flex items-center gap-1 h-full whitespace-nowrap leading-none hover:text-brand-gold transition-colors ${
                    pathname?.includes('/hampers') ? 'text-brand-crimson font-semibold' : ''
                  }`}
                >
                  <span>Hampers</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform shrink-0" />
                </Link>
                <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 absolute left-1/2 -translate-x-1/2 top-full pt-1 w-56 z-50">
                  <div className="bg-white border border-brand-border shadow-xl rounded-sm py-2.5 px-4 space-y-2 text-[11px] tracking-wider">
                    <Link
                      href="/collections/celebration-hampers"
                      className="block py-1.5 whitespace-nowrap hover:text-brand-crimson transition-colors"
                    >
                      Celebration Hampers
                    </Link>
                    <Link
                      href="/collections/hampers"
                      className="block py-1.5 whitespace-nowrap hover:text-brand-crimson transition-colors"
                    >
                      Curated Gift Boxes
                    </Link>
                    <Link
                      href="/collections/all?badge=BESTSELLER"
                      className="block py-1.5 whitespace-nowrap hover:text-brand-crimson transition-colors"
                    >
                      Festive & Bestseller Sets
                    </Link>
                  </div>
                </div>
              </div>

              {/* Keepsakes Dropdown */}
              <div className="relative group h-full flex items-center">
                <Link
                  href="/collections/albums"
                  className={`inline-flex items-center gap-1 h-full whitespace-nowrap leading-none hover:text-brand-gold transition-colors ${
                    pathname === '/collections/albums' || pathname === '/collections/a5-frames'
                      ? 'text-brand-crimson font-semibold'
                      : ''
                  }`}
                >
                  <span>Keepsakes</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform shrink-0" />
                </Link>
                <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 absolute left-1/2 -translate-x-1/2 top-full pt-1 w-52 z-50">
                  <div className="bg-white border border-brand-border shadow-xl rounded-sm py-2.5 px-4 space-y-2 text-[11px] tracking-wider">
                    <Link
                      href="/collections/albums"
                      className="block py-1.5 whitespace-nowrap hover:text-brand-crimson transition-colors"
                    >
                      Handcrafted Albums
                    </Link>
                    <Link
                      href="/collections/a5-frames"
                      className="block py-1.5 whitespace-nowrap hover:text-brand-crimson transition-colors"
                    >
                      A5 Custom Frames
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/collections/bouquets"
                className={`inline-flex items-center h-full whitespace-nowrap leading-none hover:text-brand-gold transition-colors ${
                  pathname === '/collections/bouquets' ? 'text-brand-crimson font-semibold' : ''
                }`}
              >
                Bouquets
              </Link>

              {/* Occasions Dropdown */}
              <div className="relative group h-full flex items-center">
                <Link
                  href="/collections/event-decor"
                  className={`inline-flex items-center gap-1 h-full whitespace-nowrap leading-none hover:text-brand-gold transition-colors ${
                    pathname === '/collections/event-decor' ||
                    pathname === '/collections/invitation-cards'
                      ? 'text-brand-crimson font-semibold'
                      : ''
                  }`}
                >
                  <span>Occasions</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform shrink-0" />
                </Link>
                <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 absolute left-1/2 -translate-x-1/2 top-full pt-1 w-52 z-50">
                  <div className="bg-white border border-brand-border shadow-xl rounded-sm py-2.5 px-4 space-y-2 text-[11px] tracking-wider">
                    <Link
                      href="/collections/event-decor"
                      className="block py-1.5 whitespace-nowrap hover:text-brand-crimson transition-colors"
                    >
                      Event Décor
                    </Link>
                    <Link
                      href="/collections/invitation-cards"
                      className="block py-1.5 whitespace-nowrap hover:text-brand-crimson transition-colors"
                    >
                      Invitation Cards
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/collections/all"
                className={`inline-flex items-center h-full whitespace-nowrap leading-none hover:text-brand-gold transition-colors ${
                  pathname === '/collections/all' ? 'text-brand-crimson font-semibold' : ''
                }`}
              >
                All Crafts
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-brand-canvas h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border bg-brand-blush">
                <div>
                  <p className="font-serif uppercase tracking-widest text-base text-brand-charcoal">
                    Artistic Fusion
                  </p>
                  <p className="font-serif italic text-xs text-brand-gold">
                    handmade luxury gifts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-brand-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-brand-border px-5 py-2 text-xs font-medium uppercase tracking-widest">
                <Link
                  href="/collections/all?badge=NEW"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3.5 text-brand-crimson font-semibold"
                >
                  <span>New Arrivals</span>
                  <span className="text-[10px] bg-brand-petal text-brand-charcoal px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                </Link>
                <Link
                  href="/collections/celebration-hampers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5"
                >
                  Celebration Hampers
                </Link>
                <Link
                  href="/collections/hampers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5"
                >
                  Curated Gift Hampers
                </Link>
                <Link
                  href="/collections/albums"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5"
                >
                  Handcrafted Albums
                </Link>
                <Link
                  href="/collections/bouquets"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5"
                >
                  Floral & Silk Bouquets
                </Link>
                <Link
                  href="/collections/a5-frames"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5"
                >
                  A5 Keepsake Frames
                </Link>
                <Link
                  href="/collections/invitation-cards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5"
                >
                  Invitation Cards
                </Link>
                <Link
                  href="/collections/event-decor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3.5"
                >
                  Event Décor
                </Link>
              </div>
            </div>

            <div className="p-5 border-t border-brand-border bg-brand-surface space-y-3">
              {user ? (
                <>
                  <p className="text-xs text-brand-muted">
                    Signed in as <strong className="text-brand-charcoal">{user.name}</strong>
                  </p>
                  {['admin', 'staff'].includes(user.role) && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center py-2.5 bg-brand-crimson text-white text-xs font-semibold uppercase tracking-widest"
                    >
                      Open Admin Studio
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 border border-brand-charcoal text-brand-charcoal text-xs font-semibold uppercase tracking-widest"
                  >
                    My Orders
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full py-3 bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Modal Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-4">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl border border-brand-border overflow-hidden">
            <div className="flex items-center px-5 py-4 border-b border-brand-border gap-3">
              <Search className="w-5 h-5 text-brand-gold shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hampers, memory albums, bouquets, A5 frames..."
                className="w-full border-0 focus:ring-0 text-sm text-brand-charcoal placeholder:text-brand-muted"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-brand-muted hover:text-brand-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 max-h-[65vh] overflow-y-auto">
              <p className="text-[11px] uppercase tracking-widest text-brand-muted mb-3">
                {searchQuery.trim() ? 'Matching Handcrafted Creations' : 'Popular Curations'}
              </p>
              {searchResults.length === 0 ? (
                <p className="text-sm text-brand-muted py-6 text-center">
                  No crafts matched &ldquo;{searchQuery}&rdquo;. Try searching for Hampers, Albums, or Bouquets.
                </p>
              ) : (
                <div className="divide-y divide-brand-border">
                  {searchResults.map((prod) => (
                    <Link
                      key={prod._id}
                      href={`/products/${prod.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-4 py-3 hover:bg-brand-blush/60 px-2 transition-colors rounded-sm"
                    >
                      <img
                        src={prod.images[0]?.url}
                        alt={prod.title}
                        className="w-14 h-16 object-cover rounded-xs border border-brand-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-brand-gold uppercase tracking-wider">
                          {prod.subCategory}
                        </p>
                        <p className="text-sm font-medium text-brand-charcoal truncate">
                          {prod.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-brand-charcoal">
                            {formatINR(prod.price)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Quick Drawer / Modal */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border bg-brand-blush">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-brand-crimson fill-brand-crimson" />
                <h3 className="font-serif uppercase tracking-widest text-sm text-brand-charcoal">
                  Your Saved Keepsakes ({wishlistedProducts.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWishlistOpen(false)}
                className="p-1 text-brand-muted hover:text-brand-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 max-h-[65vh] overflow-y-auto">
              {wishlistedProducts.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="font-serif italic text-brand-gold text-base">
                    Your wishlist is waiting for something handmade
                  </p>
                  <p className="text-xs text-brand-muted">
                    Tap the heart icon on any hamper, frame, or bouquet to save it here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-brand-border">
                  {wishlistedProducts.map((prod) => (
                    <div key={prod._id} className="flex items-center gap-3.5 py-3">
                      <Link
                        href={`/products/${prod.slug}`}
                        onClick={() => setWishlistOpen(false)}
                      >
                        <img
                          src={prod.images[0]?.url}
                          alt={prod.title}
                          className="w-16 h-20 object-cover border border-brand-border"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${prod.slug}`}
                          onClick={() => setWishlistOpen(false)}
                          className="text-sm font-medium text-brand-charcoal hover:text-brand-gold block truncate"
                        >
                          {prod.title}
                        </Link>
                        <p className="text-sm font-bold text-brand-charcoal mt-0.5">
                          {formatINR(prod.price)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            type="button"
                            disabled={prod.stock === 0}
                            onClick={() => {
                              setWishlistOpen(false);
                              addItem(prod, 1);
                            }}
                            className="text-[11px] uppercase tracking-widest font-semibold bg-brand-charcoal text-white px-3 py-1.5 hover:bg-brand-gold transition-colors disabled:opacity-40"
                          >
                            {prod.stock === 0 ? 'Sold Out' : '+ Move to Bag'}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(prod._id)}
                            className="text-[11px] text-brand-muted hover:text-brand-crimson"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
