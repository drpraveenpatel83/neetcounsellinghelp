import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define standard TypeScript interfaces for database structures
export interface Paper {
  id: string;
  title: string;
  year: number;
  duration_mins: number;
  total_questions: number;
  total_marks: number;
  is_published: boolean;
  created_at?: string;
}

export interface Question {
  id: string;
  paper_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  chapter: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  order_index: number;
  created_at?: string;
}

export interface Attempt {
  id: string;
  paper_id: string;
  user_id?: string;
  score: number;
  total_correct: number;
  total_wrong: number;
  total_unattempted: number;
  accuracy: number;
  time_spent_seconds: number;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed';
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option: 'a' | 'b' | 'c' | 'd' | null;
  is_correct: boolean | null;
  is_marked_review: boolean;
  time_spent_seconds: number;
}
