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
      users: {
        Row: {
          id: string
          agency_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          agency_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agency_name?: string | null
          created_at?: string
        }
      }
      brand_kits: {
        Row: {
          id: string
          user_id: string
          agency_name: string
          logo_url: string | null
          primary_color: string
          tone_of_voice: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agency_name: string
          logo_url?: string | null
          primary_color?: string
          tone_of_voice?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agency_name?: string
          logo_url?: string | null
          primary_color?: string
          tone_of_voice?: string
          created_at?: string
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          user_id: string
          title: string
          client_name: string
          status: string
          proposal_json: Json | null
          rendered_html: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          client_name: string
          status?: string
          proposal_json?: Json | null
          rendered_html?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          client_name?: string
          status?: string
          proposal_json?: Json | null
          rendered_html?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string
          category: string
          proposal_json: Json
          is_builtin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description: string
          category: string
          proposal_json: Json
          is_builtin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string
          category?: string
          proposal_json?: Json
          is_builtin?: boolean
          created_at?: string
        }
      }
      files: {
        Row: {
          id: string
          user_id: string
          proposal_id: string | null
          name: string
          storage_path: string
          mime_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          proposal_id?: string | null
          name: string
          storage_path: string
          mime_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          proposal_id?: string | null
          name?: string
          storage_path?: string
          mime_type?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
