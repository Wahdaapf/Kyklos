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
          avatar_url: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          type: string | null
          description: string | null
          logo_url: string | null
          primary_color: string | null
          invite_code: string | null
          created_by: string
          created_at: string
          arisan_nominal: number | null
          arisan_period: string | null
        }
        Insert: {
          id?: string
          name: string
          type?: string | null
          description?: string | null
          logo_url?: string | null
          primary_color?: string | null
          invite_code?: string | null
          created_by: string
          created_at?: string
          arisan_nominal?: number | null
          arisan_period?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string | null
          description?: string | null
          logo_url?: string | null
          primary_color?: string | null
          invite_code?: string | null
          created_by?: string
          created_at?: string
          arisan_nominal?: number | null
          arisan_period?: string | null
        }
      }
      arisan_rounds: {
        Row: {
          id: string
          community_id: string
          round_number: number
          winner_profile_id: string | null
          total_prize: number
          drawn_at: string
          status: string
        }
        Insert: {
          id?: string
          community_id: string
          round_number: number
          winner_profile_id?: string | null
          total_prize: number
          drawn_at?: string
          status?: string
        }
        Update: {
          id?: string
          community_id?: string
          round_number?: number
          winner_profile_id?: string | null
          total_prize?: number
          drawn_at?: string
          status?: string
        }
      }
    }
  }
}

