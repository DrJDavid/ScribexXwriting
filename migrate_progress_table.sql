-- Migrate the progress table to the new schema
-- Rename the current skill_mastery column to handle it later
ALTER TABLE progress 
  RENAME COLUMN skill_mastery TO old_skill_mastery;

-- Add the new columns
ALTER TABLE progress 
  ADD COLUMN redi_skill_mastery JSONB NOT NULL DEFAULT '{"mechanics": 10, "sequencing": 10, "voice": 10}',
  ADD COLUMN owl_skill_mastery JSONB NOT NULL DEFAULT '{"mechanics": 10, "sequencing": 10, "voice": 10}',
  ADD COLUMN redi_level INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN owl_level INTEGER NOT NULL DEFAULT 1;

-- Copy data from old_skill_mastery to both new columns to preserve existing user data
UPDATE progress 
SET 
  redi_skill_mastery = old_skill_mastery,
  owl_skill_mastery = old_skill_mastery;

-- Drop the old column
ALTER TABLE progress 
  DROP COLUMN old_skill_mastery;