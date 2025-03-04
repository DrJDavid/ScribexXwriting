import { 
  users, 
  progress, 
  exerciseAttempts, 
  writingSubmissions,
  type User, 
  type InsertUser, 
  type Progress,
  type InsertProgress,
  type ExerciseAttempt,
  type InsertExerciseAttempt,
  type WritingSubmission,
  type InsertWritingSubmission
} from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
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
        skillMastery: { mechanics: 35, sequencing: 25, voice: 15 },
        completedExercises: ['mechanics-1', 'mechanics-2', 'sequencing-1'],
        completedQuests: ['town-hall-1'],
        unlockedLocations: ['townHall', 'library', 'musicHall'],
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
    const submissionToInsert = {
      ...insertSubmission,
      feedback: '',
      status: 'submitted',
    };
    
    const result = await db
      .insert(writingSubmissions)
      .values(submissionToInsert)
      .returning();
      
    return result[0];
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
}

export const storage = new DatabaseStorage();