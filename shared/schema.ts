import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  age: integer("age").notNull().default(0),
  grade: integer("grade").notNull().default(0),
  avatarUrl: text("avatar_url").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Progress schema
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  // REDI specific mastery skills
  rediSkillMastery: jsonb("redi_skill_mastery").notNull(), // { mechanics: number, sequencing: number, voice: number }
  // OWL specific mastery skills
  owlSkillMastery: jsonb("owl_skill_mastery").notNull(), // { mechanics: number, sequencing: number, voice: number }
  completedExercises: jsonb("completed_exercises").notNull(), // array of exercise IDs
  completedQuests: jsonb("completed_quests").notNull(), // array of quest IDs
  unlockedLocations: jsonb("unlocked_locations").notNull(), // array of location IDs
  rediLevel: integer("redi_level").notNull().default(1), // REDI specific level
  owlLevel: integer("owl_level").notNull().default(1), // OWL specific level
  currency: integer("currency").notNull().default(0),
  achievements: jsonb("achievements").notNull(), // array of achievement IDs
  // Streaks and gamification
  currentStreak: integer("current_streak").notNull().default(0), // Current consecutive days of writing
  longestStreak: integer("longest_streak").notNull().default(0), // Longest streak ever achieved
  lastWritingDate: timestamp("last_writing_date"), // Last date user did any writing
  dailyChallengeId: text("daily_challenge_id"), // Current daily challenge ID
  dailyChallengeCompleted: boolean("daily_challenge_completed").default(false), // Whether today's challenge is completed
  progressHistory: jsonb("progress_history").default([]), // Array of daily progress snapshots for sparkline visualization
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
  updatedAt: true,
});

// Exercise attempts schema
export const exerciseAttempts = pgTable("exercise_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  exerciseId: text("exercise_id").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  answers: jsonb("answers").notNull(), // User's answers
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

export const insertExerciseAttemptSchema = createInsertSchema(exerciseAttempts).omit({
  id: true,
  attemptedAt: true,
});

// Writing submissions schema
export const writingSubmissions = pgTable("writing_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questId: text("quest_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  feedback: text("feedback"),
  aiFeedback: jsonb("ai_feedback"), // Detailed structured AI feedback
  status: text("status").notNull().default("submitted"), // submitted, reviewed, approved
  submittedAt: timestamp("submitted_at").defaultNow(),
  skillsAssessed: jsonb("skills_assessed"), // { mechanics: number, sequencing: number, voice: number }
  suggestedExercises: jsonb("suggested_exercises"), // Array of exercise IDs
});

export const insertWritingSubmissionSchema = createInsertSchema(writingSubmissions).omit({
  id: true,
  feedback: true,
  aiFeedback: true,
  status: true,
  submittedAt: true,
  skillsAssessed: true,
  suggestedExercises: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;

export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;
export type InsertExerciseAttempt = z.infer<typeof insertExerciseAttemptSchema>;

export type WritingSubmission = typeof writingSubmissions.$inferSelect;
export type InsertWritingSubmission = z.infer<typeof insertWritingSubmissionSchema>;

// SkillMastery type for TypeScript usage
export type SkillMastery = {
  mechanics: number;
  sequencing: number;
  voice: number;
};

// AI Feedback type for TypeScript usage
export type AIFeedback = {
  overallFeedback: string;
  strengthsAnalysis: string;
  areasToImprove: string;
  mechanicsScore: number;
  sequencingScore: number;
  voiceScore: number;
  suggestions: {
    mechanics?: string[];
    sequencing?: string[];
    voice?: string[];
  };
  nextSteps: string;
};

// Daily Writing Challenge schema
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  challengeDate: timestamp("challenge_date").notNull().defaultNow(),
  prompt: text("prompt").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  wordMinimum: integer("word_minimum").notNull().default(100),
  skillFocus: text("skill_focus").notNull(), // mechanics, sequencing, or voice
  difficulty: integer("difficulty").notNull().default(1), // 1-5 scale
  expiresAt: timestamp("expires_at"), // when this challenge expires
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
});

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;

// Progress History entry type for sparkline visualization
export type ProgressHistoryEntry = {
  date: string; // ISO date string
  rediSkillMastery: SkillMastery;
  owlSkillMastery: SkillMastery;
  rediLevel: number;
  owlLevel: number;
  completedItems: number; // exercises + quests completed that day
};
