import OpenAI from "openai";
import { AIFeedback, SkillMastery } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export async function analyzeWriting(
  title: string,
  content: string,
  questId: string,
  grade: number
): Promise<{ feedback: AIFeedback; skillsAssessed: SkillMastery }> {
  try {
    // Format content for the prompt
    const formattedContent = `Title: ${title}\n\n${content}`;
    
    // Create a system prompt tailored to educational writing assessment based on Common Core standards
    const systemPrompt = `You are an expert middle school writing teacher evaluating student work according to Common Core standards for grade ${grade}. 
    
Analyze the following student writing sample focusing on three key areas:
1. Mechanics: grammar, punctuation, spelling, and sentence structure
2. Sequencing: organization, logical flow, transitions, and paragraph structure
3. Voice: clarity of purpose, audience awareness, style, tone, and word choice

Provide thoughtful, encouraging feedback that highlights strengths while offering specific improvement suggestions.`;

    const userPrompt = `Please analyze this writing sample and provide detailed feedback in JSON format:
${formattedContent}

The response should be formatted as a JSON object with these fields:
- overallFeedback: A summary of overall assessment (2-3 sentences)
- strengthsAnalysis: Specific strengths identified (2-3 points)
- areasToImprove: Areas needing improvement (2-3 specific points)
- mechanicsScore: A score from 0-100 for mechanics
- sequencingScore: A score from 0-100 for sequencing
- voiceScore: A score from 0-100 for voice
- suggestions: An object with arrays of specific suggestions for each area (mechanics, sequencing, voice)
- nextSteps: Recommended follow-up learning activities (1-2 sentences)`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse the response
    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    
    // Ensure the response has all the required fields
    const feedback: AIFeedback = {
      overallFeedback: result.overallFeedback || "Overall good work with some areas to improve.",
      strengthsAnalysis: result.strengthsAnalysis || "Strong effort on completing the assignment.",
      areasToImprove: result.areasToImprove || "Focus on improving your writing structure.",
      mechanicsScore: result.mechanicsScore || 70,
      sequencingScore: result.sequencingScore || 70,
      voiceScore: result.voiceScore || 70,
      suggestions: {
        mechanics: result.suggestions?.mechanics || ["Review punctuation rules"],
        sequencing: result.suggestions?.sequencing || ["Practice paragraph transitions"],
        voice: result.suggestions?.voice || ["Consider your audience more carefully"]
      },
      nextSteps: result.nextSteps || "Practice writing more persuasive paragraphs."
    };

    // Calculate skill mastery scores (normalized to 0-100)
    const skillsAssessed: SkillMastery = {
      mechanics: feedback.mechanicsScore,
      sequencing: feedback.sequencingScore,
      voice: feedback.voiceScore
    };

    return {
      feedback,
      skillsAssessed
    };
  } catch (error) {
    console.error("OpenAI writing analysis error:", error);
    throw new Error("Failed to analyze writing sample");
  }
}

// Generate suggested exercises based on feedback and current skill levels
export async function generateSuggestedExercises(
  feedback: AIFeedback,
  currentSkillMastery: SkillMastery
): Promise<string[]> {
  try {
    // Determine the weakest skill area
    const skillAreas = [
      { name: "mechanics", score: feedback.mechanicsScore, current: currentSkillMastery.mechanics },
      { name: "sequencing", score: feedback.sequencingScore, current: currentSkillMastery.sequencing },
      { name: "voice", score: feedback.voiceScore, current: currentSkillMastery.voice }
    ];
    
    // Sort by score (ascending) to find weakest areas
    skillAreas.sort((a, b) => a.score - b.score);
    
    // Create a prompt that focuses on the weakest areas
    const systemPrompt = `You are an expert curriculum designer for middle school writing education.
Based on a student's recent writing assessment, recommend specific exercise IDs from our database that would help them improve their weakest areas.`;

    const userPrompt = `A student has received the following feedback on their writing:
- Mechanics score: ${feedback.mechanicsScore}/100
- Sequencing score: ${feedback.sequencingScore}/100
- Voice score: ${feedback.voiceScore}/100

Current skill mastery levels:
- Mechanics: ${currentSkillMastery.mechanics}/100
- Sequencing: ${currentSkillMastery.sequencing}/100
- Voice: ${currentSkillMastery.voice}/100

Areas to improve: ${feedback.areasToImprove}

Based on this assessment, recommend 3-5 exercise IDs from our database that would help this student improve. 
Focus on their weakest areas but provide a balanced approach. Return your response as a JSON array of exercise IDs.

Available exercise types: 
- mechanics-[1-10]
- sequencing-[1-10]
- voice-[1-10]`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse the response
    const content = response.choices[0].message.content || '{}';
    const result = JSON.parse(content);
    
    // Extract suggested exercises
    const suggestedExercises = Array.isArray(result.exercises) 
      ? result.exercises 
      : Array.isArray(result) 
        ? result 
        : ["mechanics-1", "sequencing-1", "voice-1"]; // Default fallback
    
    return suggestedExercises;
  } catch (error) {
    console.error("OpenAI exercise suggestion error:", error);
    return ["mechanics-1", "sequencing-1", "voice-1"]; // Default fallback on error
  }
}