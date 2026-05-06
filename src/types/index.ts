// ─── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;          // in cents (e.g. 5000 = $50.00)
  images: string[];       // Firebase Storage URLs
  category: string;
  stock: number;          // typically 1 for 1-of-1 pieces
  sold: boolean;
  createdAt: string;      // ISO date string
  updatedAt: string;
}

export type ProductFormData = Omit<Product, "id" | "sold" | "createdAt" | "updatedAt">;

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;   // in cents
  stripePaymentIntentId: string;
  stripeSessionId: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  shippoLabelUrl?: string;
  shippoTrackingNumber?: string;
  shippoTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Cart (client-side only, single item) ─────────────────────────────────────

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface CreateCheckoutPayload {
  productId: string;
}

export interface CreateCheckoutResponse {
  url: string;
}

export interface CreateLabelPayload {
  orderId: string;
}
