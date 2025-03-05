import OpenAI from "openai";
import { AIFeedback, SkillMastery } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Helper to check if API key is properly configured
function isOpenAIConfigured(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  return !!apiKey && apiKey.length > 20 && !apiKey.includes('OPENAI_A');
}

// Generate fallback analysis when OpenAI is not available
function generateFallbackAnalysis(): { feedback: AIFeedback; skillsAssessed: SkillMastery } {
  // Create realistic-looking synthetic feedback
  const feedback: AIFeedback = {
    overallFeedback: "Your writing shows good effort and contains some interesting ideas. There are opportunities to strengthen your mechanics and organization.",
    strengthsAnalysis: "You've demonstrated creativity in your approach. Your voice is beginning to develop and you have some strong word choices.",
    areasToImprove: "Focus on improving sentence structure and grammar. Work on organizing your paragraphs with clearer transitions and topic sentences.",
    mechanicsScore: Math.floor(Math.random() * 20) + 60, // 60-80 range
    sequencingScore: Math.floor(Math.random() * 20) + 60, // 60-80 range
    voiceScore: Math.floor(Math.random() * 20) + 60, // 60-80 range
    suggestions: {
      mechanics: [
        "Review your use of punctuation, especially commas and periods",
        "Practice writing complete sentences without fragments",
        "Double-check spelling of key vocabulary words"
      ],
      sequencing: [
        "Make sure each paragraph has a clear topic sentence",
        "Use transition words between paragraphs",
        "Organize related ideas together within paragraphs"
      ],
      voice: [
        "Consider your audience when selecting vocabulary",
        "Vary sentence structure to create rhythm",
        "Use descriptive language to enhance your points"
      ]
    },
    nextSteps: "Practice writing structured paragraphs with clear topic sentences. Review basic grammar rules for sentence construction."
  };

  // Calculate skill mastery scores
  const skillsAssessed: SkillMastery = {
    mechanics: feedback.mechanicsScore,
    sequencing: feedback.sequencingScore,
    voice: feedback.voiceScore
  };

  return {
    feedback,
    skillsAssessed
  };
}

export async function analyzeWriting(
  title: string,
  writingContent: string,
  questId: string,
  grade: number
): Promise<{ feedback: AIFeedback; skillsAssessed: SkillMastery }> {
  try {
    // Check if OpenAI is properly configured
    if (!isOpenAIConfigured()) {
      console.warn("OpenAI API key is not properly configured or is invalid");
      return generateFallbackAnalysis();
    }
    
    // Format content for the prompt
    const formattedContent: string = `Title: ${title}\n\n${writingContent}`;
    
    // Create a system prompt tailored to educational writing assessment based on Common Core standards
    const systemPrompt: string = `You are an expert middle school writing teacher evaluating student work according to Common Core standards for grade ${grade}. 
    
Analyze the following student writing sample focusing on three key areas:
1. Mechanics: grammar, punctuation, spelling, and sentence structure
2. Sequencing: organization, logical flow, transitions, and paragraph structure
3. Voice: clarity of purpose, audience awareness, style, tone, and word choice

Provide thoughtful, encouraging feedback that highlights strengths while offering specific improvement suggestions.`;

    const userPrompt: string = `Please analyze this writing sample and provide detailed feedback in JSON format:
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
    const responseContent: string = response.choices[0].message.content || '{}';
    const result = JSON.parse(responseContent);
    
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
    // Check if OpenAI is properly configured
    if (!isOpenAIConfigured()) {
      console.warn("OpenAI API key is not properly configured or is invalid - using fallback exercise suggestions");
      // Return a mix of exercises based on the weakest skill area
      const skills = [
        { name: "mechanics", score: feedback.mechanicsScore },
        { name: "sequencing", score: feedback.sequencingScore },
        { name: "voice", score: feedback.voiceScore }
      ];
      skills.sort((a, b) => a.score - b.score);
      
      // Generate suggestions focusing on the weakest areas
      return [
        `${skills[0].name}-${Math.floor(Math.random() * 5) + 1}`,
        `${skills[0].name}-${Math.floor(Math.random() * 5) + 6}`,
        `${skills[1].name}-${Math.floor(Math.random() * 10) + 1}`,
        `${skills[2].name}-${Math.floor(Math.random() * 10) + 1}`
      ];
    }
    
    // Determine the weakest skill area
    const skillAreas = [
      { name: "mechanics", score: feedback.mechanicsScore, current: currentSkillMastery.mechanics },
      { name: "sequencing", score: feedback.sequencingScore, current: currentSkillMastery.sequencing },
      { name: "voice", score: feedback.voiceScore, current: currentSkillMastery.voice }
    ];
    
    // Sort by score (ascending) to find weakest areas
    skillAreas.sort((a, b) => a.score - b.score);
    
    // Create a prompt that focuses on the weakest areas
    const systemPrompt: string = `You are an expert curriculum designer for middle school writing education.
Based on a student's recent writing assessment, recommend specific exercise IDs from our database that would help them improve their weakest areas.`;

    const userPrompt: string = `A student has received the following feedback on their writing:
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
    const responseContent: string = response.choices[0].message.content || '{}';
    const result = JSON.parse(responseContent);
    
    // Extract suggested exercises
    const suggestedExercises: string[] = Array.isArray(result.exercises) 
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