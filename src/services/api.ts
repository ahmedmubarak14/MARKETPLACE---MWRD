// API Service Layer
// In a production environment, this would make actual HTTP requests
// For MVP, we're using the Zustand store as our "backend"

import { User, Product, RFQ, Quote, UserRole } from '../types/types';

export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Simulate API delay
  private delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await this.delay();
    // In production, this would be a real API call
    // For now, we accept any password for demo users
    return { success: true };
  }

  async logout(): Promise<void> {
    await this.delay();
  }

  // Products
  async getProducts(): Promise<Product[]> {
    await this.delay();
    return [];
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    await this.delay();
    return { ...product, id: `p${Date.now()}` };
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await this.delay();
    return { id, ...updates } as Product;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.delay();
  }

  // RFQs
  async getRFQs(): Promise<RFQ[]> {
    await this.delay();
    return [];
  }

  async createRFQ(rfq: Omit<RFQ, 'id'>): Promise<RFQ> {
    await this.delay();
    return { ...rfq, id: `r${Date.now()}` };
  }

  async updateRFQ(id: string, updates: Partial<RFQ>): Promise<RFQ> {
    await this.delay();
    return { id, ...updates } as RFQ;
  }

  // Quotes
  async getQuotes(): Promise<Quote[]> {
    await this.delay();
    return [];
  }

  async createQuote(quote: Omit<Quote, 'id'>): Promise<Quote> {
    await this.delay();
    return { ...quote, id: `q${Date.now()}` };
  }

  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
    await this.delay();
    return { id, ...updates } as Quote;
  }
}

export const api = ApiService.getInstance();
