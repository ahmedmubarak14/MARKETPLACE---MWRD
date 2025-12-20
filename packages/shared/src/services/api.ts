// API Service Layer
// Connects to Supabase backend for all data operations

import { supabase } from '../lib/supabase';
import { User, Product, RFQ, RFQItem, Quote, UserRole } from '../types/types';
import { Order } from './mockData';

export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('date_joined', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data.map(this.mapDbUserToUser);
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return this.mapDbUserToUser(data);
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('date_joined', { ascending: false });

    if (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }

    return data.map(this.mapDbUserToUser);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const dbUpdates: Record<string, any> = {};

    if (updates.name) dbUpdates.name = updates.name;
    if (updates.companyName) dbUpdates.company_name = updates.companyName;
    if (updates.verified !== undefined) dbUpdates.verified = updates.verified;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.kycStatus) dbUpdates.kyc_status = updates.kycStatus;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return this.mapDbUserToUser(data);
  }

  async approveSupplier(id: string): Promise<User | null> {
    return this.updateUser(id, {
      status: 'APPROVED',
      kycStatus: 'VERIFIED',
      verified: true
    });
  }

  async rejectSupplier(id: string): Promise<User | null> {
    return this.updateUser(id, {
      status: 'REJECTED',
      kycStatus: 'REJECTED'
    });
  }

  // ============================================================================
  // PRODUCT OPERATIONS
  // ============================================================================

  async getProducts(filters?: { status?: string; category?: string; supplierId?: string }): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.supplierId) {
      query = query.eq('supplier_id', filters.supplierId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data.map(this.mapDbProductToProduct);
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return this.mapDbProductToProduct(data);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        supplier_id: product.supplierId,
        name: product.name,
        description: product.description,
        category: product.category,
        image: product.image,
        status: product.status || 'PENDING',
        cost_price: product.costPrice,
        sku: product.sku
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return null;
    }

    return this.mapDbProductToProduct(data);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const dbUpdates: Record<string, any> = {};

    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.image) dbUpdates.image = updates.image;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.costPrice !== undefined) dbUpdates.cost_price = updates.costPrice;
    if (updates.sku) dbUpdates.sku = updates.sku;

    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }

    return this.mapDbProductToProduct(data);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  }

  async approveProduct(id: string): Promise<Product | null> {
    return this.updateProduct(id, { status: 'APPROVED' });
  }

  async rejectProduct(id: string): Promise<Product | null> {
    return this.updateProduct(id, { status: 'REJECTED' });
  }

  // ============================================================================
  // RFQ OPERATIONS
  // ============================================================================

  async getRFQs(filters?: { clientId?: string; status?: string }): Promise<RFQ[]> {
    let query = supabase
      .from('rfqs')
      .select(`
        *,
        rfq_items (
          id,
          product_id,
          quantity,
          notes
        )
      `)
      .order('date', { ascending: false });

    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching RFQs:', error);
      return [];
    }

    return data.map(this.mapDbRfqToRfq);
  }

  async getRFQById(id: string): Promise<RFQ | null> {
    const { data, error } = await supabase
      .from('rfqs')
      .select(`
        *,
        rfq_items (
          id,
          product_id,
          quantity,
          notes
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching RFQ:', error);
      return null;
    }

    return this.mapDbRfqToRfq(data);
  }

  async createRFQ(rfq: Omit<RFQ, 'id'>): Promise<RFQ | null> {
    // Start a transaction by creating RFQ first
    const { data: rfqData, error: rfqError } = await supabase
      .from('rfqs')
      .insert({
        client_id: rfq.clientId,
        status: rfq.status || 'OPEN',
        date: rfq.date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (rfqError) {
      console.error('Error creating RFQ:', rfqError);
      return null;
    }

    // Create RFQ items
    if (rfq.items && rfq.items.length > 0) {
      const rfqItems = rfq.items.map(item => ({
        rfq_id: rfqData.id,
        product_id: item.productId,
        quantity: item.quantity,
        notes: item.notes || null
      }));

      const { error: itemsError } = await supabase
        .from('rfq_items')
        .insert(rfqItems);

      if (itemsError) {
        console.error('Error creating RFQ items:', itemsError);
        // RFQ was created but items failed - might want to delete RFQ
      }
    }

    // Fetch complete RFQ with items
    return this.getRFQById(rfqData.id);
  }

  async updateRFQ(id: string, updates: Partial<RFQ>): Promise<RFQ | null> {
    const dbUpdates: Record<string, any> = {};

    if (updates.status) dbUpdates.status = updates.status;
    if (updates.date) dbUpdates.date = updates.date;

    const { error } = await supabase
      .from('rfqs')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating RFQ:', error);
      return null;
    }

    return this.getRFQById(id);
  }

  // ============================================================================
  // QUOTE OPERATIONS
  // ============================================================================

  async getQuotes(filters?: { rfqId?: string; supplierId?: string; status?: string }): Promise<Quote[]> {
    let query = supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.rfqId) {
      query = query.eq('rfq_id', filters.rfqId);
    }
    if (filters?.supplierId) {
      query = query.eq('supplier_id', filters.supplierId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }

    return data.map(this.mapDbQuoteToQuote);
  }

  async getQuoteById(id: string): Promise<Quote | null> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching quote:', error);
      return null;
    }

    return this.mapDbQuoteToQuote(data);
  }

  async createQuote(quote: Omit<Quote, 'id'>): Promise<Quote | null> {
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        rfq_id: quote.rfqId,
        supplier_id: quote.supplierId,
        supplier_price: quote.supplierPrice,
        lead_time: quote.leadTime,
        margin_percent: quote.marginPercent || 0,
        status: quote.status || 'PENDING_ADMIN'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quote:', error);
      return null;
    }

    return this.mapDbQuoteToQuote(data);
  }

  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote | null> {
    const dbUpdates: Record<string, any> = {};

    if (updates.supplierPrice !== undefined) dbUpdates.supplier_price = updates.supplierPrice;
    if (updates.leadTime) dbUpdates.lead_time = updates.leadTime;
    if (updates.marginPercent !== undefined) dbUpdates.margin_percent = updates.marginPercent;
    if (updates.status) dbUpdates.status = updates.status;

    const { data, error } = await supabase
      .from('quotes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating quote:', error);
      return null;
    }

    return this.mapDbQuoteToQuote(data);
  }

  async approveQuote(id: string, marginPercent: number): Promise<Quote | null> {
    return this.updateQuote(id, {
      marginPercent,
      status: 'SENT_TO_CLIENT'
    });
  }

  async acceptQuote(id: string): Promise<{ quote: Quote | null; order: Order | null }> {
    // Update quote status
    const quote = await this.updateQuote(id, { status: 'ACCEPTED' });

    if (!quote) {
      return { quote: null, order: null };
    }

    // Get RFQ to find client
    const rfq = await this.getRFQById(quote.rfqId);
    if (!rfq) {
      return { quote, order: null };
    }

    // Update RFQ status
    await this.updateRFQ(quote.rfqId, { status: 'CLOSED' });

    // Create order
    const order = await this.createOrder({
      quoteId: quote.id,
      clientId: rfq.clientId,
      supplierId: quote.supplierId,
      amount: quote.finalPrice,
      status: 'In Transit',
      date: new Date().toISOString().split('T')[0]
    });

    return { quote, order };
  }

  async rejectQuote(id: string): Promise<Quote | null> {
    return this.updateQuote(id, { status: 'REJECTED' });
  }

  // ============================================================================
  // ORDER OPERATIONS
  // ============================================================================

  async getOrders(filters?: { clientId?: string; supplierId?: string; status?: string }): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });

    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    if (filters?.supplierId) {
      query = query.eq('supplier_id', filters.supplierId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data.map(this.mapDbOrderToOrder);
  }

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return this.mapDbOrderToOrder(data);
  }

  async createOrder(order: Omit<Order, 'id'> & { quoteId?: string; clientId: string; supplierId: string }): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        quote_id: order.quoteId,
        client_id: order.clientId,
        supplier_id: order.supplierId,
        amount: order.amount,
        status: order.status || 'In Transit',
        date: order.date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return null;
    }

    return this.mapDbOrderToOrder(data);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const dbUpdates: Record<string, any> = {};

    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.date) dbUpdates.date = updates.date;

    const { data, error } = await supabase
      .from('orders')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return null;
    }

    return this.mapDbOrderToOrder(data);
  }

  // ============================================================================
  // MARGIN SETTINGS OPERATIONS
  // ============================================================================

  async getMarginSettings(): Promise<{ category: string | null; marginPercent: number; isDefault: boolean }[]> {
    const { data, error } = await supabase
      .from('margin_settings')
      .select('*')
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching margin settings:', error);
      return [];
    }

    return data.map(m => ({
      category: m.category,
      marginPercent: m.margin_percent,
      isDefault: m.is_default
    }));
  }

  async updateMarginSetting(category: string | null, marginPercent: number): Promise<boolean> {
    const { error } = await supabase
      .from('margin_settings')
      .upsert({
        category,
        margin_percent: marginPercent,
        is_default: category === null
      });

    if (error) {
      console.error('Error updating margin setting:', error);
      return false;
    }

    return true;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      companyName: dbUser.company_name,
      verified: dbUser.verified,
      publicId: dbUser.public_id,
      rating: dbUser.rating,
      status: dbUser.status,
      kycStatus: dbUser.kyc_status,
      dateJoined: dbUser.date_joined
    };
  }

  private mapDbProductToProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      supplierId: dbProduct.supplier_id,
      name: dbProduct.name,
      description: dbProduct.description,
      category: dbProduct.category,
      image: dbProduct.image,
      status: dbProduct.status,
      costPrice: dbProduct.cost_price,
      sku: dbProduct.sku
    };
  }

  private mapDbRfqToRfq(dbRfq: any): RFQ {
    return {
      id: dbRfq.id,
      clientId: dbRfq.client_id,
      items: (dbRfq.rfq_items || []).map((item: any) => ({
        productId: item.product_id,
        quantity: item.quantity,
        notes: item.notes || ''
      })),
      status: dbRfq.status,
      date: dbRfq.date
    };
  }

  private mapDbQuoteToQuote(dbQuote: any): Quote {
    return {
      id: dbQuote.id,
      rfqId: dbQuote.rfq_id,
      supplierId: dbQuote.supplier_id,
      supplierPrice: dbQuote.supplier_price,
      leadTime: dbQuote.lead_time,
      marginPercent: dbQuote.margin_percent,
      finalPrice: dbQuote.final_price,
      status: dbQuote.status
    };
  }

  private mapDbOrderToOrder(dbOrder: any): Order {
    return {
      id: dbOrder.id,
      amount: dbOrder.amount,
      status: dbOrder.status,
      date: dbOrder.date
    };
  }
}

export const api = ApiService.getInstance();
