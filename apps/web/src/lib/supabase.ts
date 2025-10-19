import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Client-side Supabase client
export const createSupabaseClient = () => {
  return createClientComponentClient();
};

// Server-side Supabase client
export const createSupabaseServerClient = () => {
  return createServerComponentClient({ cookies });
};

// Database types (generated from Prisma)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar: string | null;
          role: 'PARENT' | 'CHILD' | 'GUEST';
          age: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar?: string | null;
          role?: 'PARENT' | 'CHILD' | 'GUEST';
          age?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar?: string | null;
          role?: 'PARENT' | 'CHILD' | 'GUEST';
          age?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      families: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          family_id: string;
          owner_id: string;
          status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
          priority: 'LOW' | 'MEDIUM' | 'HIGH';
          due_date: string | null;
          visibility: 'PRIVATE' | 'FAMILY' | 'CUSTOM';
          shared_with: string[];
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          family_id: string;
          owner_id: string;
          status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
          priority?: 'LOW' | 'MEDIUM' | 'HIGH';
          due_date?: string | null;
          visibility?: 'PRIVATE' | 'FAMILY' | 'CUSTOM';
          shared_with?: string[];
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          family_id?: string;
          owner_id?: string;
          status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
          priority?: 'LOW' | 'MEDIUM' | 'HIGH';
          due_date?: string | null;
          visibility?: 'PRIVATE' | 'FAMILY' | 'CUSTOM';
          shared_with?: string[];
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};