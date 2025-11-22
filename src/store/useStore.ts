import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, Product, RFQ, Quote } from '../types/types';
import { USERS, PRODUCTS, RFQS, QUOTES, ORDERS, Order } from '../services/mockData';
import {
  createSession,
  clearSession,
  isSessionValid,
  recordLoginAttempt,
  isAccountLocked,
  getRemainingAttempts,
} from '../lib/auth';

// Login result type for detailed feedback
export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
  remainingAttempts?: number;
  lockoutRemainingMs?: number;
}

interface StoreState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;

  // Data
  users: User[];
  products: Product[];
  rfqs: RFQ[];
  quotes: Quote[];
  orders: Order[];

  // Actions
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  checkSession: () => boolean;

  // Product actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  approveProduct: (id: string) => void;
  rejectProduct: (id: string) => void;

  // RFQ actions
  addRFQ: (rfq: RFQ) => void;
  updateRFQ: (id: string, updates: Partial<RFQ>) => void;

  // Quote actions
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  approveQuote: (id: string, marginPercent: number) => void;
  acceptQuote: (id: string) => void;
  rejectQuote: (id: string) => void;

  // Order actions
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;

  // User management
  updateUser: (id: string, updates: Partial<User>) => void;
  approveSupplier: (id: string) => void;
  rejectSupplier: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      users: USERS,
      products: PRODUCTS,
      rfqs: RFQS,
      quotes: QUOTES,
      orders: ORDERS,

      // Auth actions
      login: (email: string, password: string): LoginResult => {
        // Check if account is locked
        const lockStatus = isAccountLocked(email);
        if (lockStatus.locked) {
          return {
            success: false,
            error: 'Account temporarily locked due to too many failed attempts.',
            lockoutRemainingMs: lockStatus.remainingMs,
          };
        }

        // Find user by email
        const user = get().users.find(u => u.email === email);

        // For demo: accept any password with 6+ chars
        const isValidPassword = password.length >= 6;

        if (user && isValidPassword) {
          // Successful login
          recordLoginAttempt(email, true);
          createSession(user);
          set({ currentUser: user, isAuthenticated: true });
          return { success: true, user };
        }

        // Failed login
        recordLoginAttempt(email, false);
        const remaining = getRemainingAttempts(email);

        return {
          success: false,
          error: remaining > 0
            ? 'Invalid email or password.'
            : 'Account locked due to too many failed attempts.',
          remainingAttempts: remaining,
        };
      },

      logout: () => {
        clearSession();
        set({ currentUser: null, isAuthenticated: false });
      },

      checkSession: () => {
        if (!isSessionValid()) {
          clearSession();
          set({ currentUser: null, isAuthenticated: false });
          return false;
        }
        return true;
      },

      // Product actions
      addProduct: (product: Product) => {
        set(state => ({
          products: [...state.products, product]
        }));
      },

      updateProduct: (id: string, updates: Partial<Product>) => {
        set(state => ({
          products: state.products.map(p =>
            p.id === id ? { ...p, ...updates } : p
          )
        }));
      },

      deleteProduct: (id: string) => {
        set(state => ({
          products: state.products.filter(p => p.id !== id)
        }));
      },

      approveProduct: (id: string) => {
        get().updateProduct(id, { status: 'APPROVED' });
      },

      rejectProduct: (id: string) => {
        get().updateProduct(id, { status: 'REJECTED' });
      },

      // RFQ actions
      addRFQ: (rfq: RFQ) => {
        set(state => ({
          rfqs: [...state.rfqs, rfq]
        }));
      },

      updateRFQ: (id: string, updates: Partial<RFQ>) => {
        set(state => ({
          rfqs: state.rfqs.map(r =>
            r.id === id ? { ...r, ...updates } : r
          )
        }));
      },

      // Quote actions
      addQuote: (quote: Quote) => {
        set(state => ({
          quotes: [...state.quotes, quote]
        }));
      },

      updateQuote: (id: string, updates: Partial<Quote>) => {
        set(state => ({
          quotes: state.quotes.map(q =>
            q.id === id ? { ...q, ...updates } : q
          )
        }));
      },

      approveQuote: (id: string, marginPercent: number) => {
        const quote = get().quotes.find(q => q.id === id);
        if (quote) {
          const finalPrice = quote.supplierPrice * (1 + marginPercent / 100);
          get().updateQuote(id, {
            marginPercent,
            finalPrice,
            status: 'SENT_TO_CLIENT'
          });
        }
      },

      acceptQuote: (id: string) => {
        get().updateQuote(id, { status: 'ACCEPTED' });
        const quote = get().quotes.find(q => q.id === id);
        if (quote) {
          // Update RFQ status
          get().updateRFQ(quote.rfqId, { status: 'CLOSED' });
          // Create order
          const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            amount: quote.finalPrice,
            status: 'In Transit',
            date: new Date().toISOString().split('T')[0]
          };
          get().addOrder(newOrder);
        }
      },

      rejectQuote: (id: string) => {
        get().updateQuote(id, { status: 'REJECTED' });
      },

      // Order actions
      addOrder: (order: Order) => {
        set(state => ({
          orders: [...state.orders, order]
        }));
      },

      updateOrder: (id: string, updates: Partial<Order>) => {
        set(state => ({
          orders: state.orders.map(o =>
            o.id === id ? { ...o, ...updates } : o
          )
        }));
      },

      // User management
      updateUser: (id: string, updates: Partial<User>) => {
        set(state => ({
          users: state.users.map(u =>
            u.id === id ? { ...u, ...updates } : u
          )
        }));
      },

      approveSupplier: (id: string) => {
        get().updateUser(id, {
          status: 'APPROVED',
          kycStatus: 'VERIFIED',
          verified: true
        });
      },

      rejectSupplier: (id: string) => {
        get().updateUser(id, {
          status: 'REJECTED',
          kycStatus: 'REJECTED'
        });
      },
    }),
    {
      name: 'mwrd-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
        products: state.products,
        rfqs: state.rfqs,
        quotes: state.quotes,
        orders: state.orders,
      }),
    }
  )
);
