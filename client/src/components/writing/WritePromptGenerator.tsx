import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw, Check } from 'lucide-react';
import type { TownLocation } from '@/data/quests';
import { useToast } from '@/hooks/use-toast';

// Simple data structure for the generated prompt
export interface GeneratedPrompt {
  prompt: string;
  scenario: string;
  guidingQuestions: string[];
  suggestedElements: string[];
  challengeElement: string;
}

interface WritePromptGeneratorProps {
  location: TownLocation;
  onSelectPrompt: (promptData: GeneratedPrompt) => void;
  className?: string;
  initialPrompt?: GeneratedPrompt | null;
}

export function WritePromptGenerator({ 
  location, 
  onSelectPrompt,
  className = '' 
}: WritePromptGeneratorProps) {
  // Component state
  const [customFocus, setCustomFocus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const { toast } = useToast();

  // Generate a prompt based on the location type and custom focus
  async function generatePrompt() {
    if (!customFocus.trim() && customFocus.length > 0) {
      toast({
        title: "Empty Focus",
        description: "Please enter a custom focus or clear the field to use the default focus.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Logging the request parameters
      const requestBody = {
        locationType: location.type,
        locationName: location.name,
        customFocus: customFocus.trim() || null,
      };
      console.log("Sending prompt generation request:", requestBody);
      
      const response = await fetch('/api/writing/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Log the response status
      console.log(`Prompt generation response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to generate prompt: ${response.status} ${response.statusText}`);
      }

      // Get the response data
      const text = await response.text();
      console.log("Raw response:", text);
      
      // Try to parse the JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Unable to parse server response");
      }
      
      console.log("Parsed prompt data:", data);
      
      // Validate the response structure
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid response format");
      }
      
      // Check for required fields and fix any missing ones
      const validatedPrompt: GeneratedPrompt = {
        prompt: data.prompt || `Write about ${location.name}`,
        scenario: data.scenario || `Imagine yourself in ${location.name}...`,
        guidingQuestions: Array.isArray(data.guidingQuestions) ? data.guidingQuestions : ["What happened?", "Who was involved?", "How did it end?"],
        suggestedElements: Array.isArray(data.suggestedElements) ? data.suggestedElements : ["Character", "Setting", "Plot"],
        challengeElement: data.challengeElement || "Try incorporating a surprising twist"
      };
      
      // Add to the list of prompts (newest first)
      setGeneratedPrompts(prevPrompts => [validatedPrompt, ...prevPrompts].slice(0, 3));
      
      // Create a deep copy of the prompt to ensure we're not passing references that could be changed
      const promptToSend = {
        prompt: validatedPrompt.prompt,
        scenario: validatedPrompt.scenario,
        guidingQuestions: [...validatedPrompt.guidingQuestions],
        suggestedElements: [...validatedPrompt.suggestedElements],
        challengeElement: validatedPrompt.challengeElement
      };
      
      // Call onSelectPrompt callback to inform parent component about the new prompt
      console.log("Calling onSelectPrompt with generated prompt:", promptToSend);
      
      // Add a very slight delay to ensure state updates properly
      setTimeout(() => {
        onSelectPrompt(promptToSend);
      }, 50);
      
      // Show success toast
      toast({
        title: "Prompt Generated Successfully!",
        description: "Your custom writing prompt is ready. Review it now!",
      });
      
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate a writing prompt. Using a fallback prompt instead.",
        variant: "destructive"
      });
      
      // Add fallback prompt if API fails
      const fallbackPrompt = generateFallbackPrompt(location);
      setGeneratedPrompts(prevPrompts => [fallbackPrompt, ...prevPrompts].slice(0, 3));
      
      // Call onSelectPrompt with the fallback prompt
      console.log("Calling onSelectPrompt with fallback prompt");
      
      // Add a very slight delay to ensure state updates properly
      setTimeout(() => {
        onSelectPrompt(fallbackPrompt);
      }, 50);
      
      // Show toast
      toast({
        title: "Fallback Prompt Generated",
        description: "We're using a basic prompt since the custom one failed to generate.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function generateFallbackPrompt(location: TownLocation): GeneratedPrompt {
    const basePrompts = {
      narrative: {
        prompt: `Create a story set in ${location.name}`,
        scenario: `You find yourself in ${location.name} and witness something unexpected.`,
        guidingQuestions: ["Who are the main characters?", "What conflict occurs?", "How is it resolved?"],
        suggestedElements: ["Character development", "Plot twist", "Vivid setting description"],
        challengeElement: "Include dialogue that reveals something about a character's past"
      },
      descriptive: {
        prompt: `Describe the sights, sounds, and feelings of ${location.name}`,
        scenario: `You're visiting ${location.name} for the first time and want to capture every detail.`,
        guidingQuestions: ["What sensory details stand out?", "How does the atmosphere feel?", "What makes this place unique?"],
        suggestedElements: ["Sensory language", "Figurative language", "Specific details"],
        challengeElement: "Describe one element using all five senses"
      },
      argumentative: {
        prompt: `Make a case for why ${location.name} is important to the community`,
        scenario: `The town council is considering closing ${location.name}. Write an argument to preserve it.`,
        guidingQuestions: ["What main points support your argument?", "What counterarguments exist?", "How would you conclude?"],
        suggestedElements: ["Clear thesis statement", "Supporting evidence", "Logical structure"],
        challengeElement: "Address and refute a strong counterargument"
      },
      informative: {
        prompt: `Explain the history and significance of ${location.name}`,
        scenario: `You're writing an informative guide about ${location.name} for new visitors.`,
        guidingQuestions: ["What key facts are important?", "How has it changed over time?", "Why should people care?"],
        suggestedElements: ["Clear organization", "Factual information", "Explanatory details"],
        challengeElement: "Explain a complex concept related to this location in simple terms"
      },
      reflective: {
        prompt: `Reflect on a meaningful experience at ${location.name}`,
        scenario: `You're journaling about a time at ${location.name} that changed your perspective.`,
        guidingQuestions: ["What happened?", "How did it affect you?", "What did you learn?"],
        suggestedElements: ["Personal voice", "Honest reflection", "Insight or realization"],
        challengeElement: "Connect your experience to a broader life lesson or truth"
      }
    };

    return basePrompts[location.type as keyof typeof basePrompts];
  }

  // Function to handle selecting a previously generated prompt
  const handleSelectPrompt = (prompt: GeneratedPrompt) => {
    console.log("Selected previously generated prompt:", prompt);
    
    // Create a deep copy to ensure no reference issues
    const promptToSend = {
      prompt: prompt.prompt,
      scenario: prompt.scenario,
      guidingQuestions: [...prompt.guidingQuestions],
      suggestedElements: [...prompt.suggestedElements],
      challengeElement: prompt.challengeElement
    };
    
    // Call onSelectPrompt callback with the copied prompt after a slight delay
    setTimeout(() => {
      console.log("Calling onSelectPrompt with selected prompt:", promptToSend);
      onSelectPrompt(promptToSend);
    }, 50);
    
    // Show toast notification
    toast({
      title: "Prompt Selected",
      description: "Review your selected prompt and start writing when ready.",
    });
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <label htmlFor="customFocus" className="block text-sm font-medium mb-1">
          Custom Focus (Optional)
        </label>
        <Textarea
          id="customFocus"
          placeholder={`Add a specific theme, element, or focus for your ${location.type} writing prompt...`}
          value={customFocus}
          onChange={(e) => setCustomFocus(e.target.value)}
          className="resize-none"
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Leave blank to generate a general prompt or specify what you'd like to focus on
        </p>
      </div>

      <Button 
        onClick={generatePrompt}
        disabled={isLoading}
        className="w-full mb-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Prompt
          </>
        )}
      </Button>

      {generatedPrompts.length > 0 && (
        <div className="space-y-4">
          {generatedPrompts.map((prompt, index) => (
            <Card 
              key={index} 
              className="p-4 hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => handleSelectPrompt(prompt)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{prompt.prompt}</h3>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Check className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{prompt.scenario}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
