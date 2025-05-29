import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: "admin" | "mr" | "warehouse"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: "admin" | "mr" | "warehouse"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: "admin" | "mr" | "warehouse"
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          unit: string
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          category: string
          unit: string
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          unit?: string
          price?: number
          updated_at?: string
        }
      }
      batches: {
        Row: {
          id: string
          product_id: string
          batch_number: string
          manufacturing_date: string
          expiry_date: string
          quantity: number
          remaining_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          batch_number: string
          manufacturing_date: string
          expiry_date: string
          quantity: number
          remaining_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          batch_number?: string
          manufacturing_date?: string
          expiry_date?: string
          quantity?: number
          remaining_quantity?: number
          updated_at?: string
        }
      }
      stock_transactions: {
        Row: {
          id: string
          type: "stock_in" | "stock_transfer" | "godown_sale" | "mr_sale" | "return" | "adjustment"
          product_id: string
          batch_id: string
          quantity: number
          from_location: string | null
          to_location: string | null
          user_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: "stock_in" | "stock_transfer" | "godown_sale" | "mr_sale" | "return" | "adjustment"
          product_id: string
          batch_id: string
          quantity: number
          from_location?: string | null
          to_location?: string | null
          user_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: "stock_in" | "stock_transfer" | "godown_sale" | "mr_sale" | "return" | "adjustment"
          product_id?: string
          batch_id?: string
          quantity?: number
          from_location?: string | null
          to_location?: string | null
          user_id?: string
          notes?: string | null
        }
      }
    }
  }
}
