-- SQL Script to set up the Database schema in Supabase SQL Editor

-- 1. Papers Table
CREATE TABLE IF NOT EXISTS papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  duration_mins INTEGER DEFAULT 180,
  total_questions INTEGER DEFAULT 180,
  total_marks INTEGER DEFAULT 720,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL, -- 'a', 'b', 'c', or 'd'
  explanation TEXT,
  subject TEXT NOT NULL, -- 'Physics', 'Chemistry', 'Biology'
  chapter TEXT,
  topic TEXT,
  difficulty TEXT DEFAULT 'Medium', -- 'Easy', 'Medium', 'Hard'
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  score INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_wrong INTEGER DEFAULT 0,
  total_unattempted INTEGER DEFAULT 0,
  accuracy NUMERIC DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress' -- 'in_progress', 'completed'
);

-- 4. Attempt Answers Table
CREATE TABLE IF NOT EXISTS attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  selected_option TEXT, -- 'a', 'b', 'c', 'd' or null
  is_correct BOOLEAN,
  is_marked_review BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(attempt_id, question_id)
);
