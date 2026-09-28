export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  image_public_id?: string;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  price: number;
  currency: string;
  image_url: string;
  image_public_id?: string;
  stock: number;
  active: boolean;
  featured: boolean;
  discount_percent?: number;
};

export type CartItem = { product: Product; quantity: number };

export type StoredOrder = {
  order_id: string;
  created_at: string;
  customer_name: string;
  email: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  delivery_method: string;
  payment_method: string;
  subtotal: number;
  unit_price: number;
  delivery_cost: number;
  total: number;
  status: string;
  items?: StoredOrderItem[];
};

export type StoredOrderItem = { order_id: string; product_id: string; product_name: string; quantity: number; unit_price: number; subtotal: number };

export type OrderInput = {
  customer_name: string;
  email: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  delivery_method: string;
  payment_method: string;
  items: { product_id: string; quantity: number }[];
};
export type DeliveryZone = {
  id: string;
  wilayaCode: string;
  wilayaName: string;
  homeDeliveryPrice: number;
  deskDeliveryPrice: number;
  active: boolean;
};
// Add to types/store.ts, alongside Product/Category/StoredOrder.
export type StoreSettings = {
  businessName: string;
  tagline: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  copyrightText: string;
};
