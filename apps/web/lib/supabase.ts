import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database schema
export interface User {
  id: string
  email: string
  phone?: string
  first_name: string
  last_name: string
  role: 'parent' | 'child'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface FamilyGroup {
  id: string
  name: string
  custody_arrangement: {
    arrangement: 'alternating_weeks' | 'alternating_weekends' | 'every_third_weekend' | 'alternating_long_weekends'
    handoverDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
    handoverTime: string
    startsWith: 'mor' | 'far'
  }
  created_by: string
  created_at: string
  updated_at: string
}

export interface FamilyMember {
  id: string
  family_group_id: string
  user_id: string
  role: 'mor' | 'far' | 'barn'
  address?: string
  is_admin: boolean
  joined_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  assigned_to?: string
  created_by: string
  family_group_id: string
  due_date?: string
  completed: boolean
  task_type: 'packing' | 'regular' | 'recurring'
  checklist?: Array<{
    id: string
    item: string
    completed: boolean
  }>
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  location?: string
  assigned_to?: string
  family_group_id: string
  activity_type: 'school' | 'leisure' | 'medical' | 'other'
  recurring_config?: {
    frequency: 'weekly' | 'monthly'
    days?: number[]
    endDate?: string
  }
  created_at: string
}

// Database type for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      family_groups: {
        Row: FamilyGroup
        Insert: Omit<FamilyGroup, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<FamilyGroup, 'id' | 'created_at'>>
      }
      family_members: {
        Row: FamilyMember
        Insert: Omit<FamilyMember, 'id' | 'joined_at'>
        Update: Partial<Omit<FamilyMember, 'id' | 'joined_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at'>>
      }
      activities: {
        Row: Activity
        Insert: Omit<Activity, 'id' | 'created_at'>
        Update: Partial<Omit<Activity, 'id' | 'created_at'>>
      }
    }
  }
}