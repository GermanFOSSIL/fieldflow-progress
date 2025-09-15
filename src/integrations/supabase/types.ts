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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          boq_qty: number
          code: string
          created_at: string | null
          id: string
          name: string
          unit: string
          updated_at: string | null
          weight: number
          work_package_id: string | null
        }
        Insert: {
          boq_qty: number
          code: string
          created_at?: string | null
          id?: string
          name: string
          unit: string
          updated_at?: string | null
          weight?: number
          work_package_id?: string | null
        }
        Update: {
          boq_qty?: number
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          unit?: string
          updated_at?: string | null
          weight?: number
          work_package_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_work_package_id_fkey"
            columns: ["work_package_id"]
            isOneToOne: false
            referencedRelation: "work_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_progress_agg: {
        Row: {
          activity_id: string
          last_updated: string | null
          pct: number
          qty_accum: number
        }
        Insert: {
          activity_id: string
          last_updated?: string | null
          pct?: number
          qty_accum?: number
        }
        Update: {
          activity_id?: string
          last_updated?: string | null
          pct?: number
          qty_accum?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_progress_agg_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: true
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      areas: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          project_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          project_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor: string | null
          entity: string
          entity_id: string | null
          id: string
          meta: Json | null
          ts: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          entity: string
          entity_id?: string | null
          id?: string
          meta?: Json | null
          ts?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          meta?: Json | null
          ts?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_closures: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closed_date: string
          id: string
          project_id: string | null
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closed_date: string
          id?: string
          project_id?: string | null
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closed_date?: string
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_closures_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closures_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          approved_at: string | null
          created_at: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          notes: string | null
          project_id: string | null
          report_date: string
          reporter_id: string | null
          shift: string
          status: string | null
          supervisor_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          notes?: string | null
          project_id?: string | null
          report_date: string
          reporter_id?: string | null
          shift: string
          status?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          notes?: string | null
          project_id?: string | null
          report_date?: string
          reporter_id?: string | null
          shift?: string
          status?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      progress_entries: {
        Row: {
          activity_id: string | null
          comment: string | null
          created_at: string | null
          daily_report_id: string | null
          id: string
          photo_urls: string[] | null
          qty_today: number
          updated_at: string | null
        }
        Insert: {
          activity_id?: string | null
          comment?: string | null
          created_at?: string | null
          daily_report_id?: string | null
          id?: string
          photo_urls?: string[] | null
          qty_today?: number
          updated_at?: string | null
        }
        Update: {
          activity_id?: string | null
          comment?: string | null
          created_at?: string | null
          daily_report_id?: string | null
          id?: string
          photo_urls?: string[] | null
          qty_today?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_entries_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subsystems: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          system_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          system_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          system_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subsystems_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      systems: {
        Row: {
          area_id: string | null
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          area_id?: string | null
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          area_id?: string | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "systems_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      work_packages: {
        Row: {
          code: string
          contractor: string | null
          created_at: string | null
          id: string
          name: string
          subsystem_id: string | null
        }
        Insert: {
          code: string
          contractor?: string | null
          created_at?: string | null
          id?: string
          name: string
          subsystem_id?: string | null
        }
        Update: {
          code?: string
          contractor?: string | null
          created_at?: string | null
          id?: string
          name?: string
          subsystem_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_packages_subsystem_id_fkey"
            columns: ["subsystem_id"]
            isOneToOne: false
            referencedRelation: "subsystems"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_audit: {
        Args: {
          p_action: string
          p_entity: string
          p_entity_id: string
          p_meta?: Json
        }
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
