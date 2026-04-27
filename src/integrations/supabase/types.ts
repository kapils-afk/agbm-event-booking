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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          is_super_admin: boolean | null
          mobile: string
          name: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_super_admin?: boolean | null
          mobile: string
          name: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_super_admin?: boolean | null
          mobile?: string
          name?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          amount_in_words: string | null
          collected_by: string | null
          created_at: string
          donation_date: string
          donor_name: string
          id: string
          mobile: string | null
          notes: string | null
          pan: string | null
          payment_method: string
          purpose: string
          receipt_no: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          amount_in_words?: string | null
          collected_by?: string | null
          created_at?: string
          donation_date?: string
          donor_name: string
          id?: string
          mobile?: string | null
          notes?: string | null
          pan?: string | null
          payment_method: string
          purpose: string
          receipt_no: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_in_words?: string | null
          collected_by?: string | null
          created_at?: string
          donation_date?: string
          donor_name?: string
          id?: string
          mobile?: string | null
          notes?: string | null
          pan?: string | null
          payment_method?: string
          purpose?: string
          receipt_no?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          aadhaar: string | null
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          mobile: string
          name: string
          password_hash: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          aadhaar?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          mobile: string
          name: string
          password_hash: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          aadhaar?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          mobile?: string
          name?: string
          password_hash?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      office_bearers: {
        Row: {
          created_at: string
          designation: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          designation: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          designation?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trust_committee: {
        Row: {
          created_at: string
          designation: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          designation: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          designation?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          updated_at?: string
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
