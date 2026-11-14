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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_notes: {
        Row: {
          author_id: string
          created_at: string
          event_id: string
          id: string
          note: string
        }
        Insert: {
          author_id: string
          created_at?: string
          event_id: string
          id?: string
          note: string
        }
        Update: {
          author_id?: string
          created_at?: string
          event_id?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "admin_notes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: number
          meta: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: never
          meta?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: never
          meta?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_deliveries: {
        Row: {
          broadcast_id: string
          channel: Database["public"]["Enums"]["broadcast_channel"]
          delivered_at: string | null
          id: string
          status: Database["public"]["Enums"]["delivery_status"]
          user_id: string
        }
        Insert: {
          broadcast_id: string
          channel: Database["public"]["Enums"]["broadcast_channel"]
          delivered_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          user_id: string
        }
        Update: {
          broadcast_id?: string
          channel?: Database["public"]["Enums"]["broadcast_channel"]
          delivered_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["delivery_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_deliveries_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          channels: Database["public"]["Enums"]["broadcast_channel"][]
          cohort_label: string
          event_id: string | null
          id: string
          message: string
          recipient_count: number
          sent_at: string
          sent_by: string
        }
        Insert: {
          channels?: Database["public"]["Enums"]["broadcast_channel"][]
          cohort_label: string
          event_id?: string | null
          id?: string
          message: string
          recipient_count?: number
          sent_at?: string
          sent_by: string
        }
        Update: {
          channels?: Database["public"]["Enums"]["broadcast_channel"][]
          cohort_label?: string
          event_id?: string | null
          id?: string
          message?: string
          recipient_count?: number
          sent_at?: string
          sent_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "broadcasts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          checked_in_at: string
          checked_in_by: string | null
          event_id: string
          gate_id: string | null
          id: string
          method: Database["public"]["Enums"]["checkin_method"]
          registration_id: string
        }
        Insert: {
          checked_in_at?: string
          checked_in_by?: string | null
          event_id: string
          gate_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["checkin_method"]
          registration_id: string
        }
        Update: {
          checked_in_at?: string
          checked_in_by?: string | null
          event_id?: string
          gate_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["checkin_method"]
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "check_ins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_gate_id_fkey"
            columns: ["gate_id"]
            isOneToOne: false
            referencedRelation: "gates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          code: string | null
          id: string
          name: string
          short_name: string
          slug: string
        }
        Insert: {
          code?: string | null
          id?: string
          name: string
          short_name: string
          slug: string
        }
        Update: {
          code?: string | null
          id?: string
          name?: string
          short_name?: string
          slug?: string
        }
        Relationships: []
      }
      event_approvals: {
        Row: {
          brief: string | null
          capacity_note: string | null
          decided_at: string | null
          decision: Database["public"]["Enums"]["approval_status"]
          decision_note: string | null
          event_id: string
          id: string
          reviewed_by: string | null
          risk: Database["public"]["Enums"]["risk_level"]
          safety_check: string | null
          seats_expected: number | null
          stage: string | null
          submitted_at: string
          submitted_by: string | null
        }
        Insert: {
          brief?: string | null
          capacity_note?: string | null
          decided_at?: string | null
          decision?: Database["public"]["Enums"]["approval_status"]
          decision_note?: string | null
          event_id: string
          id?: string
          reviewed_by?: string | null
          risk?: Database["public"]["Enums"]["risk_level"]
          safety_check?: string | null
          seats_expected?: number | null
          stage?: string | null
          submitted_at?: string
          submitted_by?: string | null
        }
        Update: {
          brief?: string | null
          capacity_note?: string | null
          decided_at?: string | null
          decision?: Database["public"]["Enums"]["approval_status"]
          decision_note?: string | null
          event_id?: string
          id?: string
          reviewed_by?: string | null
          risk?: Database["public"]["Enums"]["risk_level"]
          safety_check?: string | null
          seats_expected?: number | null
          stage?: string | null
          submitted_at?: string
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_approvals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_approvals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_approvals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_approvals_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_documents: {
        Row: {
          approval_id: string | null
          event_id: string
          file_url: string | null
          id: string
          kind: Database["public"]["Enums"]["doc_kind"]
          label: string
          uploaded_at: string
        }
        Insert: {
          approval_id?: string | null
          event_id: string
          file_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["doc_kind"]
          label: string
          uploaded_at?: string
        }
        Update: {
          approval_id?: string | null
          event_id?: string
          file_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["doc_kind"]
          label?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_documents_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "event_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_documents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_documents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_facilities: {
        Row: {
          event_id: string
          id: string
          label: string
          value: string
        }
        Insert: {
          event_id: string
          id?: string
          label: string
          value: string
        }
        Update: {
          event_id?: string
          id?: string
          label?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_facilities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_facilities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_features: {
        Row: {
          body: string
          event_id: string
          icon_type: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          body: string
          event_id: string
          icon_type?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          body?: string
          event_id?: string
          icon_type?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_features_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_features_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          approval: Database["public"]["Enums"]["approval_status"]
          banner_color: string | null
          banner_url: string | null
          category: string | null
          code: string | null
          college_id: string | null
          coordinator_email: string | null
          coordinator_name: string | null
          coordinator_phone: string | null
          coordinator_role: string | null
          created_at: string
          created_by: string | null
          description: string[]
          doors_open_note: string | null
          ends_at: string | null
          featured_rank: number | null
          id: string
          is_featured: boolean
          organization_id: string
          registration_deadline: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          summary: string | null
          tag: string | null
          tier: Database["public"]["Enums"]["access_tier"]
          title: string
          total_capacity: number
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          approval?: Database["public"]["Enums"]["approval_status"]
          banner_color?: string | null
          banner_url?: string | null
          category?: string | null
          code?: string | null
          college_id?: string | null
          coordinator_email?: string | null
          coordinator_name?: string | null
          coordinator_phone?: string | null
          coordinator_role?: string | null
          created_at?: string
          created_by?: string | null
          description?: string[]
          doors_open_note?: string | null
          ends_at?: string | null
          featured_rank?: number | null
          id?: string
          is_featured?: boolean
          organization_id: string
          registration_deadline?: string | null
          slug: string
          starts_at: string
          status?: Database["public"]["Enums"]["event_status"]
          summary?: string | null
          tag?: string | null
          tier?: Database["public"]["Enums"]["access_tier"]
          title: string
          total_capacity: number
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          approval?: Database["public"]["Enums"]["approval_status"]
          banner_color?: string | null
          banner_url?: string | null
          category?: string | null
          code?: string | null
          college_id?: string | null
          coordinator_email?: string | null
          coordinator_name?: string | null
          coordinator_phone?: string | null
          coordinator_role?: string | null
          created_at?: string
          created_by?: string | null
          description?: string[]
          doors_open_note?: string | null
          ends_at?: string | null
          featured_rank?: number | null
          id?: string
          is_featured?: boolean
          organization_id?: string
          registration_deadline?: string | null
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          summary?: string | null
          tag?: string | null
          tier?: Database["public"]["Enums"]["access_tier"]
          title?: string
          total_capacity?: number
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      gates: {
        Row: {
          id: string
          is_online: boolean
          name: string
          venue_id: string | null
        }
        Insert: {
          id?: string
          is_online?: boolean
          name: string
          venue_id?: string | null
        }
        Update: {
          id?: string
          is_online?: boolean
          name?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gates_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          organization_id: string
          position: string
          user_id: string
        }
        Insert: {
          organization_id: string
          position?: string
          user_id: string
        }
        Update: {
          organization_id?: string
          position?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          college_id: string | null
          created_at: string
          dept_label: string | null
          est_year: number | null
          id: string
          initials: string | null
          name: string
          short_name: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          dept_label?: string | null
          est_year?: number | null
          id?: string
          initials?: string | null
          name: string
          short_name?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
          dept_label?: string | null
          est_year?: number | null
          id?: string
          initials?: string | null
          name?: string
          short_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          college_id: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          is_online: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          student_number: string | null
          updated_at: string
          year_program: string | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id: string
          is_online?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          student_number?: string | null
          updated_at?: string
          year_program?: string | null
        }
        Update: {
          college_id?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_online?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          student_number?: string | null
          updated_at?: string
          year_program?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          college: string | null
          email: string
          event_id: string
          full_name: string
          id: string
          registered_at: string
          status: Database["public"]["Enums"]["registration_status"]
          student_number: string
          ticket_code: string
          user_id: string
          waitlist_pos: number | null
        }
        Insert: {
          college?: string | null
          email: string
          event_id: string
          full_name: string
          id?: string
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"]
          student_number: string
          ticket_code: string
          user_id: string
          waitlist_pos?: number | null
        }
        Update: {
          college?: string | null
          email?: string
          event_id?: string
          full_name?: string
          id?: string
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"]
          student_number?: string
          ticket_code?: string
          user_id?: string
          waitlist_pos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_closures: {
        Row: {
          ends_on: string
          id: string
          reason: string
          starts_on: string
          venue_id: string
        }
        Insert: {
          ends_on: string
          id?: string
          reason: string
          starts_on: string
          venue_id: string
        }
        Update: {
          ends_on?: string
          id?: string
          reason?: string
          starts_on?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_closures_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          capacity: number
          details: string | null
          id: string
          name: string
        }
        Insert: {
          capacity: number
          details?: string | null
          id?: string
          name: string
        }
        Update: {
          capacity?: number
          details?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      event_stats: {
        Row: {
          capacity_label: string | null
          checked_in_count: number | null
          event_id: string | null
          registered_count: number | null
          seats_left: number | null
          total_capacity: number | null
          waitlist_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_role_is: {
        Args: { r: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      decide_approval: {
        Args: {
          p_approval: string
          p_decision: Database["public"]["Enums"]["approval_status"]
          p_note: string | null
        }
        Returns: undefined
      }
      log_audit: {
        Args: {
          p_action: string
          p_entity: string
          p_entity_id: string
          p_meta?: Json | null
        }
        Returns: undefined
      }
      register_for_event: {
        Args: { p_college: string; p_event: string; p_student_number: string }
        Returns: {
          college: string | null
          email: string
          event_id: string
          full_name: string
          id: string
          registered_at: string
          status: Database["public"]["Enums"]["registration_status"]
          student_number: string
          ticket_code: string
          user_id: string
          waitlist_pos: number | null
        }
        SetofOptions: {
          from: "*"
          to: "registrations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      send_broadcast: {
        Args: {
          p_channels: Database["public"]["Enums"]["broadcast_channel"][]
          p_cohort: string
          p_event: string
          p_message: string
        }
        Returns: string
      }
      suspend_event: {
        Args: {
          p_event: string
          p_reason: string
        }
        Returns: undefined
      }
      user_owns_event: {
        Args: {
          p_event: string
        }
        Returns: boolean
      }
    }
    Enums: {
      access_tier: "free_rsvp" | "tiered_rsvp" | "ticketed" | "vip_only"
      approval_status: "pending" | "returned" | "approved" | "declined"
      broadcast_channel: "push" | "sms" | "discord"
      checkin_method: "qr" | "nfc" | "manual"
      delivery_status: "queued" | "delivered" | "failed"
      doc_kind: "document" | "endorsement"
      event_status:
        | "draft"
        | "scheduled"
        | "open"
        | "ongoing"
        | "completed"
        | "cancelled"
        | "suspended"
      registration_status: "registered" | "waitlisted" | "cancelled"
      risk_level: "low" | "standard" | "high" | "off_campus"
      user_role: "student" | "organizer" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      access_tier: ["free_rsvp", "tiered_rsvp", "ticketed", "vip_only"],
      approval_status: ["pending", "returned", "approved", "declined"],
      broadcast_channel: ["push", "sms", "discord"],
      checkin_method: ["qr", "nfc", "manual"],
      delivery_status: ["queued", "delivered", "failed"],
      doc_kind: ["document", "endorsement"],
      event_status: [
        "draft",
        "scheduled",
        "open",
        "ongoing",
        "completed",
        "cancelled",
        "suspended",
      ],
      registration_status: ["registered", "waitlisted", "cancelled"],
      risk_level: ["low", "standard", "high", "off_campus"],
      user_role: ["student", "organizer", "admin"],
    },
  },
} as const
