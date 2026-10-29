export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          first_name?: string
          last_name?: string
          email?: string
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          project_code: string
          name: string
          address: string
          lat: number
          lng: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          project_code: string
          name: string
          address?: string
          lat: number
          lng: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          project_code?: string
          name?: string
          address?: string
          lat?: number
          lng?: number
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      toolbox_sessions: {
        Row: {
          id: string
          project_id: string
          date_of_application: string
          time_of_application: string
          permit_receiver: string
          contractor_company_name: string
          site_address_name: string
          work_type: 'ground' | 'arboreal'
          required_ppe: string[]
          camera_device_id: string | null
          camera_label: string | null
          created_at: string
          ended_at: string | null
          created_by: string
        }
        Insert: {
          id?: string
          project_id: string
          date_of_application: string
          time_of_application: string
          permit_receiver?: string
          contractor_company_name?: string
          site_address_name?: string
          work_type: 'ground' | 'arboreal'
          required_ppe?: string[]
          camera_device_id?: string | null
          camera_label?: string | null
          created_at?: string
          ended_at?: string | null
          created_by: string
        }
        Update: {
          id?: string
          project_id?: string
          date_of_application?: string
          time_of_application?: string
          permit_receiver?: string
          contractor_company_name?: string
          site_address_name?: string
          work_type?: 'ground' | 'arboreal'
          required_ppe?: string[]
          camera_device_id?: string | null
          camera_label?: string | null
          created_at?: string
          ended_at?: string | null
          created_by?: string
        }
        Relationships: []
      }
      session_workers: {
        Row: {
          id: string
          session_id: string
          name: string
          position: string
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          position: string
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          position?: string
        }
        Relationships: []
      }
      snapshots: {
        Row: {
          id: string
          session_id: string
          snapshot_code: string
          preview_path: string | null
          image_path: string | null
          captured_date: string | null
          captured_time: string | null
          violation_count: number
          status: 'compliant' | 'non_compliant' | 'needs_checking'
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          snapshot_code: string
          preview_path?: string | null
          image_path?: string | null
          captured_date?: string | null
          captured_time?: string | null
          violation_count?: number
          status?: 'compliant' | 'non_compliant' | 'needs_checking'
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          snapshot_code?: string
          preview_path?: string | null
          image_path?: string | null
          captured_date?: string | null
          captured_time?: string | null
          violation_count?: number
          status?: 'compliant' | 'non_compliant' | 'needs_checking'
          created_at?: string
        }
        Relationships: []
      }
      snapshot_people: {
        Row: {
          id: string
          snapshot_id: string
          label: string
          status: 'compliant' | 'non_compliant' | 'needs_checking'
          box: Json | null
        }
        Insert: {
          id?: string
          snapshot_id: string
          label: string
          status?: 'compliant' | 'non_compliant' | 'needs_checking'
          box?: Json | null
        }
        Update: {
          id?: string
          snapshot_id?: string
          label?: string
          status?: 'compliant' | 'non_compliant' | 'needs_checking'
          box?: Json | null
        }
        Relationships: []
      }
      ppe_detections: {
        Row: {
          id: string
          person_id: string
          label: string
          detected: boolean
          confidence: number | null
          required_count: number | null
          detected_count: number | null
          box: Json | null
        }
        Insert: {
          id?: string
          person_id: string
          label: string
          detected?: boolean
          confidence?: number | null
          required_count?: number | null
          detected_count?: number | null
          box?: Json | null
        }
        Update: {
          id?: string
          person_id?: string
          label?: string
          detected?: boolean
          confidence?: number | null
          required_count?: number | null
          detected_count?: number | null
          box?: Json | null
        }
        Relationships: []
      }
      worker_reports: {
        Row: {
          id: string
          snapshot_id: string
          reported_by: string
          person_label: string
          person_detection_id: string
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          snapshot_id: string
          reported_by: string
          person_label: string
          person_detection_id: string
          reason?: string
          created_at?: string
        }
        Update: {
          id?: string
          snapshot_id?: string
          reported_by?: string
          person_label?: string
          person_detection_id?: string
          reason?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      owns_project: { Args: { p_project_id: string }; Returns: boolean }
      owns_session: { Args: { p_session_id: string }; Returns: boolean }
      owns_snapshot: { Args: { p_snapshot_id: string }; Returns: boolean }
      owns_person: { Args: { p_person_id: string }; Returns: boolean }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type ProjectRow = Database['public']['Tables']['projects']['Row']
export type ToolboxSessionRow =
  Database['public']['Tables']['toolbox_sessions']['Row']
export type SessionWorkerRow =
  Database['public']['Tables']['session_workers']['Row']
export type SnapshotRow = Database['public']['Tables']['snapshots']['Row']
export type WorkerReportRow =
  Database['public']['Tables']['worker_reports']['Row']
