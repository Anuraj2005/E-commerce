'use client';

import { create } from 'zustand';
import { Category, InstagramPost, Product } from '@/types';
import { apiRequest } from '@/lib/api';

interface CatalogState {
  categories: Category[];
  products: Product[];
  instagramPosts: InstagramPost[];
  isLoaded: boolean;
  isLoading: boolean;
  loadInitialCatalog: () => Promise<void>;
  applyLiveProductEvent: (action: 'CREATE' | 'UPDATE' | 'DELETE', product: Product) => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: [],
  products: [],
  instagramPosts: [],
  isLoaded: false,
  isLoading: false,

  loadInitialCatalog: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const [catRes, prodRes, instaRes] = await Promise.all([
        apiRequest<{ categories: Category[] }>('/categories'),
        apiRequest<{ products: Product[] }>('/products?limit=60'),
        apiRequest<{ posts: InstagramPost[] }>('/instagram'),
      ]);

      set({
        categories: catRes.categories || [],
        products: prodRes.products || [],
        instagramPosts: instaRes.posts || [],
        isLoaded: true,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  applyLiveProductEvent: (action, product) => {
    set((state) => {
      let nextProducts = [...state.products];

      if (action === 'DELETE' || product.isActive === false) {
        nextProducts = nextProducts.filter((p) => p._id !== product._id);
      } else {
        const idx = nextProducts.findIndex((p) => p._id === product._id);
        if (idx > -1) {
          nextProducts[idx] = product;
        } else {
          nextProducts = [product, ...nextProducts];
        }
      }

      const nextInsta = state.instagramPosts.map((post) => ({
        ...post,
        products: (post.products || []).map((linked) =>
          linked._id === product._id ? product : linked
        ),
      }));

      return {
        products: nextProducts,
        instagramPosts: nextInsta,
      };
    });
  },
}));
