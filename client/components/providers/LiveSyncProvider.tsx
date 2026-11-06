'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import { Product } from '@/types';

export default function LiveSyncProvider({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const loadInitialCatalog = useCatalogStore((s) => s.loadInitialCatalog);
  const applyLiveProductEvent = useCatalogStore((s) => s.applyLiveProductEvent);
  const syncProductStock = useCartStore((s) => s.syncProductStock);

  useEffect(() => {
    fetchMe();
    loadInitialCatalog();

    const socket = getSocket();

    const handleProductUpdated = (payload: {
      action: 'CREATE' | 'UPDATE' | 'DELETE';
      product: Product;
    }) => {
      if (!payload?.product) return;
      applyLiveProductEvent(payload.action, payload.product);
      syncProductStock(payload.product);
    };

    socket.on('product:updated', handleProductUpdated);

    return () => {
      socket.off('product:updated', handleProductUpdated);
    };
  }, [fetchMe, loadInitialCatalog, applyLiveProductEvent, syncProductStock]);

  return <>{children}</>;
}
