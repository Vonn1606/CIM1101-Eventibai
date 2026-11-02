// This file is auto-generated. Run `npm run db:types` to regenerate.
// npx supabase gen types typescript --project-id ifuxpgeprlfsqqbkpxnq --schema public > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string
          role: "student" | "organizer" | "admin"
          student_number: string | null
          college_id: string | null
          department: string | null
          year_program: string | null
          phone: string | null
          is_online: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email: string
          role?: "student" | "organizer" | "admin"
          student_number?: string | null
          college_id?: string | null
          department?: string | null
          year_program?: string | null
          phone?: string | null
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string
          role?: "student" | "organizer" | "admin"
          student_number?: string | null
          college_id?: string | null
          department?: string | null
          year_program?: string | null
          phone?: string | null
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      colleges: {
        Row: {
          id: string
          slug: string
          code: string
          name: string
          short_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          code: string
          name: string
          short_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          code?: string
          name?: string
          short_name?: string | null
          created_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          short_name: string | null
          initials: string | null
          dept_label: string | null
          est_year: number | null
          college_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name?: string | null
          initials?: string | null
          dept_label?: string | null
          est_year?: number | null
          college_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string | null
          initials?: string | null
          dept_label?: string | null
          est_year?: number | null
          college_id?: string | null
          created_at?: string
        }
      }
      venues: {
        Row: {
          id: string
          name: string
          details: string | null
          capacity: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          details?: string | null
          capacity?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          details?: string | null
          capacity?: number | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          slug: string
          code: string | null
          title: string
          summary: string | null
          description: string[] | null
          category: string | null
          organization_id: string | null
          college_id: string | null
          venue_id: string | null
          starts_at: string | null
          ends_at: string | null
          total_capacity: number | null
          status: "draft" | "open" | "closed" | "suspended" | "concluded"
          approval: "pending" | "approved" | "rejected"
          is_featured: boolean
          featured_rank: number | null
          registration_deadline: string | null
          coordinator_name: string | null
          coordinator_email: string | null
          coordinator_phone: string | null
          banner_color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          code?: string | null
          title: string
          summary?: string | null
          description?: string[] | null
          category?: string | null
          organization_id?: string | null
          college_id?: string | null
          venue_id?: string | null
          starts_at?: string | null
          ends_at?: string | null
          total_capacity?: number | null
          status?: "draft" | "open" | "closed" | "suspended" | "concluded"
          approval?: "pending" | "approved" | "rejected"
          is_featured?: boolean
          featured_rank?: number | null
          registration_deadline?: string | null
          coordinator_name?: string | null
          coordinator_email?: string | null
          coordinator_phone?: string | null
          banner_color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          code?: string | null
          title?: string
          summary?: string | null
          description?: string[] | null
          category?: string | null
          organization_id?: string | null
          college_id?: string | null
          venue_id?: string | null
          starts_at?: string | null
          ends_at?: string | null
          total_capacity?: number | null
          status?: "draft" | "open" | "closed" | "suspended" | "concluded"
          approval?: "pending" | "approved" | "rejected"
          is_featured?: boolean
          featured_rank?: number | null
          registration_deadline?: string | null
          coordinator_name?: string | null
          coordinator_email?: string | null
          coordinator_phone?: string | null
          banner_color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_features: {
        Row: {
          id: string
          event_id: string
          title: string
          body: string | null
          icon_type: "maroon" | "green" | "amber"
          sort_order: number
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          body?: string | null
          icon_type?: "maroon" | "green" | "amber"
          sort_order?: number
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          body?: string | null
          icon_type?: "maroon" | "green" | "amber"
          sort_order?: number
        }
      }
      event_facilities: {
        Row: {
          id: string
          event_id: string
          name: string
          notes: string | null
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          notes?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          notes?: string | null
        }
      }
      event_documents: {
        Row: {
          id: string
          event_id: string
          label: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          label: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          label?: string
          url?: string
          created_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          ticket_code: string
          student_number: string | null
          college_id: string | null
          status: "registered" | "waitlisted" | "cancelled"
          registered_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          ticket_code?: string
          student_number?: string | null
          college_id?: string | null
          status?: "registered" | "waitlisted" | "cancelled"
          registered_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          ticket_code?: string
          student_number?: string | null
          college_id?: string | null
          status?: "registered" | "waitlisted" | "cancelled"
          registered_at?: string
        }
      }
      check_ins: {
        Row: {
          id: string
          registration_id: string
          checked_in_at: string
          method: "manual" | "qr" | "nfc"
          checked_in_by: string | null
        }
        Insert: {
          id?: string
          registration_id: string
          checked_in_at?: string
          method?: "manual" | "qr" | "nfc"
          checked_in_by?: string | null
        }
        Update: {
          id?: string
          registration_id?: string
          checked_in_at?: string
          method?: "manual" | "qr" | "nfc"
          checked_in_by?: string | null
        }
      }
      event_approvals: {
        Row: {
          id: string
          event_id: string
          submitted_by: string
          submitted_at: string
          decision: "pending" | "approved" | "rejected" | null
          decided_at: string | null
          reviewed_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          event_id: string
          submitted_by: string
          submitted_at?: string
          decision?: "pending" | "approved" | "rejected" | null
          decided_at?: string | null
          reviewed_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          submitted_by?: string
          submitted_at?: string
          decision?: "pending" | "approved" | "rejected" | null
          decided_at?: string | null
          reviewed_by?: string | null
          notes?: string | null
        }
      }
      broadcasts: {
        Row: {
          id: string
          event_id: string | null
          sent_by: string
          message: string
          channels: string[]
          sent_at: string
        }
        Insert: {
          id?: string
          event_id?: string | null
          sent_by: string
          message: string
          channels?: string[]
          sent_at?: string
        }
        Update: {
          id?: string
          event_id?: string | null
          sent_by?: string
          message?: string
          channels?: string[]
          sent_at?: string
        }
      }
      broadcast_deliveries: {
        Row: {
          id: string
          broadcast_id: string
          user_id: string
          channel: string
          status: string
          delivered_at: string | null
        }
        Insert: {
          id?: string
          broadcast_id: string
          user_id: string
          channel: string
          status?: string
          delivered_at?: string | null
        }
        Update: {
          id?: string
          broadcast_id?: string
          user_id?: string
          channel?: string
          status?: string
          delivered_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          link?: string | null
          read?: boolean
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          target_type: string | null
          target_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          target_type?: string | null
          target_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          target_type?: string | null
          target_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      admin_notes: {
        Row: {
          id: string
          event_id: string
          author_id: string
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          author_id: string
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          author_id?: string
          note?: string
          created_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string | null
          joined_at?: string
        }
      }
      gates: {
        Row: {
          id: string
          event_id: string
          label: string
          nfc_tag: string | null
        }
        Insert: {
          id?: string
          event_id: string
          label: string
          nfc_tag?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          label?: string
          nfc_tag?: string | null
        }
      }
      venue_closures: {
        Row: {
          id: string
          venue_id: string
          reason: string | null
          starts_at: string
          ends_at: string
        }
        Insert: {
          id?: string
          venue_id: string
          reason?: string | null
          starts_at: string
          ends_at: string
        }
        Update: {
          id?: string
          venue_id?: string
          reason?: string | null
          starts_at?: string
          ends_at?: string
        }
      }
    }
    Views: {
      event_stats: {
        Row: {
          event_id: string | null
          registered_count: number | null
          waitlisted_count: number | null
          checked_in_count: number | null
        }
      }
    }
    Functions: {
      register_for_event: {
        Args: {
          p_event_id: string
          p_user_id: string
          p_student_number: string
          p_college_id: string
        }
        Returns: {
          ticket_code: string
          status: string
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

