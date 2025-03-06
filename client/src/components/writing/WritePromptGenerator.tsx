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
      
      // Use the modal approach - this is what worked before
      console.log("Setting current prompt and showing modal");
      
      // STEP 1: Set current prompt state
      setCurrentPrompt(promptToSend);
      
      // STEP 2: Call onSelectPrompt callback to inform parent component
      onSelectPrompt(promptToSend);
      
      // STEP 3: Show success toast
      toast({
        title: "Prompt Generated Successfully!",
        description: "Your custom writing prompt is ready. Review it now!",
      });
      
      // STEP 4: Set the modal to open
      // IMPORTANT: This needs to be the last step to make sure the state is updated
      console.log("Opening prompt modal");
      setModalOpen(true);
      
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
      
      // Use the modal approach for the fallback prompt too
      console.log("Setting fallback prompt and showing modal");
      
      // STEP 1: Set current prompt with fallback
      setCurrentPrompt(fallbackPrompt);
      
      // STEP 2: Call onSelectPrompt to maintain backward compatibility
      onSelectPrompt(fallbackPrompt);
      
      // STEP 3: Show toast
      toast({
        title: "Fallback Prompt Generated",
        description: "We're using a basic prompt since the custom one failed to generate.",
      });
      
      // STEP 4: Open the modal to display the fallback prompt
      console.log("Opening modal with fallback prompt");
      setModalOpen(true);
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

  // Function to handle starting writing with current prompt
  const handleStartWriting = () => {
    console.log("handleStartWriting called with currentPrompt:", currentPrompt);
    if (currentPrompt) {
      // Store the generated prompt in sessionStorage to access it from the writing page
      const promptKey = `prompt_${new Date().getTime()}`;
      const promptData = {
        prompt: currentPrompt.prompt,
        scenario: currentPrompt.scenario,
        guidingQuestions: currentPrompt.guidingQuestions || [],
        suggestedElements: currentPrompt.suggestedElements || [],
        challengeElement: currentPrompt.challengeElement || ""
      };
      
      // Store the data in sessionStorage
      sessionStorage.setItem(promptKey, JSON.stringify(promptData));
      console.log("Stored prompt data in sessionStorage with key:", promptKey);
      
      // Force modal to close before navigation to prevent state issues
      setModalOpen(false);
      
      const destinationUrl = `/owl/quest/free-write?locationId=${encodeURIComponent(location.id)}&promptType=${encodeURIComponent(location.type)}&mode=generated&promptKey=${encodeURIComponent(promptKey)}`;
      console.log("Will navigate to:", destinationUrl);
      
      // Show a toast to confirm navigation
      toast({
        title: "Starting Writing Session",
        description: "Taking you to the writing page...",
      });
      
      // Add a small delay before navigation to ensure the modal closes smoothly
      setTimeout(() => {
        console.log(`Navigating to writing page with location ${location.id}`);
        // Navigate to the writing page
        window.location.href = destinationUrl;
      }, 100);
    } else {
      console.error("Cannot start writing: currentPrompt is null");
      toast({
        title: "Error",
        description: "Could not load the prompt. Please try generating a new one.",
        variant: "destructive"
      });
    }
  };

  // Function to handle generating a new prompt
  const handleNewPrompt = () => {
    setCurrentPrompt(null);
    setModalOpen(false);
    setCustomFocus('');
  };

  return (
    <>
      {/* Prompt display dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">Your Custom Prompt is Ready!</DialogTitle>
            <DialogDescription>
              Review your custom prompt below. When you're ready, click "Start Writing" to begin composing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            {currentPrompt ? (
              <>
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Prompt</h3>
                  <p>{currentPrompt.prompt}</p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Scenario</h3>
                  <p>{currentPrompt.scenario}</p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Guiding Questions</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {currentPrompt.guidingQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Suggested Elements</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {currentPrompt.suggestedElements.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Challenge Element</h3>
                  <p>{currentPrompt.challengeElement}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Prompt is being generated...</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            {currentPrompt ? (
              <>
                <Button variant="outline" onClick={handleNewPrompt}>
                  Generate New Prompt
                </Button>
                <Button 
                  variant="default" 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse" 
                  onClick={handleStartWriting}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Start Writing
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* The main prompt generator UI */}
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
                onClick={() => {
                  // Show modal instead of direct navigation
                  console.log("Selected previously generated prompt:", prompt);
                  
                  // STEP 1: Set current prompt
                  setCurrentPrompt(prompt);
                  
                  // STEP 2: Call onSelectPrompt callback
                  onSelectPrompt(prompt);
                  
                  // STEP 3: Open the modal
                  console.log("Opening modal for selected prompt");
                  setModalOpen(true);
                  
                  // STEP 4: Show toast notification
                  toast({
                    title: "Prompt Selected",
                    description: "Review your selected prompt and start writing when ready.",
                  });
                }}
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
    </>
  );
}