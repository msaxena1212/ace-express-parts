export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          area: string | null
          city: string
          created_at: string
          full_address: string
          id: string
          is_default: boolean | null
          label: string
          phone: string
          pincode: string
          recipient_name: string | null
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: string | null
          city: string
          created_at?: string
          full_address: string
          id?: string
          is_default?: boolean | null
          label?: string
          phone: string
          pincode: string
          recipient_name?: string | null
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string | null
          city?: string
          created_at?: string
          full_address?: string
          id?: string
          is_default?: boolean | null
          label?: string
          phone?: string
          pincode?: string
          recipient_name?: string | null
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dealer_customers: {
        Row: {
          created_at: string
          customer_id: string
          customer_name: string | null
          customer_phone: string | null
          dealer_id: string
          id: string
          last_order_date: string | null
          lifetime_value: number | null
          status: string | null
          total_orders: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          customer_name?: string | null
          customer_phone?: string | null
          dealer_id: string
          id?: string
          last_order_date?: string | null
          lifetime_value?: number | null
          status?: string | null
          total_orders?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          customer_name?: string | null
          customer_phone?: string | null
          dealer_id?: string
          id?: string
          last_order_date?: string | null
          lifetime_value?: number | null
          status?: string | null
          total_orders?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealer_customers_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_inventory: {
        Row: {
          created_at: string
          dealer_id: string
          id: string
          last_restocked: string | null
          min_threshold: number | null
          product_id: string
          reorder_quantity: number | null
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dealer_id: string
          id?: string
          last_restocked?: string | null
          min_threshold?: number | null
          product_id: string
          reorder_quantity?: number | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dealer_id?: string
          id?: string
          last_restocked?: string | null
          min_threshold?: number | null
          product_id?: string
          reorder_quantity?: number | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealer_inventory_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_metrics: {
        Row: {
          average_order_value: number | null
          created_at: string
          customer_satisfaction_rating: number | null
          dealer_id: string
          id: string
          new_customers: number | null
          on_time_delivery_rate: number | null
          orders_cancelled: number | null
          period_end: string
          period_start: string
          repeat_customers: number | null
          total_orders: number | null
          total_revenue: number | null
        }
        Insert: {
          average_order_value?: number | null
          created_at?: string
          customer_satisfaction_rating?: number | null
          dealer_id: string
          id?: string
          new_customers?: number | null
          on_time_delivery_rate?: number | null
          orders_cancelled?: number | null
          period_end: string
          period_start: string
          repeat_customers?: number | null
          total_orders?: number | null
          total_revenue?: number | null
        }
        Update: {
          average_order_value?: number | null
          created_at?: string
          customer_satisfaction_rating?: number | null
          dealer_id?: string
          id?: string
          new_customers?: number | null
          on_time_delivery_rate?: number | null
          orders_cancelled?: number | null
          period_end?: string
          period_start?: string
          repeat_customers?: number | null
          total_orders?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_metrics_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_offers: {
        Row: {
          applicable_categories: string[] | null
          applicable_products: string[] | null
          created_at: string
          current_redemptions: number | null
          dealer_id: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          max_redemptions: number | null
          min_order_value: number | null
          name: string
          start_date: string
          terms_conditions: string | null
          updated_at: string
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          created_at?: string
          current_redemptions?: number | null
          dealer_id: string
          description?: string | null
          discount_type?: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          min_order_value?: number | null
          name: string
          start_date: string
          terms_conditions?: string | null
          updated_at?: string
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          created_at?: string
          current_redemptions?: number | null
          dealer_id?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          min_order_value?: number | null
          name?: string
          start_date?: string
          terms_conditions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealer_offers_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealers: {
        Row: {
          contact_person: string | null
          created_at: string
          dealer_code: string | null
          email: string | null
          firm_name: string
          gst_number: string | null
          id: string
          location: string | null
          phone: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_person?: string | null
          created_at?: string
          dealer_code?: string | null
          email?: string | null
          firm_name: string
          gst_number?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_person?: string | null
          created_at?: string
          dealer_code?: string | null
          email?: string | null
          firm_name?: string
          gst_number?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_total: number
          order_id: string
          part_number: string | null
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_total: number
          order_id: string
          part_number?: string | null
          product_id: string
          product_name: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_total?: number
          order_id?: string
          part_number?: string | null
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          carrier: string | null
          created_at: string
          delivered_date: string | null
          delivery_address_id: string | null
          delivery_fee: number | null
          delivery_type: string | null
          discount_amount: number | null
          estimated_delivery: string | null
          gst_amount: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          promo_code: string | null
          shipped_date: string | null
          status: string
          subtotal: number
          total_amount: number
          tracking_number: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          delivered_date?: string | null
          delivery_address_id?: string | null
          delivery_fee?: number | null
          delivery_type?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          gst_amount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          promo_code?: string | null
          shipped_date?: string | null
          status?: string
          subtotal?: number
          total_amount?: number
          tracking_number?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          delivered_date?: string | null
          delivery_address_id?: string | null
          delivery_fee?: number | null
          delivery_type?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          gst_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          promo_code?: string | null
          shipped_date?: string | null
          status?: string
          subtotal?: number
          total_amount?: number
          tracking_number?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
          user_name: string
          verified_purchase: boolean | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
          user_name: string
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          user_name?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          average_rating: number | null
          badges: string[] | null
          brand: string | null
          category: string
          compatibility: Json | null
          created_at: string
          description: string | null
          discount_percentage: number | null
          discount_type: string | null
          fast_track_available: boolean | null
          fast_track_fee: number | null
          fast_track_hours: string | null
          free_shipping_threshold: number | null
          id: string
          images: Json | null
          is_active: boolean | null
          keywords: string[] | null
          low_stock_threshold: number | null
          mrp: number
          name: string
          offer_end_date: string | null
          part_number: string
          rating_distribution: Json | null
          reorder_quantity: number | null
          return_policy: string | null
          seller_id: string | null
          seller_name: string | null
          seller_verified: boolean | null
          selling_price: number
          sku: string | null
          slug: string | null
          specifications: Json | null
          standard_delivery_days: string | null
          stock_quantity: number | null
          stock_status: string | null
          subcategory: string | null
          total_reviews: number | null
          updated_at: string
          warranty_info: string | null
        }
        Insert: {
          average_rating?: number | null
          badges?: string[] | null
          brand?: string | null
          category: string
          compatibility?: Json | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          discount_type?: string | null
          fast_track_available?: boolean | null
          fast_track_fee?: number | null
          fast_track_hours?: string | null
          free_shipping_threshold?: number | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          keywords?: string[] | null
          low_stock_threshold?: number | null
          mrp: number
          name: string
          offer_end_date?: string | null
          part_number: string
          rating_distribution?: Json | null
          reorder_quantity?: number | null
          return_policy?: string | null
          seller_id?: string | null
          seller_name?: string | null
          seller_verified?: boolean | null
          selling_price: number
          sku?: string | null
          slug?: string | null
          specifications?: Json | null
          standard_delivery_days?: string | null
          stock_quantity?: number | null
          stock_status?: string | null
          subcategory?: string | null
          total_reviews?: number | null
          updated_at?: string
          warranty_info?: string | null
        }
        Update: {
          average_rating?: number | null
          badges?: string[] | null
          brand?: string | null
          category?: string
          compatibility?: Json | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          discount_type?: string | null
          fast_track_available?: boolean | null
          fast_track_fee?: number | null
          fast_track_hours?: string | null
          free_shipping_threshold?: number | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          keywords?: string[] | null
          low_stock_threshold?: number | null
          mrp?: number
          name?: string
          offer_end_date?: string | null
          part_number?: string
          rating_distribution?: Json | null
          reorder_quantity?: number | null
          return_policy?: string | null
          seller_id?: string | null
          seller_name?: string | null
          seller_verified?: boolean | null
          selling_price?: number
          sku?: string | null
          slug?: string | null
          specifications?: Json | null
          standard_delivery_days?: string | null
          stock_quantity?: number | null
          stock_status?: string | null
          subcategory?: string | null
          total_reviews?: number | null
          updated_at?: string
          warranty_info?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_profile_complete: boolean | null
          location: string | null
          phone: string | null
          pincode: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_profile_complete?: boolean | null
          location?: string | null
          phone?: string | null
          pincode?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_profile_complete?: boolean | null
          location?: string | null
          phone?: string | null
          pincode?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          actual_cost: number | null
          assigned_dealer_id: string | null
          created_at: string
          description: string | null
          equipment_id: string | null
          estimated_cost: number | null
          id: string
          preferred_date: string | null
          preferred_time_slot: string | null
          priority: string | null
          service_type: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          assigned_dealer_id?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          estimated_cost?: number | null
          id?: string
          preferred_date?: string | null
          preferred_time_slot?: string | null
          priority?: string | null
          service_type?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          assigned_dealer_id?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          estimated_cost?: number | null
          id?: string
          preferred_date?: string | null
          preferred_time_slot?: string | null
          priority?: string | null
          service_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "user_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      user_equipment: {
        Row: {
          created_at: string
          equipment_type: string | null
          id: string
          image_url: string | null
          last_service_date: string | null
          model: string
          name: string
          next_service_due: string | null
          serial_number: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          equipment_type?: string | null
          id?: string
          image_url?: string | null
          last_service_date?: string | null
          model: string
          name: string
          next_service_due?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          equipment_type?: string | null
          id?: string
          image_url?: string | null
          last_service_date?: string | null
          model?: string
          name?: string
          next_service_due?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "dealer" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "dealer", "customer"],
    },
  },
} as const
