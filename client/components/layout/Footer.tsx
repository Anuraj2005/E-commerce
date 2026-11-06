import Link from 'next/link';
import { Sparkles, ShieldCheck, Truck, Gift, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-canvas border-t border-brand-border pb-20 md:pb-0">
      {/* Craftsmanship Assurance Strip */}
      <div className="border-b border-brand-border bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <HeartHandshake className="w-6 h-6 text-brand-gold" />
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-charcoal">
              100% Handcrafted
            </p>
            <p className="text-xs text-brand-muted">
              Assembled to order by studio artisans
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Gift className="w-6 h-6 text-brand-gold" />
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-charcoal">
              Custom Ribbons & Wax Seals
            </p>
            <p className="text-xs text-brand-muted">
              Personalized tags & studio photo prints
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Truck className="w-6 h-6 text-brand-gold" />
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-charcoal">
              Damage-Free Pan-India
            </p>
            <p className="text-xs text-brand-muted">
              Free express shipping over ₹1,999
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <ShieldCheck className="w-6 h-6 text-brand-gold" />
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-charcoal">
              COD & Verified Checkout
            </p>
            <p className="text-xs text-brand-muted">
              Cash on Delivery & UPI ready across India
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-brand-blush border border-brand-gold/60 flex items-center justify-center text-brand-gold">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="font-serif uppercase tracking-[0.18em] text-lg text-brand-charcoal">
              Artistic Fusion
            </span>
          </div>
          <p className="font-serif italic text-sm text-brand-gold">
            “something handmade is so much more beautiful”
          </p>
          <p className="text-xs text-brand-muted leading-relaxed">
            Bespoke celebration hampers, hand-stitched linen memory albums, preserved bouquets,
            and wax-sealed stationery crafted with love in India.
          </p>
        </div>

        <div>
          <h4 className="font-serif uppercase tracking-widest text-xs font-semibold text-brand-charcoal mb-4">
            Shop Collections
          </h4>
          <ul className="space-y-2.5 text-xs text-brand-muted">
            <li>
              <Link href="/collections/celebration-hampers" className="hover:text-brand-crimson">
                Celebration Hampers
              </Link>
            </li>
            <li>
              <Link href="/collections/hampers" className="hover:text-brand-crimson">
                Curated Gift Hampers
              </Link>
            </li>
            <li>
              <Link href="/collections/albums" className="hover:text-brand-crimson">
                Handcrafted Memory Albums
              </Link>
            </li>
            <li>
              <Link href="/collections/bouquets" className="hover:text-brand-crimson">
                Silk & Dried Bouquets
              </Link>
            </li>
            <li>
              <Link href="/collections/a5-frames" className="hover:text-brand-crimson">
                A5 Keepsake Frames
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif uppercase tracking-widest text-xs font-semibold text-brand-charcoal mb-4">
            Occasions & Studio
          </h4>
          <ul className="space-y-2.5 text-xs text-brand-muted">
            <li>
              <Link href="/collections/invitation-cards" className="hover:text-brand-crimson">
                Wax-Sealed Invitations
              </Link>
            </li>
            <li>
              <Link href="/collections/event-decor" className="hover:text-brand-crimson">
                Intimate Event Décor
              </Link>
            </li>
            <li>
              <Link href="/collections/all?badge=BESTSELLER" className="hover:text-brand-crimson">
                Most-Loved Bestsellers
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-brand-crimson">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-brand-crimson">
                Artisan / Admin Portal
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif uppercase tracking-widest text-xs font-semibold text-brand-charcoal mb-4">
            Studio Care & Gifting Concierge
          </h4>
          <p className="text-xs text-brand-muted leading-relaxed mb-3">
            Every celebration hamper, heirloom album, and keepsake frame includes complimentary
            satin ribbon styling and personalized greeting tags.
          </p>
          <div className="p-3.5 bg-brand-blush border border-brand-border text-xs space-y-1">
            <p className="font-semibold text-brand-charcoal">Craft Studio Hours</p>
            <p className="text-brand-muted">Mon – Sat · 10:00 AM – 7:30 PM IST</p>
            <p className="text-brand-gold font-medium">hello@artisticfusion.in</p>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-border py-5 text-center text-[11px] text-brand-muted">
        © {new Date().getFullYear()} Artistic Fusion Crafts Studio. All rights reserved.
      </div>
    </footer>
  );
}
