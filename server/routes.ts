import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProgressSchema, 
  insertExerciseAttemptSchema, 
  insertWritingSubmissionSchema, 
  Progress 
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Additional routes
  app.get('/api/auth/me', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });
    
    // Strip password from user data before sending
    const user = req.user as any;
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });

  // Progress Routes
  app.get('/api/progress', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = req.user as any;
      const progress = await storage.getProgressByUserId(user.id);
      
      if (!progress) {
        return res.status(404).json({ message: 'Progress not found' });
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching progress' });
    }
  });

  app.patch('/api/progress', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = req.user as any;
      
      // Validate update data
      const schema = z.object({
        skillMastery: z.object({
          mechanics: z.number().min(0).max(100).optional(),
          sequencing: z.number().min(0).max(100).optional(),
          voice: z.number().min(0).max(100).optional()
        }).optional(),
        completedExercises: z.array(z.string()).optional(),
        completedQuests: z.array(z.string()).optional(),
        unlockedLocations: z.array(z.string()).optional(),
        currency: z.number().min(0).optional(),
        achievements: z.array(z.string()).optional()
      });
      
      const updateData = schema.parse(req.body);
      
      // Get current progress
      const currentProgress = await storage.getProgressByUserId(user.id);
      if (!currentProgress) {
        return res.status(404).json({ message: 'Progress not found' });
      }
      
      // Create a new merged progress object manually without spread
      const updatedProgressObj = { 
        id: currentProgress.id,
        userId: currentProgress.userId,
        skillMastery: currentProgress.skillMastery,
        completedExercises: updateData.completedExercises || currentProgress.completedExercises,
        completedQuests: updateData.completedQuests || currentProgress.completedQuests,
        unlockedLocations: updateData.unlockedLocations || currentProgress.unlockedLocations,
        currency: updateData.currency !== undefined ? updateData.currency : currentProgress.currency,
        achievements: updateData.achievements || currentProgress.achievements,
        updatedAt: currentProgress.updatedAt
      };
      
      // Handle skillMastery separately if it exists in the update
      if (updateData.skillMastery) {
        const currentSkillMastery = currentProgress.skillMastery as { mechanics: number; sequencing: number; voice: number };
        const updatedSkillMastery = updateData.skillMastery as { mechanics?: number; sequencing?: number; voice?: number };
        
        updatedProgressObj.skillMastery = {
          mechanics: updatedSkillMastery.mechanics !== undefined ? updatedSkillMastery.mechanics : currentSkillMastery.mechanics,
          sequencing: updatedSkillMastery.sequencing !== undefined ? updatedSkillMastery.sequencing : currentSkillMastery.sequencing,
          voice: updatedSkillMastery.voice !== undefined ? updatedSkillMastery.voice : currentSkillMastery.voice
        };
      }
      
      const updatedProgress = await storage.updateProgress(user.id, updatedProgressObj as Progress);
      
      res.json(updatedProgress);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Error updating progress' });
    }
  });

  // Exercise Attempt Routes
  app.post('/api/exercises/attempt', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = req.user as any;
      
      // Validate attempt data
      const attemptData = insertExerciseAttemptSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      // Save attempt
      const attempt = await storage.createExerciseAttempt(attemptData);
      
      res.status(201).json(attempt);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Error saving exercise attempt' });
    }
  });

  // Writing Submission Routes
  app.post('/api/writing/submit', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = req.user as any;
      
      // Validate submission data
      const schema = z.object({
        questId: z.string(),
        title: z.string().min(1),
        content: z.string().min(1)
      });
      
      const { questId, title, content } = schema.parse(req.body);
      
      // Create submission
      const submission = await storage.createWritingSubmission({
        userId: user.id,
        questId,
        title,
        content
      });
      
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Error submitting writing' });
    }
  });

  app.post('/api/writing/draft', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // For demo, just return success
      res.json({ message: 'Draft saved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error saving draft' });
    }
  });

  app.get('/api/writing/submissions', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = req.user as any;
      
      // Get submissions for user
      const submissions = await storage.getWritingSubmissionsByUserId(user.id);
      
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching submissions' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Return the server instance
  return httpServer;
}
