'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import CartDrawer from '@/components/cart/CartDrawer';
import AuthModal from '@/components/auth/AuthModal';

export default function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const headerStackRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (isAdminRoute) return;

    const el = headerStackRef.current;
    if (!el) return;

    const updateHeight = () => {
      setHeaderHeight(el.offsetHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    observer.observe(el);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAdminRoute]);

  if (isAdminRoute) {
    return (
      <>
        {children}
        <AuthModal />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Top Storefront Header (Mobile & Desktop) */}
      <div
        ref={headerStackRef}
        className={`fixed top-0 inset-x-0 z-40 transition-shadow duration-200 ${
          isScrolled ? 'shadow-[0_4px_24px_rgba(34,34,34,0.08)]' : ''
        }`}
      >
        <AnnouncementBar />
        <Navbar />
      </div>

      {/* Dynamic Spacer Matching Fixed Header Height */}
      <div
        aria-hidden="true"
        style={headerHeight !== null ? { height: `${headerHeight}px` } : undefined}
        className={headerHeight === null ? 'h-[100px] md:h-[148px] shrink-0' : 'shrink-0'}
      />

      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <AuthModal />
    </div>
  );
}
