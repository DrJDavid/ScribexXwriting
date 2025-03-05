import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProgressSchema, 
  insertExerciseAttemptSchema, 
  insertWritingSubmissionSchema, 
  Progress,
  SkillMastery
} from "@shared/schema";
// Import location and quest types from client-side
import { type TownLocation, type WritingQuest } from "../client/src/data/quests";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

// Load all quests and locations from client (types only were imported earlier)
import { TOWN_LOCATIONS, WRITING_QUESTS, getQuestById } from "../client/src/data/quests";

// Functions to handle location unlocking
async function determineLocationsToUnlock(progress: Progress): Promise<string[]> {
  // Ensure skill mastery is properly typed
  const currentSkillMastery = progress.skillMastery as SkillMastery;
  
  // Ensure unlockedLocations is an array (use empty array as fallback)
  const currentlyUnlocked: string[] = Array.isArray(progress.unlockedLocations) 
    ? (progress.unlockedLocations as string[]) 
    : [];
  
  // Find locations that are not yet unlocked
  const locationsToCheck = TOWN_LOCATIONS.filter(
    location => !currentlyUnlocked.includes(location.id)
  );
  
  const locationsToUnlock: string[] = [];
  
  // Check each location to see if it should be unlocked based on 
  // the user's current skill mastery
  for (const location of locationsToCheck) {
    // Get the quests for this location
    const locationQuests = WRITING_QUESTS.filter(quest => 
      quest.locationId === location.id
    );
    
    // If there are no quests, skip this location
    if (locationQuests.length === 0) continue;
    
    // Get the first quest (usually has the lowest requirements)
    const firstQuest = locationQuests.sort((a, b) => a.level - b.level)[0];
    
    // Check if the player meets the skill requirements for the first quest
    const requirements = firstQuest.unlockRequirements.skillMastery;
    
    if (
      currentSkillMastery.mechanics >= requirements.mechanics &&
      currentSkillMastery.sequencing >= requirements.sequencing &&
      currentSkillMastery.voice >= requirements.voice
    ) {
      locationsToUnlock.push(location.id);
    }
  }
  
  return locationsToUnlock;
}

async function unlockLocations(progress: Progress, locationIds: string[]): Promise<Progress> {
  // Ensure unlockedLocations is an array (use empty array as fallback)
  const currentlyUnlocked: string[] = Array.isArray(progress.unlockedLocations) 
    ? (progress.unlockedLocations as string[]) 
    : [];
  
  // Combine current locations with new ones, ensuring no duplicates
  // Use array spread and filter instead of Set to avoid TypeScript issues
  const updatedUnlockedLocations = [
    ...currentlyUnlocked,
    ...locationIds.filter(id => !currentlyUnlocked.includes(id))
  ];
  
  // Update progress with the new locations
  const updatedProgress = await storage.updateProgress(progress.userId, {
    ...progress,
    unlockedLocations: updatedUnlockedLocations
  });
  
  return updatedProgress;
}

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
      let progress = await storage.getProgressByUserId(user.id);
      
      // If progress doesn't exist for this user, create it with default values
      if (!progress) {
        progress = await storage.createProgress({
          userId: user.id,
          skillMastery: { mechanics: 10, sequencing: 10, voice: 10 },
          completedExercises: [],
          completedQuests: [],
          unlockedLocations: ['townHall'],
          currency: 0,
          achievements: []
        });
      }
      
      res.json(progress);
    } catch (error) {
      console.error('Error fetching/creating progress:', error);
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
      
      console.log('Creating writing submission:', { userId: user.id, questId, title, contentLength: content.length });
      
      // Create submission with required fields only to avoid any issues
      const submission = await storage.createWritingSubmission({
        userId: user.id,
        questId,
        title,
        content
      });
      
      console.log('Writing submission created successfully:', submission.id);
      
      // Immediately trigger AI analysis in the background
      // We'll use a fire-and-forget approach to avoid blocking the response
      (async () => {
        try {
          // Import required OpenAI service
          const { analyzeWriting, generateSuggestedExercises } = await import('./services/openai');
          
          // Get current user progress to determine skill levels
          const userProgress = await storage.getProgressByUserId(user.id);
          if (!userProgress) {
            console.error('User progress not found for analysis');
            return;
          }
          
          console.log(`Starting AI analysis for submission ${submission.id}`);
          
          // Get quest details for context
          const quest = getQuestById(questId);
          const questDescription = quest ? quest.description : "Writing assignment";
          
          // Analyze the writing using OpenAI
          const { feedback, skillsAssessed } = await analyzeWriting(
            content,
            title,
            questDescription,
            submission.id.toString(),
            user.grade || 7 // Default to 7th grade if not specified
          );
          
          // Generate suggested exercises based on the feedback and current skill levels
          const suggestedExercises = await generateSuggestedExercises(
            feedback,
            userProgress.skillMastery as any
          );
          
          // Update the submission with AI feedback
          await storage.updateWritingSubmission(submission.id, {
            status: "reviewed",
            aiFeedback: feedback,
            skillsAssessed,
            suggestedExercises
          });
          
          console.log(`AI analysis completed for submission ${submission.id}`);
          
          // Unlock additional town locations based on progress
          if (quest && quest.locationId) {
            const nextLocations = await determineLocationsToUnlock(userProgress);
            if (nextLocations.length > 0) {
              console.log(`Unlocking locations: ${nextLocations.join(', ')}`);
              await unlockLocations(userProgress, nextLocations);
            }
          }
        } catch (analysisError) {
          console.error('Error in background AI analysis:', analysisError);
        }
      })();
      
      // Respond with the submission immediately without waiting for analysis
      res.status(201).json(submission);
    } catch (error) {
      console.error('Error in writing submission:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Error submitting writing' });
    }
  });
  
  // AI Analysis endpoint for writing submissions
  app.post('/api/writing/analyze', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = req.user as any;
      
      // Validate request data
      const schema = z.object({
        submissionId: z.number(),
        questId: z.string(),
        content: z.string().min(1),
        title: z.string().min(1),
        grade: z.number().optional(),
        focusSkill: z.enum(['mechanics', 'sequencing', 'voice']).optional()
      });
      
      const { submissionId, questId, content, title, grade, focusSkill } = schema.parse(req.body);
      
      // Import required OpenAI service
      const { analyzeWriting, generateSuggestedExercises } = await import('./services/openai');
      
      // Get current user progress to determine skill levels
      const userProgress = await storage.getProgressByUserId(user.id);
      if (!userProgress) {
        return res.status(404).json({ message: 'User progress not found' });
      }
      
      // Get quest details for context
      const quest = getQuestById(questId);
      const questDescription = quest ? quest.description : "Writing assignment";
      
      // Analyze the writing using OpenAI
      const { feedback, skillsAssessed } = await analyzeWriting(
        content,
        title,
        questDescription,
        submissionId.toString(),
        grade || user.grade || 7 // Default to 7th grade if not specified
      );
      
      // Generate suggested exercises based on the feedback and current skill levels
      const suggestedExercises = await generateSuggestedExercises(
        feedback,
        userProgress.skillMastery as any
      );
      
      // Update the submission with AI feedback
      const updatedSubmission = await storage.updateWritingSubmission(submissionId, {
        status: "reviewed",
        aiFeedback: feedback,
        skillsAssessed,
        suggestedExercises
      });
      
      res.json({
        submission: updatedSubmission,
        analysis: {
          feedback,
          skillsAssessed,
          suggestedExercises
        }
      });
    } catch (error) {
      console.error("AI analysis error:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Error analyzing submission' });
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
  
  app.get('/api/writing/submissions/:id', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = req.user as any;
      const submissionId = parseInt(req.params.id);
      
      if (isNaN(submissionId)) {
        return res.status(400).json({ message: 'Invalid submission ID' });
      }
      
      // Get the submission
      const submission = await storage.getWritingSubmissionById(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      
      // Ensure user owns this submission
      if (submission.userId !== user.id) {
        return res.status(403).json({ message: 'Not authorized to access this submission' });
      }
      
      res.json(submission);
    } catch (error) {
      console.error('Error fetching submission:', error);
      res.status(500).json({ message: 'Error fetching submission' });
    }
  });
  
  // Writer's block help endpoint
  app.post('/api/writing/writers-block-help', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = req.user as any;
      
      // Validate required fields
      const schema = z.object({
        questId: z.string(),
        title: z.string().optional(),
        prompt: z.string().min(1),
        currentContent: z.string().optional(),
      });
      
      const { questId, title, prompt, currentContent } = schema.parse(req.body);
      
      // Get quest details to provide context
      const quest = getQuestById(questId);
      if (!quest) {
        return res.status(404).json({ message: 'Quest not found' });
      }
      
      // Import required OpenAI service
      const { analyzeWriting } = await import('./services/openai');
      
      // Create a context for the AI with the quest details and any partial content
      const context = `
Quest Title: ${title || quest.title}
Quest Description: ${quest.description}
Writing Type: ${quest.skillFocus}
Student's Current Content: ${currentContent || "(Not started yet)"}
Student's Question/Prompt: ${prompt}
      `.trim();
      
      try {
        // Call OpenAI service for help
        const { feedback } = await analyzeWriting(
          context,
          "Writer's Block Help",
          prompt,
          "writers-block-help",
          user.grade || 7
        );
        
        // Simplify response for writers block help
        let response = feedback.overallFeedback;
        
        // Add specific suggestions if available
        if (feedback.suggestions) {
          if (feedback.suggestions.mechanics && feedback.suggestions.mechanics.length > 0) {
            response += "\n\n" + feedback.suggestions.mechanics.join("\n");
          }
          if (feedback.suggestions.sequencing && feedback.suggestions.sequencing.length > 0) {
            response += "\n\n" + feedback.suggestions.sequencing.join("\n");
          }
          if (feedback.suggestions.voice && feedback.suggestions.voice.length > 0) {
            response += "\n\n" + feedback.suggestions.voice.join("\n");
          }
        }
        
        // Add next steps
        if (feedback.nextSteps) {
          response += "\n\n" + feedback.nextSteps;
        }
        
        res.json({ response });
      } catch (error) {
        console.error('Error generating writer\'s block help:', error);
        res.status(500).json({ message: 'Failed to generate help response' });
      }
    } catch (error) {
      console.error('Error in writer\'s block help:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Return the server instance
  return httpServer;
}
