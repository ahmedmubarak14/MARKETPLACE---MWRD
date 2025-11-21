import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, Product, RFQ, Quote } from '../types/types';
import { USERS, PRODUCTS, RFQS, QUOTES, ORDERS, Order } from '../services/mockData';

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
  login: (email: string, password: string) => User | null;
  logout: () => void;

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
      login: (email: string, password: string) => {
        const user = get().users.find(u => u.email === email);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return user;
        }
        return null;
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
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
