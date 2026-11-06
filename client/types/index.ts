export interface SavedAddress {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'staff' | 'admin';
  savedAddress?: SavedAddress;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  highlightCoverImage: {
    url: string;
    public_id: string;
  };
  displayOrder: number;
  isActive: boolean;
}

export interface ProductImage {
  url: string;
  public_id: string;
  isPrimary: boolean;
}

export interface CustomizationOptions {
  allowCustomTag: boolean;
  defaultTags: string[];
  ribbonColors: string[];
  requiresPhotoUpload: boolean;
  maxPhotosAllowed: number;
}

export type ProductBadge = 'NEW' | 'BESTSELLER' | 'LIMITED';

export type SubCategoryName =
  | 'Gift Hampers'
  | 'Celebration Hampers'
  | 'Albums'
  | 'Bouquets'
  | 'A5 Frames'
  | 'Invitation Cards'
  | 'Event Décor';

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  images: ProductImage[];
  videoUrl?: string | null;
  category: {
    _id: string;
    name: string;
    slug: string;
  } | string;
  subCategory: SubCategoryName;
  leadTimeDays: number;
  inclusions?: string[];
  dimensions?: string;
  careInstructions?: string;
  isCustomizable: boolean;
  customizationOptions: CustomizationOptions;
  ratings: {
    average: number;
    count: number;
  };
  badges: ProductBadge[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SelectedCustomization {
  selectedTag?: string;
  selectedRibbon?: string;
  customNote?: string;
  customerUploadedPhotos?: string[];
}

export interface CartItem {
  cartLineId: string;
  productId: string;
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  quantity: number;
  maxStock: number;
  image: string;
  customization?: SelectedCustomization;
}

export type FulfillmentStatus =
  | 'RECEIVED'
  | 'HANDCRAFTING'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  product: string;
  title: string;
  slug?: string;
  price: number;
  quantity: number;
  image: string;
  customization?: SelectedCustomization;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: SavedAddress;
  items: OrderItem[];
  giftMessage?: string;
  addGiftCardUpsell?: boolean;
  couponCode?: string | null;
  pricing: {
    subtotal: number;
    shippingFee: number;
    giftWrapFee: number;
    gstAmount?: number;
    discount: number;
    total: number;
  };
  paymentMethod: 'COD' | 'MOCK_ONLINE' | 'RAZORPAY';
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstagramPost {
  _id: string;
  caption: string;
  handle: string;
  imageUrl: string;
  isReel: boolean;
  likesCount: number;
  products: Product[];
  displayOrder: number;
}

export interface AdminStats {
  totalOrders: number;
  todayOrdersCount: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingHandcraftingCount: number;
  totalActiveProducts: number;
  lowStockCount: number;
  lowStockProducts: Product[];
  statusBreakdown: { status: FulfillmentStatus; count: number }[];
  categoryChartData: { name: string; stock: number; products: number }[];
  recentOrders: Order[];
  storageMode: string;
}
