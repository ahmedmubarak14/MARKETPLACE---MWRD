// Supabase Database Types
// This file defines the TypeScript types for our Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'GUEST' | 'CLIENT' | 'SUPPLIER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUIRES_ATTENTION' | 'DEACTIVATED'
export type KycStatus = 'VERIFIED' | 'IN_REVIEW' | 'REJECTED' | 'INCOMPLETE'
export type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type RfqStatus = 'OPEN' | 'QUOTED' | 'CLOSED'
export type QuoteStatus = 'PENDING_ADMIN' | 'SENT_TO_CLIENT' | 'ACCEPTED' | 'REJECTED'
export type OrderStatus = 'In Transit' | 'Delivered' | 'Cancelled'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: UserRole
          company_name: string
          verified: boolean
          public_id: string | null
          rating: number | null
          status: UserStatus | null
          kyc_status: KycStatus | null
          date_joined: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: UserRole
          company_name: string
          verified?: boolean
          public_id?: string | null
          rating?: number | null
          status?: UserStatus | null
          kyc_status?: KycStatus | null
          date_joined?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: UserRole
          company_name?: string
          verified?: boolean
          public_id?: string | null
          rating?: number | null
          status?: UserStatus | null
          kyc_status?: KycStatus | null
          date_joined?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          supplier_id: string
          name: string
          description: string
          category: string
          image: string
          status: ProductStatus
          cost_price: number | null
          sku: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          name: string
          description: string
          category: string
          image: string
          status?: ProductStatus
          cost_price?: number | null
          sku?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          name?: string
          description?: string
          category?: string
          image?: string
          status?: ProductStatus
          cost_price?: number | null
          sku?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rfqs: {
        Row: {
          id: string
          client_id: string
          status: RfqStatus
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          status?: RfqStatus
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          status?: RfqStatus
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      rfq_items: {
        Row: {
          id: string
          rfq_id: string
          product_id: string
          quantity: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          rfq_id: string
          product_id: string
          quantity: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          rfq_id?: string
          product_id?: string
          quantity?: number
          notes?: string | null
          created_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          rfq_id: string
          supplier_id: string
          supplier_price: number
          lead_time: string
          margin_percent: number
          final_price: number
          status: QuoteStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rfq_id: string
          supplier_id: string
          supplier_price: number
          lead_time: string
          margin_percent?: number
          final_price?: number
          status?: QuoteStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rfq_id?: string
          supplier_id?: string
          supplier_price?: number
          lead_time?: string
          margin_percent?: number
          final_price?: number
          status?: QuoteStatus
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          quote_id: string | null
          client_id: string
          supplier_id: string
          amount: number
          status: OrderStatus
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_id?: string | null
          client_id: string
          supplier_id: string
          amount: number
          status?: OrderStatus
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote_id?: string | null
          client_id?: string
          supplier_id?: string
          amount?: number
          status?: OrderStatus
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      margin_settings: {
        Row: {
          id: string
          category: string | null
          margin_percent: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category?: string | null
          margin_percent: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string | null
          margin_percent?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_public_id: {
        Args: { prefix: string }
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
      user_status: UserStatus
      kyc_status: KycStatus
      product_status: ProductStatus
      rfq_status: RfqStatus
      quote_status: QuoteStatus
      order_status: OrderStatus
    }
  }
}
