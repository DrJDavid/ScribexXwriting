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
import { TOWN_LOCATIONS, WRITING_QUESTS, getQuestById, getLocationById } from "../client/src/data/quests";

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
  
  // Writer's block help endpoint with streaming support
  app.post('/api/writing/writers-block-help', async (req, res) => {
    try {
      // Check if OpenAI is configured
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: 'OpenAI service not configured' });
      }
      
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      console.log("Writer's block help API called with body:", JSON.stringify(req.body).substring(0, 200) + "...");
      
      // Validate required fields with more flexible schema
      const schema = z.object({
        questId: z.string(),
        title: z.string().optional(),
        messages: z.array(
          z.object({
            id: z.string(),
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ),
        currentContent: z.string().optional().default(""),
      });
      
      // Parse the request
      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        console.error("Validation error:", validation.error);
        return res.status(400).json({ message: "Invalid request format" });
      }
      
      const { questId, title, messages, currentContent } = validation.data;
      console.log(`Received ${messages.length} messages for conversation`);
      
      if (messages.length === 0) {
        return res.status(400).json({ message: 'No messages to process' });
      }
      
      // Get quest details to provide context
      let quest = null;
      try {
        if (questId !== 'free-write') {
          quest = getQuestById(questId);
          if (!quest) {
            console.log(`Quest with ID ${questId} not found, using fallback context`);
          }
        } else {
          console.log("Using free-write context");
        }
      } catch (error) {
        console.error("Error getting quest details:", error);
      }
      
      // Create a context for the AI with the quest details and any partial content
      let questContext = "";
      
      if (quest) {
        questContext = `
You are a supportive writing coach for a student working on the following assignment:
- Assignment Title: ${title || quest.title}
- Assignment Type: ${quest.skillFocus}
- Assignment Description: ${quest.description}
- Current Progress: ${currentContent ? "The student has written some content" : "The student hasn't started writing yet"}

${currentContent ? `Here's the student's current content so far:
----
${currentContent}
----` : ""}
`.trim();
      } else {
        // Fallback for free-write or when quest is not found
        questContext = `
You are a supportive writing coach for a student working on a writing assignment.
${title ? `- Assignment Title: ${title}` : ''}
${currentContent ? `
Here's the student's current content so far:
----
${currentContent}
----` : "The student hasn't started writing yet"}
`.trim();
      }
      
      // Add the common instructions
      questContext += `

Provide specific, actionable advice to help the student move forward with their writing. Your responses should:
1. Directly address their questions
2. Offer examples they can use right away
3. Ask follow-up questions when appropriate to better understand their needs
4. Focus on process, not just rules
5. Use a friendly, conversational tone as if you're having a chat with them

Important: Never simply write the content for them. Instead, guide them to develop their own ideas.`;
      
      // Import OpenAI
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Create a simple array of message objects for OpenAI API
      const openaiMessages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
        {
          role: "system",
          content: questContext
        }
      ];
      
      // Add the conversation history from client
      for (const msg of messages) {
        if (msg.role === "user") {
          openaiMessages.push({
            role: "user",
            content: msg.content
          });
        } else if (msg.role === "assistant") {
          openaiMessages.push({
            role: "assistant",
            content: msg.content
          });
        }
      }
      
      console.log("Sending request to OpenAI with message count:", openaiMessages.length);
      
      // Set up streaming response headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      
      try {
        // Prepare for non-streaming fallback in case streaming fails
        let fullResponseText = "";
        
        try {
          // Generate a unique ID for this message
          const messageId = Date.now().toString();
          
          // Format for the Vercel AI SDK - this is very specific
          // First, send the initial message with empty content
          res.write(`data: ${JSON.stringify({ id: messageId, role: "assistant", content: "" })}\n\n`);
          
          // Call OpenAI API with streaming
          const response = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
            messages: openaiMessages,
            stream: true,
          });
          
          // Stream the chunks as they come
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponseText += content;
              // Send the delta in the correct format for Vercel AI SDK
              res.write(`data: ${JSON.stringify({ delta: content })}\n\n`);
            }
          }
          
          console.log("AI response completed successfully");
        } catch (streamError) {
          console.error("Streaming error:", streamError);
          
          // Try non-streaming fallback if streaming fails
          try {
            console.log("Trying non-streaming fallback");
            const nonStreamResponse = await openai.chat.completions.create({
              model: "gpt-4o", 
              messages: openaiMessages,
              stream: false,
            });
            
            fullResponseText = nonStreamResponse.choices[0].message.content || "";
            console.log("Got non-streaming response");
            
            // Send the full content at once
            res.write(`data: ${JSON.stringify({ delta: fullResponseText })}\n\n`);
          } catch (nonStreamError) {
            console.error("Non-streaming fallback also failed:", nonStreamError);
            res.write(`data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`);
          }
        }
        
        // Always terminate the stream with DONE
        res.write('data: [DONE]\n\n');
      } catch (error) {
        console.error("Error with OpenAI API:", error);
        res.write(`data: ${JSON.stringify({ error: "An error occurred while generating a response" })}\n\n`);
        res.write('data: [DONE]\n\n');
      }
      
      res.end();
    } catch (error) {
      console.error('Error in writer\'s block help:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Add an endpoint for generating writing prompts based on OWL location
  app.post('/api/writing/generate-prompt', async (req, res) => {
    try {
      // Check if OpenAI is configured
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: 'OpenAI service not configured' });
      }
      
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Validate request body
      const schema = z.object({
        locationName: z.string(),
        locationType: z.enum([
          'argumentative', 
          'informative', 
          'narrative', 
          'reflective', 
          'descriptive'
        ]),
        customFocus: z.string().nullable(),
      });
      
      const { locationName, locationType, customFocus } = schema.parse(req.body);
      
      // We're using locationName directly now, no need to fetch additional location data
      
      // Import OpenAI
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Create a prompt for the AI
      const promptContent = `Generate a creative writing prompt for a student to write a ${locationType} piece related to the location "${locationName}" in OWL Town.

${customFocus ? `Additional focus: ${customFocus}` : ''}

The prompt should:
- Be engaging and specific to this location's themes and atmosphere
- Include a clear writing goal that fits with ${locationType} writing
- Suggest a target word count between 250-500 words
- Include 2-3 guiding questions to help the student brainstorm
- Incorporate elements from the location's environment and purpose

Format the response as JSON with these fields:
- prompt: The main writing prompt (1-2 sentences)
- scenario: Background context for the writing (2-3 sentences)
- guidingQuestions: Array of 2-3 specific questions to help with brainstorming
- suggestedElements: Array of 3-4 elements to consider including
- challengeElement: One optional challenging element to incorporate

Keep the entire response concise and focused on inspiring creativity.`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a creative writing instructor who specializes in generating engaging prompts tailored to specific settings and writing types."
          },
          {
            role: "user",
            content: promptContent
          }
        ],
      });
      
      // Parse and return the generated prompt
      try {
        const content = response.choices[0].message.content || "{}";
        const promptData = JSON.parse(content);
        res.json(promptData);
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        // Return error but also log the actual content for debugging
        console.log("Raw response content:", response.choices[0].message.content);
        res.status(500).json({ message: 'Error parsing prompt data' });
      }
    } catch (error) {
      console.error("Error generating writing prompt:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Error generating writing prompt' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Return the server instance
  return httpServer;
}
