export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          about: Json
          accent_color: string | null
          avatar_url: string | null
          banner: Json
          booking_mode: string
          booking_url: string | null
          category: string | null
          contact: Json
          created_at: string
          handle: string
          id: string
          media: Json
          name: string | null
          slogan: string | null
          socials: Json
          status: string
          theme_mode: string
          updated_at: string
          user_id: string
          use_whatsapp: boolean | null
          whatsapp_number: string | null
          footer: Json
          preview_expires_at: string | null
          preview_started_at: string | null
          footer_business_name: string | null
          footer_address: string | null
          footer_email: string | null
          footer_phone: string | null
          footer_hours: Json | null
          footer_next_available: string | null
          footer_cancellation_policy: string | null
          footer_privacy_policy: string | null
          footer_terms_of_service: string | null
          footer_show_maps: boolean | null
          footer_show_attribution: boolean | null
          testimonials: Json | null
          subscription_id: string | null
          trial_start_date: string | null
          trial_end_date: string | null
          grace_period_ends_at: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          subscription_status: string | null
        }
        Insert: {
          about?: Json
          accent_color?: string | null
          avatar_url?: string | null
          banner?: Json
          booking_mode?: string
          booking_url?: string | null
          category?: string | null
          contact?: Json
          created_at?: string
          handle: string
          id?: string
          media?: Json
          name?: string | null
          slogan?: string | null
          socials?: Json
          status?: string
          theme_mode?: string
          updated_at?: string
          user_id: string
          use_whatsapp?: boolean | null
          whatsapp_number?: string | null
          footer?: Json
          preview_expires_at?: string | null
          preview_started_at?: string | null
          footer_business_name?: string | null
          footer_address?: string | null
          footer_email?: string | null
          footer_phone?: string | null
          footer_hours?: Json | null
          footer_next_available?: string | null
          footer_cancellation_policy?: string | null
          footer_privacy_policy?: string | null
          footer_terms_of_service?: string | null
          footer_show_maps?: boolean | null
          footer_show_attribution?: boolean | null
          testimonials?: Json | null
          subscription_id?: string | null
          trial_start_date?: string | null
          trial_end_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          subscription_status?: string | null
        }
        Update: {
          about?: Json
          accent_color?: string | null
          avatar_url?: string | null
          banner?: Json
          booking_mode?: string
          booking_url?: string | null
          category?: string | null
          contact?: Json
          created_at?: string
          handle?: string
          id?: string
          media?: Json
          name?: string | null
          slogan?: string | null
          socials?: Json
          status?: string
          theme_mode?: string
          updated_at?: string
          user_id?: string
          use_whatsapp?: boolean | null
          whatsapp_number?: string | null
          footer?: Json
          preview_expires_at?: string | null
          preview_started_at?: string | null
          footer_business_name?: string | null
          footer_address?: string | null
          footer_email?: string | null
          footer_phone?: string | null
          footer_hours?: Json | null
          footer_next_available?: string | null
          footer_cancellation_policy?: string | null
          footer_privacy_policy?: string | null
          footer_terms_of_service?: string | null
          footer_show_maps?: boolean | null
          footer_show_attribution?: boolean | null
          testimonials?: Json | null
          subscription_id?: string | null
          trial_start_date?: string | null
          trial_end_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          subscription_status?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          profile_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          id: string
          profile_id: string | null
          stripe_payment_method_id: string | null
          type: string | null
          last4: string | null
          brand: string | null
          exp_month: number | null
          exp_year: number | null
          country: string | null
          is_default: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id?: string | null
          stripe_payment_method_id?: string | null
          type?: string | null
          last4?: string | null
          brand?: string | null
          exp_month?: number | null
          exp_year?: number | null
          country?: string | null
          is_default?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string | null
          stripe_payment_method_id?: string | null
          type?: string | null
          last4?: string | null
          brand?: string | null
          exp_year?: number | null
          exp_month?: number | null
          country?: string | null
          is_default?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          profile_id: string
          stripe_invoice_id: string | null
          amount: number | null
          currency: string | null
          status: string | null
          due_date: string | null
          paid_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          stripe_invoice_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: string | null
          due_date?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          stripe_invoice_id?: string | null
          amount?: number | null
          currency?: string | null
          status?: string | null
          due_date?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
