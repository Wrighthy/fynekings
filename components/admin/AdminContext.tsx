"use client";

import { createContext, useContext } from "react";

// ============ SHARED TYPES ============

export type Product = {
  id: string;
  name: string;
  series: string;
  price: number;
  stockCount: number;
  inStock: boolean;
  tag: string;
  images: string[];
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  city: string;
  country?: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  promoCode?: string;
  paystackRef?: string;
  createdAt: string;
  // Priced cart items recorded at checkout ({name, series, amount, fee, custom})
  customConfig?: unknown;
  // Legacy single-product orders
  product?: { name: string; series: string; price: number; images?: string[] } | null;
  // Linked account, when the order was placed while signed in
  user?: { id: string; name: string; email: string } | null;
};

export type Promo = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minSpend: number;
  usedCount: number;
  maxUses?: number;
  active: boolean;
};

export type AnalyticsData = {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    paidOrders: number;
    totalPageviews: number;
    conversionRate: string;
    newsletterCount: number;
  };
  topPages: { url: string; count: number }[];
  recentEvents: { id: string; eventName: string; pageUrl: string; createdAt: string }[];
};

export type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  name: string;
  email: string;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  product: { name: string; slug: string };
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  handled: boolean;
  createdAt: string;
};

export type LimitedEditionData = {
  id?: string;
  name: string;
  reference: string;
  price: number;
  totalStock: number;
  soldCount: number;
  dropEndsAt: string;
  imageUrl?: string;
  description?: string;
  active: boolean;
};

// ============ CONTEXT ============

// All dashboard state and handlers live in the page shell; tab components
// consume them through this context so each tab's JSX moved over verbatim
// from the original single-file dashboard.
export type AdminDashboardContextValue = {
  // data
  analytics: AnalyticsData | null;
  orders: Order[];
  products: Product[];
  promos: Promo[];
  subscribers: Subscriber[];
  comments: Comment[];
  messages: ContactMessage[];
  editionData: LimitedEditionData;

  // filters
  orderStatusFilter: string;
  setOrderStatusFilter: (status: string) => void;
  commentFilter: "PENDING" | "APPROVED" | "REJECTED" | "ALL";
  setCommentFilter: (filter: "PENDING" | "APPROVED" | "REJECTED" | "ALL") => void;
  messageFilter: "NEW" | "HANDLED" | "ALL";
  setMessageFilter: (filter: "NEW" | "HANDLED" | "ALL") => void;

  // forms
  newProduct: { name: string; series: string; price: string; tag: string; stockCount: string; description: string; imageUrl: string };
  setNewProduct: React.Dispatch<React.SetStateAction<{ name: string; series: string; price: string; tag: string; stockCount: string; description: string; imageUrl: string }>>;
  newPromo: { code: string; discountType: string; discountValue: string; minSpend: string; maxUses: string };
  setNewPromo: React.Dispatch<React.SetStateAction<{ code: string; discountType: string; discountValue: string; minSpend: string; maxUses: string }>>;
  broadcast: { subject: string; html: string };
  setBroadcast: React.Dispatch<React.SetStateAction<{ subject: string; html: string }>>;
  setEditionData: React.Dispatch<React.SetStateAction<LimitedEditionData>>;

  // edition form status setters (the edition manager's inline handlers)
  setEditionError: React.Dispatch<React.SetStateAction<string>>;
  setSubmittingEdition: React.Dispatch<React.SetStateAction<boolean>>;
  setUploadingEditionImg: React.Dispatch<React.SetStateAction<boolean>>;

  // form status
  productError: string;
  promoError: string;
  broadcastError: string;
  editionError: string;
  submittingProduct: boolean;
  submittingPromo: boolean;
  submittingBroadcast: boolean;
  submittingEdition: boolean;
  uploadingId: string | null;
  uploadingEditionImg: boolean;

  // actions
  fetchDashboardData: () => void;
  setMessage: (msg: string) => void;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  updateStock: (productId: string, newStock: number) => Promise<void>;
  handleUploadImage: (productId: string, files: FileList | null) => Promise<void>;
  handleDeleteImage: (productId: string, imageUrl: string) => Promise<void>;
  handleDeleteProduct: (productId: string) => Promise<void>;
  handleCreateProduct: (e: React.FormEvent) => Promise<void>;
  handleCreatePromo: (e: React.FormEvent) => Promise<void>;
  handleTogglePromo: (promoId: string, currentActive: boolean) => Promise<void>;
  handleDeletePromo: (promoId: string) => Promise<void>;
  handleBroadcast: (e: React.FormEvent) => Promise<void>;
  exportSubscribersCsv: () => void;
  copySubscriberEmails: () => Promise<void>;
  handleDeleteSubscriber: (subscriberId: string) => Promise<void>;
  updateCommentStatus: (commentId: string, status: string) => Promise<void>;
  handleDeleteComment: (commentId: string) => Promise<void>;
  toggleMessageHandled: (messageId: string, handled: boolean) => Promise<void>;
  handleDeleteMessage: (messageId: string) => Promise<void>;
};

export const AdminDashboardContext = createContext<AdminDashboardContextValue | null>(null);

export function useAdmin(): AdminDashboardContextValue {
  const ctx = useContext(AdminDashboardContext);
  if (!ctx) {
    throw new Error("useAdmin must be used inside the admin dashboard (missing AdminDashboardContext provider)");
  }
  return ctx;
}
