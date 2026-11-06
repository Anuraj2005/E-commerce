'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ClipboardList,
  ExternalLink,
  LogOut,
  Sparkles,
  Lock,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const NAV_ITEMS = [
  { href: '/admin', label: 'Live Metrics', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Fulfillment Kanban', icon: ClipboardList },
  { href: '/admin/products', label: 'Product Catalog', icon: Package },
  { href: '/admin/products/new', label: 'Create Product', icon: PlusCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('admin@artisticfusion.com');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isAuthorized = user && ['admin', 'staff'].includes(user.role);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-brand-blush flex items-center justify-center">
        <p className="font-serif italic text-brand-gold text-base">
          Verifying Admin Studio session...
        </p>
      </div>
    );
  }

  // Protected Admin RBAC Gate
  if (!isAuthorized) {
    const handleAdminLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        const loggedUser = await login(email, password);
        if (!['admin', 'staff'].includes(loggedUser.role)) {
          setError(
            'Signed in account does not have Admin or Staff permissions. Please sign in with an administrator account.'
          );
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Admin authentication failed');
      }
    };

    return (
      <div className="min-h-screen bg-brand-blush flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md border border-brand-border shadow-xl overflow-hidden">
          <div className="bg-brand-charcoal text-white px-6 py-6 text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-brand-gold-light mb-1">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="font-serif uppercase tracking-widest text-lg">
              Artistic Fusion · Admin Portal
            </h1>
            <p className="text-xs text-white/75">
              Authorized Staff & Administrator Access Only
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
            {user && !isAuthorized && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Currently signed in as customer <strong>{user.email}</strong>. Sign in below with
                an administrator account to access `/admin`.
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-brand-crimson">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-charcoal mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs border-brand-border focus:border-brand-gold focus:ring-brand-gold"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-brand-crimson hover:bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Signing In...' : 'Enter Admin Studio'}</span>
            </button>

            <div className="pt-3 border-t border-brand-border flex items-center justify-between text-[11px] text-brand-muted">
              <span>Default Test Admin pre-filled</span>
              <Link href="/" className="text-brand-charcoal underline">
                ← Back to Storefront
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const SidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-brand-gold-light">
            <Sparkles className="w-4 h-4" />
            <span className="font-serif uppercase tracking-widest text-base text-white">
              Artistic Fusion
            </span>
          </div>
          <p className="text-[11px] text-white/60 mt-1">Craft Operations & Live Inventory</p>
        </div>

        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors ${
                  active
                    ? 'bg-brand-crimson text-white'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-4 py-2.5 text-xs text-brand-gold-light hover:bg-white/10 rounded-xs transition-colors"
        >
          <span>Open Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="px-4 py-2 text-[11px] text-white/60 truncate">
          {user.name} ({user.role})
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-white/75 hover:text-white hover:bg-white/10 rounded-xs transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-surface flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-brand-charcoal shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/55"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 bg-brand-charcoal h-full z-10">{SidebarContent}</div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Mobile Admin Header */}
        <header className="lg:hidden bg-white border-b border-brand-border px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 text-brand-charcoal"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif uppercase tracking-widest text-sm font-semibold">
            Admin Craft Studio
          </span>
          <Link href="/" className="text-xs text-brand-crimson font-semibold">
            Store ↗
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
