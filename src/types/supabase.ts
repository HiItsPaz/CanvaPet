export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      customization_options: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          thumbnail_url: string | null
          type: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          thumbnail_url?: string | null
          type: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          thumbnail_url?: string | null
          type?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string
          created_at: string | null
          email: string | null
          id: string
          page_url: string | null
          rating: number | null
          status: string
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          email?: string | null
          id?: string
          page_url?: string | null
          rating?: number | null
          status?: string
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          email?: string | null
          id?: string
          page_url?: string | null
          rating?: number | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      merchandise: {
        Row: {
          base_price: number
          created_at: string | null
          description: string | null
          dimensions: string | null
          id: string
          is_active: boolean | null
          name: string
          provider_id: string | null
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          provider_id?: string | null
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider_id?: string | null
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          customization_details: Json | null
          id: string
          merchandise_id: string | null
          order_id: string
          portrait_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          customization_details?: Json | null
          id?: string
          merchandise_id?: string | null
          order_id: string
          portrait_id?: string | null
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          customization_details?: Json | null
          id?: string
          merchandise_id?: string | null
          order_id?: string
          portrait_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_merchandise_id_fkey"
            columns: ["merchandise_id"]
            isOneToOne: false
            referencedRelation: "merchandise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_portrait_id_fkey"
            columns: ["portrait_id"]
            isOneToOne: false
            referencedRelation: "portraits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_portrait_id_fkey"
            columns: ["portrait_id"]
            isOneToOne: false
            referencedRelation: "portraits_legacy_view"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          currency: string
          id: string
          notes: string | null
          payment_gateway: string | null
          payment_intent_id: string | null
          shipping_address: Json | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_postal_code: string | null
          shipping_state: string | null
          shipping_street: string | null
          status: string
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          currency?: string
          id?: string
          notes?: string | null
          payment_gateway?: string | null
          payment_intent_id?: string | null
          shipping_address?: Json | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          shipping_street?: string | null
          status?: string
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          currency?: string
          id?: string
          notes?: string | null
          payment_gateway?: string | null
          payment_intent_id?: string | null
          shipping_address?: Json | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          shipping_street?: string | null
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pet_statistics: {
        Row: {
          created_at: string | null
          latest_portrait_date: string | null
          total_pets: number | null
          total_portraits: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          latest_portrait_date?: string | null
          total_pets?: number | null
          total_portraits?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          latest_portrait_date?: string | null
          total_pets?: number | null
          total_portraits?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          additional_image_urls: string[] | null
          age_years: number | null
          breed: string | null
          coat_color: string | null
          coat_type: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          original_image_url: string | null
          size: string | null
          species: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_image_urls?: string[] | null
          age_years?: number | null
          breed?: string | null
          coat_color?: string | null
          coat_type?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          original_image_url?: string | null
          size?: string | null
          species: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_image_urls?: string[] | null
          age_years?: number | null
          breed?: string | null
          coat_color?: string | null
          coat_type?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          original_image_url?: string | null
          size?: string | null
          species?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portrait_customization_options_applied: {
        Row: {
          applied_at: string | null
          customization_option_id: string
          portrait_id: string
        }
        Insert: {
          applied_at?: string | null
          customization_option_id: string
          portrait_id: string
        }
        Update: {
          applied_at?: string | null
          customization_option_id?: string
          portrait_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portrait_customization_options_app_customization_option_id_fkey"
            columns: ["customization_option_id"]
            isOneToOne: false
            referencedRelation: "customization_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portrait_customization_options_applied_portrait_id_fkey"
            columns: ["portrait_id"]
            isOneToOne: false
            referencedRelation: "portraits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portrait_customization_options_applied_portrait_id_fkey"
            columns: ["portrait_id"]
            isOneToOne: false
            referencedRelation: "portraits_legacy_view"
            referencedColumns: ["id"]
          },
        ]
      }
      portraits: {
        Row: {
          created_at: string | null
          customization_params: Json | null
          generated_image_url: string | null
          generation_time_seconds: number | null
          id: string
          image_url: string | null
          input_image_url: string
          is_public: boolean | null
          pet_id: string
          status: string
          style_id: string | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customization_params?: Json | null
          generated_image_url?: string | null
          generation_time_seconds?: number | null
          id?: string
          image_url?: string | null
          input_image_url: string
          is_public?: boolean | null
          pet_id: string
          status?: string
          style_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customization_params?: Json | null
          generated_image_url?: string | null
          generation_time_seconds?: number | null
          id?: string
          image_url?: string | null
          input_image_url?: string
          is_public?: boolean | null
          pet_id?: string
          status?: string
          style_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portraits_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portraits_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "styles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      styles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          prompt_template: string | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          prompt_template?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          prompt_template?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      portraits_legacy_view: {
        Row: {
          created_at: string | null
          customization_params: Json | null
          generated_image_url: string | null
          generation_time_seconds: number | null
          id: string | null
          input_image_url: string | null
          is_public: boolean | null
          pet_id: string | null
          status: string | null
          style_id: string | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customization_params?: Json | null
          generated_image_url?: string | null
          generation_time_seconds?: number | null
          id?: string | null
          input_image_url?: string | null
          is_public?: boolean | null
          pet_id?: string | null
          status?: string | null
          style_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customization_params?: Json | null
          generated_image_url?: string | null
          generation_time_seconds?: number | null
          id?: string | null
          input_image_url?: string | null
          is_public?: boolean | null
          pet_id?: string | null
          status?: string | null
          style_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portraits_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portraits_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "styles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      deactivate_user_data: {
        Args: { user_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

