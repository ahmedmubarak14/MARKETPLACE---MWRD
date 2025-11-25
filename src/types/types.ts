export enum UserRole {
  GUEST = 'GUEST',
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
  verified: boolean;
  // For anonymization
  publicId?: string;
  rating?: number; 
  // Supplier Management Fields
  status?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REQUIRES_ATTENTION' | 'ACTIVE' | 'DEACTIVATED';
  kycStatus?: 'VERIFIED' | 'IN_REVIEW' | 'REJECTED' | 'INCOMPLETE';
  dateJoined?: string;
}

export interface Product {
  id: string;
  supplierId: string;
  name: string;
  description: string;
  category: string;
  image: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  costPrice?: number; // Only visible to supplier and admin
  retailPrice?: number; // Price clients see (cost + margin)
  marginPercent?: number; // MWRD's margin percentage
  sku?: string;
}

export interface RFQItem {
  productId: string;
  quantity: number;
  notes: string;
}

export interface RFQ {
  id: string;
  clientId: string;
  items: RFQItem[];
  status: 'OPEN' | 'QUOTED' | 'CLOSED';
  date: string;
}

export interface Quote {
  id: string;
  rfqId: string;
  supplierId: string;
  supplierPrice: number; // Price supplier sets
  leadTime: string;
  marginPercent: number; // Admin sets this
  finalPrice: number; // Price client sees (supplierPrice + margin)
  status: 'PENDING_ADMIN' | 'SENT_TO_CLIENT' | 'ACCEPTED' | 'REJECTED';
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Order {
  id: string;
  quoteId?: string;
  clientId: string;
  supplierId: string;
  amount: number;
  status: OrderStatus;
  date: string;
  // Payment tracking (Phase One - Bank Transfer)
  paymentReference?: string;
  paymentConfirmedAt?: string;
  paymentConfirmedBy?: string;
  paymentNotes?: string;
  paymentReceiptUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankDetails {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban?: string;
  swiftCode?: string;
  branchName?: string;
  branchCode?: string;
  currency: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum CustomRequestStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ASSIGNED = 'ASSIGNED',
  QUOTED = 'QUOTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum RequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface CustomItemRequest {
  id: string;
  clientId: string;
  // Request details
  itemName: string;
  description: string;
  specifications?: string;
  category?: string;
  // Quantity and pricing
  quantity: number;
  targetPrice?: number;
  currency: string;
  // Additional info
  deadline?: string;
  priority: RequestPriority;
  referenceImages?: string[];
  attachmentUrls?: string[];
  // Status tracking
  status: CustomRequestStatus;
  adminNotes?: string;
  assignedTo?: string;
  assignedAt?: string;
  assignedBy?: string;
  // Response
  supplierQuoteId?: string;
  respondedAt?: string;
  rejectionReason?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  currentUser: User | null;
}