import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, Product, RFQ, Quote } from '../types/types';
import { USERS, PRODUCTS, RFQS, QUOTES, ORDERS, Order } from '../services/mockData';
import { authService } from '../services/authService';
import { api } from '../services/api';

// Flag to determine if we should use Supabase or mock data
// Set to true once you've configured your Supabase environment variables
const USE_SUPABASE = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface StoreState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Data
  users: User[];
  products: Product[];
  rfqs: RFQ[];
  quotes: Quote[];
  orders: Order[];

  // Actions
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;

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

  // Data loading (for Supabase)
  loadProducts: () => Promise<void>;
  loadRFQs: () => Promise<void>;
  loadQuotes: () => Promise<void>;
  loadOrders: () => Promise<void>;
  loadUsers: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      isLoading: true,
      users: USE_SUPABASE ? [] : USERS,
      products: USE_SUPABASE ? [] : PRODUCTS,
      rfqs: USE_SUPABASE ? [] : RFQS,
      quotes: USE_SUPABASE ? [] : QUOTES,
      orders: USE_SUPABASE ? [] : ORDERS,

      // Initialize auth state from Supabase session
      initializeAuth: async () => {
        if (USE_SUPABASE) {
          set({ isLoading: true });
          const { user } = await authService.getSession();
          if (user) {
            set({ currentUser: user, isAuthenticated: true, isLoading: false });
            // Load data for authenticated user
            get().loadProducts();
            get().loadRFQs();
            get().loadQuotes();
            get().loadOrders();
            if (user.role === 'ADMIN') {
              get().loadUsers();
            }
          } else {
            set({ currentUser: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      },

      // Auth actions
      login: async (email: string, password: string) => {
        if (USE_SUPABASE) {
          const result = await authService.signIn(email, password);
          if (result.success && result.user) {
            set({ currentUser: result.user, isAuthenticated: true });
            // Load data for authenticated user
            get().loadProducts();
            get().loadRFQs();
            get().loadQuotes();
            get().loadOrders();
            if (result.user.role === 'ADMIN') {
              get().loadUsers();
            }
            return result.user;
          }
          return null;
        } else {
          // Fallback to mock data
          const user = get().users.find(u => u.email === email);
          if (user) {
            set({ currentUser: user, isAuthenticated: true });
            return user;
          }
          return null;
        }
      },

      logout: async () => {
        if (USE_SUPABASE) {
          await authService.signOut();
        }
        set({ currentUser: null, isAuthenticated: false });
      },

      // Data loading functions for Supabase
      loadProducts: async () => {
        if (USE_SUPABASE) {
          const products = await api.getProducts();
          set({ products });
        }
      },

      loadRFQs: async () => {
        if (USE_SUPABASE) {
          const rfqs = await api.getRFQs();
          set({ rfqs });
        }
      },

      loadQuotes: async () => {
        if (USE_SUPABASE) {
          const quotes = await api.getQuotes();
          set({ quotes });
        }
      },

      loadOrders: async () => {
        if (USE_SUPABASE) {
          const orders = await api.getOrders();
          set({ orders });
        }
      },

      loadUsers: async () => {
        if (USE_SUPABASE) {
          const users = await api.getUsers();
          set({ users });
        }
      },

      // Product actions
      addProduct: (product: Product) => {
        if (USE_SUPABASE) {
          api.createProduct(product).then(newProduct => {
            if (newProduct) {
              set(state => ({ products: [...state.products, newProduct] }));
            }
          });
        } else {
          set(state => ({
            products: [...state.products, product]
          }));
        }
      },

      updateProduct: (id: string, updates: Partial<Product>) => {
        if (USE_SUPABASE) {
          api.updateProduct(id, updates).then(updatedProduct => {
            if (updatedProduct) {
              set(state => ({
                products: state.products.map(p =>
                  p.id === id ? updatedProduct : p
                )
              }));
            }
          });
        } else {
          set(state => ({
            products: state.products.map(p =>
              p.id === id ? { ...p, ...updates } : p
            )
          }));
        }
      },

      deleteProduct: (id: string) => {
        if (USE_SUPABASE) {
          api.deleteProduct(id).then(success => {
            if (success) {
              set(state => ({
                products: state.products.filter(p => p.id !== id)
              }));
            }
          });
        } else {
          set(state => ({
            products: state.products.filter(p => p.id !== id)
          }));
        }
      },

      approveProduct: (id: string) => {
        get().updateProduct(id, { status: 'APPROVED' });
      },

      rejectProduct: (id: string) => {
        get().updateProduct(id, { status: 'REJECTED' });
      },

      // RFQ actions
      addRFQ: (rfq: RFQ) => {
        if (USE_SUPABASE) {
          api.createRFQ(rfq).then(newRfq => {
            if (newRfq) {
              set(state => ({ rfqs: [...state.rfqs, newRfq] }));
            }
          });
        } else {
          set(state => ({
            rfqs: [...state.rfqs, rfq]
          }));
        }
      },

      updateRFQ: (id: string, updates: Partial<RFQ>) => {
        if (USE_SUPABASE) {
          api.updateRFQ(id, updates).then(updatedRfq => {
            if (updatedRfq) {
              set(state => ({
                rfqs: state.rfqs.map(r =>
                  r.id === id ? updatedRfq : r
                )
              }));
            }
          });
        } else {
          set(state => ({
            rfqs: state.rfqs.map(r =>
              r.id === id ? { ...r, ...updates } : r
            )
          }));
        }
      },

      // Quote actions
      addQuote: (quote: Quote) => {
        if (USE_SUPABASE) {
          api.createQuote(quote).then(newQuote => {
            if (newQuote) {
              set(state => ({ quotes: [...state.quotes, newQuote] }));
            }
          });
        } else {
          set(state => ({
            quotes: [...state.quotes, quote]
          }));
        }
      },

      updateQuote: (id: string, updates: Partial<Quote>) => {
        if (USE_SUPABASE) {
          api.updateQuote(id, updates).then(updatedQuote => {
            if (updatedQuote) {
              set(state => ({
                quotes: state.quotes.map(q =>
                  q.id === id ? updatedQuote : q
                )
              }));
            }
          });
        } else {
          set(state => ({
            quotes: state.quotes.map(q =>
              q.id === id ? { ...q, ...updates } : q
            )
          }));
        }
      },

      approveQuote: (id: string, marginPercent: number) => {
        if (USE_SUPABASE) {
          api.approveQuote(id, marginPercent).then(updatedQuote => {
            if (updatedQuote) {
              set(state => ({
                quotes: state.quotes.map(q =>
                  q.id === id ? updatedQuote : q
                )
              }));
            }
          });
        } else {
          const quote = get().quotes.find(q => q.id === id);
          if (quote) {
            const finalPrice = quote.supplierPrice * (1 + marginPercent / 100);
            get().updateQuote(id, {
              marginPercent,
              finalPrice,
              status: 'SENT_TO_CLIENT'
            });
          }
        }
      },

      acceptQuote: (id: string) => {
        if (USE_SUPABASE) {
          api.acceptQuote(id).then(result => {
            if (result.quote) {
              set(state => ({
                quotes: state.quotes.map(q =>
                  q.id === id ? result.quote! : q
                )
              }));
            }
            if (result.order) {
              set(state => ({
                orders: [...state.orders, result.order!]
              }));
            }
            // Update RFQ status
            const quote = get().quotes.find(q => q.id === id);
            if (quote) {
              set(state => ({
                rfqs: state.rfqs.map(r =>
                  r.id === quote.rfqId ? { ...r, status: 'CLOSED' as const } : r
                )
              }));
            }
          });
        } else {
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
        if (USE_SUPABASE) {
          api.updateOrder(id, updates).then(updatedOrder => {
            if (updatedOrder) {
              set(state => ({
                orders: state.orders.map(o =>
                  o.id === id ? updatedOrder : o
                )
              }));
            }
          });
        } else {
          set(state => ({
            orders: state.orders.map(o =>
              o.id === id ? { ...o, ...updates } : o
            )
          }));
        }
      },

      // User management
      updateUser: (id: string, updates: Partial<User>) => {
        if (USE_SUPABASE) {
          api.updateUser(id, updates).then(updatedUser => {
            if (updatedUser) {
              set(state => ({
                users: state.users.map(u =>
                  u.id === id ? updatedUser : u
                )
              }));
            }
          });
        } else {
          set(state => ({
            users: state.users.map(u =>
              u.id === id ? { ...u, ...updates } : u
            )
          }));
        }
      },

      approveSupplier: (id: string) => {
        if (USE_SUPABASE) {
          api.approveSupplier(id).then(updatedUser => {
            if (updatedUser) {
              set(state => ({
                users: state.users.map(u =>
                  u.id === id ? updatedUser : u
                )
              }));
            }
          });
        } else {
          get().updateUser(id, {
            status: 'APPROVED',
            kycStatus: 'VERIFIED',
            verified: true
          });
        }
      },

      rejectSupplier: (id: string) => {
        if (USE_SUPABASE) {
          api.rejectSupplier(id).then(updatedUser => {
            if (updatedUser) {
              set(state => ({
                users: state.users.map(u =>
                  u.id === id ? updatedUser : u
                )
              }));
            }
          });
        } else {
          get().updateUser(id, {
            status: 'REJECTED',
            kycStatus: 'REJECTED'
          });
        }
      },
    }),
    {
      name: 'mwrd-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        // Only persist mock data if not using Supabase
        ...(USE_SUPABASE ? {} : {
          users: state.users,
          products: state.products,
          rfqs: state.rfqs,
          quotes: state.quotes,
          orders: state.orders,
        }),
      }),
    }
  )
);
