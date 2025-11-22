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
  createdAt?: string;
  deadline?: string;
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

export interface AppState {
  currentUser: User | null;
}