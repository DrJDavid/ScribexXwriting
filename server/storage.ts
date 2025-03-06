import { 
  users, 
  progress, 
  exerciseAttempts, 
  writingSubmissions,
  dailyChallenges,
  type User, 
  type InsertUser, 
  type Progress,
  type InsertProgress,
  type ExerciseAttempt,
  type InsertExerciseAttempt,
  type WritingSubmission,
  type InsertWritingSubmission,
  type DailyChallenge,
  type InsertDailyChallenge,
  type ProgressHistoryEntry,
  type SkillMastery
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { Pool } from '@neondatabase/serverless';
import { hashPassword } from "./auth";

// Database session store setup
const PostgresSessionStore = connectPg(session);
const sessionPool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Progress methods
  getProgressByUserId(userId: number): Promise<Progress | undefined>;
  createProgress(progress: InsertProgress): Promise<Progress>;
  updateProgress(userId: number, progress: Progress): Promise<Progress>;
  
  // Exercise attempt methods
  getExerciseAttemptsByUserId(userId: number): Promise<ExerciseAttempt[]>;
  createExerciseAttempt(attempt: InsertExerciseAttempt): Promise<ExerciseAttempt>;
  
  // Writing submission methods
  getWritingSubmissionsByUserId(userId: number): Promise<WritingSubmission[]>;
  getWritingSubmissionById(id: number): Promise<WritingSubmission | undefined>;
  createWritingSubmission(submission: InsertWritingSubmission): Promise<WritingSubmission>;
  updateWritingSubmission(id: number, submission: Partial<WritingSubmission>): Promise<WritingSubmission | undefined>;
  
  // Daily challenge methods
  getDailyChallenge(): Promise<DailyChallenge | undefined>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  updateDailyChallengeStatus(userId: number, challengeId: number | string, completed: boolean): Promise<Progress>;
  
  // Streak methods
  updateStreak(userId: number, completed: boolean): Promise<{currentStreak: number, longestStreak: number}>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool: sessionPool, 
      createTableIfMissing: true,
      tableName: 'session'
    });
    
    // Create a demo user if not exists
    this.ensureDemoUserExists();
  }
  
  // Create a demo user and initial progress
  private async ensureDemoUserExists() {
    try {
      // Check if demo user already exists
      const existingUser = await this.getUserByUsername('demo');
      if (existingUser) return;
      
      // Create demo user
      const demoUser = await this.createUser({
        username: 'demo',
        password: 'password', // Will be hashed in createUser
        displayName: 'Demo User',
        age: 13,
        grade: 7,
      });
      
      // Create initial progress
      await this.createProgress({
        userId: demoUser.id,
        rediSkillMastery: { mechanics: 35, sequencing: 25, voice: 15 },
        owlSkillMastery: { mechanics: 30, sequencing: 20, voice: 40 },
        completedExercises: ['mechanics-1', 'mechanics-2', 'sequencing-1'],
        completedQuests: ['town-hall-1'],
        unlockedLocations: ['townHall', 'library', 'musicHall'],
        rediLevel: 3,
        owlLevel: 2,
        currency: 45,
        achievements: ['first-steps', 'quest-beginner', 'mechanics-apprentice']
      });
      
      // Create some sample writing submissions
      await this.createWritingSubmission({
        userId: demoUser.id,
        questId: 'town-hall-1',
        title: 'Improving Our Community Parks',
        content: `Dear Editor,

I am writing to express my concern about the lack of recycling facilities in our community. As a student at Westlake Middle School, I've learned about the importance of environmental conservation, but I've noticed that our community doesn't provide adequate resources for recycling.

According to recent studies, communities with accessible recycling programs reduce their landfill waste by up to 40%. Yet, in our neighborhood, residents need to drive over 5 miles to reach the nearest recycling center, which is simply too far for many families, especially those without vehicles.

I propose that the city council consider:
1. Installing recycling bins alongside existing trash containers in public spaces
2. Establishing a monthly curbside recycling pickup program
3. Creating an educational campaign about the benefits of recycling

These changes would not only benefit our environment but also create jobs and potentially reduce long-term waste management costs for our city.

As young citizens, my classmates and I care deeply about the future of our planet. We are ready to volunteer in community cleanup efforts and recycling education if these resources are made available.

Thank you for considering this important matter.

Sincerely,
Demo User
Westlake Middle School, 7th Grade`
      });
    } catch (error) {
      console.error('Error creating demo user:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure required fields have defaults
    const userToInsert = {
      ...insertUser,
      age: insertUser.age || 0,
      grade: insertUser.grade || 0,
      avatarUrl: insertUser.avatarUrl || "",
    };
    
    // Hash password if it's provided in plain text (not already hashed)
    if (userToInsert.password && !userToInsert.password.includes('.')) {
      userToInsert.password = await hashPassword(userToInsert.password);
    }
    
    const result = await db.insert(users).values(userToInsert).returning();
    return result[0];
  }
  
  // Progress methods
  async getProgressByUserId(userId: number): Promise<Progress | undefined> {
    const result = await db.select().from(progress).where(eq(progress.userId, userId));
    return result[0];
  }
  
  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const progressToInsert = {
      ...insertProgress,
      currency: insertProgress.currency || 0,
    };
    
    const result = await db.insert(progress).values(progressToInsert).returning();
    return result[0];
  }
  
  async updateProgress(userId: number, updatedProgress: Progress): Promise<Progress> {
    // Find the progress entry by userId
    const existingProgress = await this.getProgressByUserId(userId);
    if (!existingProgress) {
      throw new Error('Progress not found');
    }
    
    // Remove id to avoid updating it
    const { id, ...updateValues } = updatedProgress;
    
    const result = await db
      .update(progress)
      .set({ 
        ...updateValues,
        updatedAt: new Date() 
      })
      .where(eq(progress.id, existingProgress.id))
      .returning();
    
    return result[0];
  }
  
  // Exercise attempt methods
  async getExerciseAttemptsByUserId(userId: number): Promise<ExerciseAttempt[]> {
    return await db
      .select()
      .from(exerciseAttempts)
      .where(eq(exerciseAttempts.userId, userId));
  }
  
  async createExerciseAttempt(insertAttempt: InsertExerciseAttempt): Promise<ExerciseAttempt> {
    const result = await db
      .insert(exerciseAttempts)
      .values(insertAttempt)
      .returning();
      
    return result[0];
  }
  
  // Writing submission methods
  async getWritingSubmissionsByUserId(userId: number): Promise<WritingSubmission[]> {
    return await db
      .select()
      .from(writingSubmissions)
      .where(eq(writingSubmissions.userId, userId));
  }
  
  async createWritingSubmission(insertSubmission: InsertWritingSubmission): Promise<WritingSubmission> {
    // Only include fields that are known to exist in the database
    const submissionToInsert = {
      userId: insertSubmission.userId,
      questId: insertSubmission.questId,
      title: insertSubmission.title,
      content: insertSubmission.content,
      status: 'submitted',
      feedback: '',
    };
    
    try {
      const result = await db
        .insert(writingSubmissions)
        .values(submissionToInsert)
        .returning();
        
      return result[0];
    } catch (error) {
      console.error('Database error when creating writing submission:', error);
      // If we get a schema mismatch error, try with an even more minimal set of fields
      if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('Retrying with minimal fields due to schema mismatch');
        
        // Try a more minimal version with only the essential fields
        const minimalSubmission = {
          user_id: insertSubmission.userId,
          quest_id: insertSubmission.questId,
          title: insertSubmission.title,
          content: insertSubmission.content,
          status: 'submitted',
        };
        
        // Use raw SQL to insert with just the known fields
        const insertResult = await db.execute(`
          INSERT INTO writing_submissions (user_id, quest_id, title, content, status)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [
          minimalSubmission.user_id,
          minimalSubmission.quest_id,
          minimalSubmission.title,
          minimalSubmission.content,
          minimalSubmission.status
        ]);
        
        return insertResult.rows[0];
      }
      
      // Rethrow the error if it's not related to missing columns
      throw error;
    }
  }
  
  async updateWritingSubmission(id: number, updates: Partial<WritingSubmission>): Promise<WritingSubmission | undefined> {
    const result = await db
      .update(writingSubmissions)
      .set(updates)
      .where(eq(writingSubmissions.id, id))
      .returning();
      
    return result[0];
  }
  
  async getWritingSubmissionById(id: number): Promise<WritingSubmission | undefined> {
    const result = await db
      .select()
      .from(writingSubmissions)
      .where(eq(writingSubmissions.id, id));
      
    return result[0];
  }

  // Daily challenge methods
  async getDailyChallenge(): Promise<DailyChallenge | undefined> {
    // Get the most recent challenge that hasn't expired
    const now = new Date();
    
    const result = await db
      .select()
      .from(dailyChallenges)
      .where(
        and(
          gte(dailyChallenges.expiresAt || now, now) // Not expired or no expiration
        )
      )
      .orderBy(desc(dailyChallenges.challengeDate))
      .limit(1);
    
    return result[0];
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    // Set expiration to 24 hours from now if not provided
    const challengeToInsert = {
      ...challenge,
      expiresAt: challenge.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    
    const result = await db
      .insert(dailyChallenges)
      .values(challengeToInsert)
      .returning();
      
    return result[0];
  }

  async updateDailyChallengeStatus(userId: number, challengeId: number | string, completed: boolean): Promise<Progress> {
    // Get user progress
    const userProgress = await this.getProgressByUserId(userId);
    if (!userProgress) {
      throw new Error('User progress not found');
    }
    
    // Update challenge completion status
    const result = await db
      .update(progress)
      .set({
        dailyChallengeId: challengeId.toString(),
        dailyChallengeCompleted: completed,
        // If completed, also record the current date as last writing date
        ...(completed ? { lastWritingDate: new Date() } : {})
      })
      .where(eq(progress.userId, userId))
      .returning();
    
    // If challenge was completed, update the streak
    if (completed) {
      await this.updateStreak(userId, true);
    }
    
    return result[0];
  }

  // Streak methods
  async updateStreak(userId: number, completed: boolean): Promise<{currentStreak: number, longestStreak: number}> {
    // Get user progress
    const userProgress = await this.getProgressByUserId(userId);
    if (!userProgress) {
      throw new Error('User progress not found');
    }
    
    let { currentStreak = 0, longestStreak = 0, lastWritingDate } = userProgress;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format dates to YYYY-MM-DD for comparison
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const lastWritingStr = lastWritingDate ? new Date(lastWritingDate).toISOString().split('T')[0] : '';
    
    if (completed) {
      // If already wrote today, don't increase streak
      if (lastWritingStr === todayStr) {
        // Do nothing, already counted today
      }
      // If wrote yesterday, continue streak
      else if (lastWritingStr === yesterdayStr) {
        currentStreak += 1;
      } 
      // Otherwise, start a new streak
      else {
        currentStreak = 1;
      }
      
      // Update longest streak if current streak is longer
      longestStreak = Math.max(currentStreak, longestStreak);
      
      // Update progress record
      await db
        .update(progress)
        .set({
          currentStreak,
          longestStreak,
          lastWritingDate: today
        })
        .where(eq(progress.userId, userId));
        
      // Update progress history - add today's progress snapshot
      if (userProgress.progressHistory) {
        const historyEntries = userProgress.progressHistory as ProgressHistoryEntry[];
        
        // Create today's progress snapshot
        const todayEntry: ProgressHistoryEntry = {
          date: todayStr,
          rediSkillMastery: userProgress.rediSkillMastery as SkillMastery,
          owlSkillMastery: userProgress.owlSkillMastery as SkillMastery,
          rediLevel: userProgress.rediLevel,
          owlLevel: userProgress.owlLevel,
          completedItems: (userProgress.completedExercises as string[]).length + 
                         (userProgress.completedQuests as string[]).length
        };
        
        // Check if today already has an entry
        const existingEntryIndex = historyEntries.findIndex(entry => entry.date === todayStr);
        if (existingEntryIndex >= 0) {
          // Update existing entry
          historyEntries[existingEntryIndex] = todayEntry;
        } else {
          // Add new entry, keeping up to 90 days of history
          historyEntries.push(todayEntry);
          if (historyEntries.length > 90) {
            historyEntries.shift(); // Remove oldest entry
          }
        }
        
        // Update the progress history in the database
        await db
          .update(progress)
          .set({
            progressHistory: historyEntries
          })
          .where(eq(progress.userId, userId));
      }
    }
    
    return { currentStreak, longestStreak };
  }
}

export const storage = new DatabaseStorage();