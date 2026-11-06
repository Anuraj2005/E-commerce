'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, SelectedCustomization } from '@/types';
import { getRibbonSwatch } from '@/lib/format';

export const FREE_SHIPPING_MILESTONE = 1999;
export const STANDARD_DELIVERY_FEE = 99;

function buildCartLineId(productId: string, customization?: SelectedCustomization): string {
  if (!customization) return productId;
  const tag = customization.selectedTag || '';
  const ribbon = customization.selectedRibbon || '';
  const note = customization.customNote || '';
  const photos = (customization.customerUploadedPhotos || []).join(',');
  return `${productId}::${tag}::${ribbon}::${note}::${photos}`;
}

interface CartState {
  items: CartItem[];
  wishlistIds: string[];
  isDrawerOpen: boolean;
  giftMessage: string;
  stockNotice: string | null;

  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (
    product: Product,
    quantity?: number,
    customization?: SelectedCustomization,
    openCartAfter?: boolean
  ) => void;
  removeItem: (cartLineId: string) => void;
  updateQuantity: (cartLineId: string, quantity: number) => void;
  syncProductStock: (product: Product) => void;
  toggleWishlist: (productId: string) => void;
  setGiftMessage: (message: string) => void;
  clearStockNotice: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlistIds: [],
      isDrawerOpen: false,
      giftMessage: '',
      stockNotice: null,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      addItem: (product, quantity = 1, customization, openCartAfter = true) => {
        if (product.stock <= 0) return;

        const firstRawRibbon = product.customizationOptions?.ribbonColors?.[0] || 'Blush Rose';
        const defaultCustom: SelectedCustomization = customization || {
          selectedTag: product.customizationOptions?.defaultTags?.[0] || 'Just for you',
          selectedRibbon: getRibbonSwatch(firstRawRibbon).label,
          customNote: '',
          customerUploadedPhotos: [],
        };

        const cartLineId = buildCartLineId(product._id, defaultCustom);
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.cartLineId === cartLineId);

        const primaryImage =
          product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '';

        if (existingIndex > -1) {
          const updated = [...currentItems];
          const nextQty = Math.min(product.stock, updated[existingIndex].quantity + quantity);
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: nextQty,
            price: product.price,
            maxStock: product.stock,
          };
          set({
            items: updated,
            ...(openCartAfter ? { isDrawerOpen: true } : {}),
          });
        } else {
          const newItem: CartItem = {
            cartLineId,
            productId: product._id,
            slug: product.slug,
            title: product.title,
            price: product.price,
            quantity: Math.min(product.stock, Math.max(1, quantity)),
            maxStock: product.stock,
            image: primaryImage,
            customization: product.isCustomizable ? defaultCustom : undefined,
          };
          set({
            items: [...currentItems, newItem],
            ...(openCartAfter ? { isDrawerOpen: true } : {}),
          });
        }
      },

      removeItem: (cartLineId) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartLineId !== cartLineId),
        }));
      },

      updateQuantity: (cartLineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartLineId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.cartLineId === cartLineId
              ? { ...item, quantity: Math.min(item.maxStock, quantity) }
              : item
          ),
        }));
      },

      syncProductStock: (product) => {
        const currentItems = get().items;
        const hasMatch = currentItems.some((item) => item.productId === product._id);
        if (!hasMatch) return;

        let notice: string | null = null;
        const nextItems = currentItems
          .map((item) => {
            if (item.productId !== product._id) return item;
            if (product.stock <= 0 || product.isActive === false) {
              notice = `"${product.title}" just sold out and was removed from your bag.`;
              return null;
            }
            const clampedQty = Math.min(item.quantity, product.stock);
            if (clampedQty < item.quantity) {
              notice = `Quantity for "${product.title}" adjusted to ${clampedQty} (remaining stock).`;
            }
            return {
              ...item,
              title: product.title,
              price: product.price,
              maxStock: product.stock,
              quantity: clampedQty,
            };
          })
          .filter(Boolean) as CartItem[];

        set({
          items: nextItems,
          ...(notice ? { stockNotice: notice } : {}),
        });
      },

      toggleWishlist: (productId) => {
        set((state) => {
          const exists = state.wishlistIds.includes(productId);
          return {
            wishlistIds: exists
              ? state.wishlistIds.filter((id) => id !== productId)
              : [...state.wishlistIds, productId],
          };
        });
      },

      setGiftMessage: (message) => set({ giftMessage: message }),
      clearStockNotice: () => set({ stockNotice: null }),
      clearCart: () =>
        set({
          items: [],
          giftMessage: '',
          stockNotice: null,
        }),
    }),
    {
      name: 'artistic_fusion_cart_v2',
      partialize: (state) => ({
        items: state.items,
        wishlistIds: state.wishlistIds,
        giftMessage: state.giftMessage,
      }),
    }
  )
);
