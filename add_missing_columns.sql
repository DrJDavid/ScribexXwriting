-- Add missing columns to writing_submissions table
ALTER TABLE writing_submissions 
ADD COLUMN IF NOT EXISTS ai_feedback JSONB,
ADD COLUMN IF NOT EXISTS skills_assessed JSONB,
ADD COLUMN IF NOT EXISTS suggested_exercises JSONB;