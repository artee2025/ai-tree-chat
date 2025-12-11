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
      sessions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string | null
          user_id?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string
          branch_id: string | null
          parent_message_id: string | null
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
          order_index: number
        }
        Insert: {
          id?: string
          session_id: string
          branch_id?: string | null
          parent_message_id?: string | null
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
          order_index?: number
        }
        Update: {
          id?: string
          session_id?: string
          branch_id?: string | null
          parent_message_id?: string | null
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
          order_index?: number
        }
      }
      branches: {
        Row: {
          id: string
          session_id: string
          name: string
          created_at: string
          is_main: boolean
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          created_at?: string
          is_main?: boolean
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          created_at?: string
          is_main?: boolean
        }
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
  }
}
