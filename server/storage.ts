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
  createWritingSubmission(submission: InsertWritingSubmission): Promise<WritingSubmission>;
  updateWritingSubmission(id: number, submission: Partial<WritingSubmission>): Promise<WritingSubmission | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private progresses: Map<number, Progress>; // userId -> Progress
  private exerciseAttempts: Map<number, ExerciseAttempt>;
  private writingSubmissions: Map<number, WritingSubmission>;
  
  private userIdCounter: number;
  private progressIdCounter: number;
  private exerciseAttemptIdCounter: number;
  private writingSubmissionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.progresses = new Map();
    this.exerciseAttempts = new Map();
    this.writingSubmissions = new Map();
    
    this.userIdCounter = 1;
    this.progressIdCounter = 1;
    this.exerciseAttemptIdCounter = 1;
    this.writingSubmissionIdCounter = 1;
    
    // Create demo user
    this.createDemoUser();
  }
  
  // Create a demo user and initial progress
  private async createDemoUser() {
    try {
      // Check if demo user already exists
      const existingUser = await this.getUserByUsername('demo');
      if (existingUser) return;
      
      // Create demo user
      const demoUser = await this.createUser({
        username: 'demo',
        password: 'password',
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
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      age: insertUser.age || 0,
      grade: insertUser.grade || 0,
      avatarUrl: insertUser.avatarUrl || "",
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Progress methods
  async getProgressByUserId(userId: number): Promise<Progress | undefined> {
    return Array.from(this.progresses.values()).find(
      (progress) => progress.userId === userId,
    );
  }
  
  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const id = this.progressIdCounter++;
    const now = new Date();
    const progressEntry: Progress = {
      ...insertProgress,
      id,
      currency: insertProgress.currency || 0,
      updatedAt: now
    };
    this.progresses.set(id, progressEntry);
    return progressEntry;
  }
  
  async updateProgress(userId: number, updatedProgress: Progress): Promise<Progress> {
    // Find the progress entry by userId
    const existingProgress = await this.getProgressByUserId(userId);
    if (!existingProgress) {
      throw new Error('Progress not found');
    }
    
    // Update with new values and timestamp
    const now = new Date();
    const progress: Progress = {
      ...updatedProgress,
      updatedAt: now
    };
    
    // Update in map
    this.progresses.set(existingProgress.id, progress);
    
    return progress;
  }
  
  // Exercise attempt methods
  async getExerciseAttemptsByUserId(userId: number): Promise<ExerciseAttempt[]> {
    return Array.from(this.exerciseAttempts.values())
      .filter((attempt) => attempt.userId === userId);
  }
  
  async createExerciseAttempt(insertAttempt: InsertExerciseAttempt): Promise<ExerciseAttempt> {
    const id = this.exerciseAttemptIdCounter++;
    const now = new Date();
    const attempt: ExerciseAttempt = {
      ...insertAttempt,
      id,
      attemptedAt: now
    };
    this.exerciseAttempts.set(id, attempt);
    return attempt;
  }
  
  // Writing submission methods
  async getWritingSubmissionsByUserId(userId: number): Promise<WritingSubmission[]> {
    return Array.from(this.writingSubmissions.values())
      .filter((submission) => submission.userId === userId);
  }
  
  async createWritingSubmission(insertSubmission: InsertWritingSubmission): Promise<WritingSubmission> {
    const id = this.writingSubmissionIdCounter++;
    const now = new Date();
    const submission: WritingSubmission = {
      ...insertSubmission,
      id,
      feedback: '',
      status: 'submitted',
      submittedAt: now
    };
    this.writingSubmissions.set(id, submission);
    return submission;
  }
  
  async updateWritingSubmission(id: number, updates: Partial<WritingSubmission>): Promise<WritingSubmission | undefined> {
    const submission = this.writingSubmissions.get(id);
    if (!submission) {
      return undefined;
    }
    
    const updatedSubmission: WritingSubmission = {
      ...submission,
      ...updates
    };
    
    this.writingSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }
}

export const storage = new MemStorage();
