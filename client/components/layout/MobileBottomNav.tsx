'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Grid, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
    >
      <div className="grid grid-cols-4 h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
            pathname === '/' ? 'text-brand-crimson font-semibold' : 'text-brand-muted'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/collections/all"
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
            pathname?.startsWith('/collections')
              ? 'text-brand-crimson font-semibold'
              : 'text-brand-muted'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span>Categories</span>
        </Link>

        <button
          type="button"
          onClick={openDrawer}
          className="relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider text-brand-muted hover:text-brand-charcoal transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-crimson text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span>Bag</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (user) {
              router.push(['admin', 'staff'].includes(user.role) ? '/admin' : '/account');
            } else {
              openAuthModal();
            }
          }}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider transition-colors ${
            pathname?.startsWith('/account')
              ? 'text-brand-crimson font-semibold'
              : 'text-brand-muted'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span>{user ? user.name.split(' ')[0] : 'Account'}</span>
        </button>
      </div>
    </nav>
  );
}
