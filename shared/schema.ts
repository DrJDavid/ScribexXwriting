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
  skillMastery: jsonb("skill_mastery").notNull(), // { mechanics: number, sequencing: number, voice: number }
  completedExercises: jsonb("completed_exercises").notNull(), // array of exercise IDs
  completedQuests: jsonb("completed_quests").notNull(), // array of quest IDs
  unlockedLocations: jsonb("unlocked_locations").notNull(), // array of location IDs
  currency: integer("currency").notNull().default(0),
  achievements: jsonb("achievements").notNull(), // array of achievement IDs
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
