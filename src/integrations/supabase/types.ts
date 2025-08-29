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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          due_date: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_pdf_url: string | null
          paid_at: string | null
          profile_id: string | null
          status: string | null
          stripe_invoice_id: string | null
          subscription_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          paid_at?: string | null
          profile_id?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          paid_at?: string | null
          profile_id?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          brand: string | null
          country: string | null
          created_at: string | null
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean | null
          last4: string | null
          profile_id: string | null
          stripe_payment_method_id: string | null
          subscription_id: string | null
          type: string | null
        }
        Insert: {
          brand?: string | null
          country?: string | null
          created_at?: string | null
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          profile_id?: string | null
          stripe_payment_method_id?: string | null
          subscription_id?: string | null
          type?: string | null
        }
        Update: {
          brand?: string | null
          country?: string | null
          created_at?: string | null
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          profile_id?: string | null
          stripe_payment_method_id?: string | null
          subscription_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_methods_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: Json
          accent_color: string | null
          avatar_url: string | null
          banner: Json
          banner_url: string | null
          booking_mode: string
          booking_url: string | null
          category: string | null
          contact: Json
          created_at: string
          footer: Json
          footer_address: string | null
          footer_business_name: string | null
          footer_cancellation_policy: string | null
          footer_email: string | null
          footer_hours: Json | null
          footer_next_available: string | null
          footer_phone: string | null
          footer_privacy_policy: string | null
          footer_show_attribution: boolean | null
          footer_show_maps: boolean | null
          footer_terms_of_service: string | null
          grace_period_ends_at: string | null
          handle: string | null
          id: string
          is_business: boolean | null
          media: Json
          name: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          preview_expires_at: string | null
          preview_started_at: string | null
          slogan: string | null
          socials: Json
          status: string
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          testimonials: Json | null
          theme_mode: string
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          use_whatsapp: boolean | null
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          about?: Json
          accent_color?: string | null
          avatar_url?: string | null
          banner?: Json
          banner_url?: string | null
          booking_mode?: string
          booking_url?: string | null
          category?: string | null
          contact?: Json
          created_at?: string
          footer?: Json
          footer_address?: string | null
          footer_business_name?: string | null
          footer_cancellation_policy?: string | null
          footer_email?: string | null
          footer_hours?: Json | null
          footer_next_available?: string | null
          footer_phone?: string | null
          footer_privacy_policy?: string | null
          footer_show_attribution?: boolean | null
          footer_show_maps?: boolean | null
          footer_terms_of_service?: string | null
          grace_period_ends_at?: string | null
          handle?: string | null
          id?: string
          is_business?: boolean | null
          media?: Json
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preview_expires_at?: string | null
          preview_started_at?: string | null
          slogan?: string | null
          socials?: Json
          status?: string
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          testimonials?: Json | null
          theme_mode?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          use_whatsapp?: boolean | null
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          about?: Json
          accent_color?: string | null
          avatar_url?: string | null
          banner?: Json
          banner_url?: string | null
          booking_mode?: string
          booking_url?: string | null
          category?: string | null
          contact?: Json
          created_at?: string
          footer?: Json
          footer_address?: string | null
          footer_business_name?: string | null
          footer_cancellation_policy?: string | null
          footer_email?: string | null
          footer_hours?: Json | null
          footer_next_available?: string | null
          footer_phone?: string | null
          footer_privacy_policy?: string | null
          footer_show_attribution?: boolean | null
          footer_show_maps?: boolean | null
          footer_terms_of_service?: string | null
          grace_period_ends_at?: string | null
          handle?: string | null
          id?: string
          is_business?: boolean | null
          media?: Json
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preview_expires_at?: string | null
          preview_started_at?: string | null
          slogan?: string | null
          socials?: Json
          status?: string
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          testimonials?: Json | null
          theme_mode?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          use_whatsapp?: boolean | null
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          created: string | null
          event_id: string
          raw: Json | null
          type: string | null
        }
        Insert: {
          created?: string | null
          event_id: string
          raw?: Json | null
          type?: string | null
        }
        Update: {
          created?: string | null
          event_id?: string
          raw?: Json | null
          type?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          profile_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          profile_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          profile_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_handle_available: {
        Args: { handle_to_check: string; user_id_to_exclude?: string }
        Returns: boolean
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
    Enums: {},
  },
} as const
