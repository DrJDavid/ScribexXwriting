import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TownLocation } from "@/data/quests";

interface WritePromptGeneratorProps {
  location: TownLocation;
  onSelectPrompt: (promptData: GeneratedPrompt) => void;
  className?: string;
}

export interface GeneratedPrompt {
  prompt: string;
  scenario: string;
  guidingQuestions: string[];
  suggestedElements: string[];
  challengeElement: string;
}

export function WritePromptGenerator({ 
  location, 
  onSelectPrompt,
  className = ""
}: WritePromptGeneratorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);

  const generatePrompt = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/writing/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId: location.id,
          locationType: location.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate prompt");
      }

      const data = await response.json();
      setGeneratedPrompt(data);
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to generate a writing prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPrompt = () => {
    if (generatedPrompt) {
      onSelectPrompt(generatedPrompt);
    }
  };

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader>
        <CardTitle>AI Writing Prompt</CardTitle>
        <CardDescription>
          Generate a custom writing prompt for {location.name} based on {location.type} writing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!generatedPrompt ? (
          <div className="text-center py-8">
            <p className="mb-4 text-muted-foreground">
              Get a tailored writing prompt that fits the theme and atmosphere of this location!
            </p>
            <Button 
              onClick={generatePrompt} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Writing Prompt"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-1">Writing Prompt</h3>
              <p className="text-primary">{generatedPrompt.prompt}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-1">Scenario</h3>
              <p>{generatedPrompt.scenario}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-1">Guiding Questions</h3>
              <ul className="list-disc pl-5 space-y-1">
                {generatedPrompt.guidingQuestions.map((question, i) => (
                  <li key={i}>{question}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-1">Suggested Elements</h3>
              <div className="flex flex-wrap gap-2">
                {generatedPrompt.suggestedElements.map((element, i) => (
                  <Badge key={i} variant="outline">{element}</Badge>
                ))}
              </div>
            </div>
            
            {generatedPrompt.challengeElement && (
              <div>
                <h3 className="font-medium text-lg mb-1">Challenge Element</h3>
                <Badge variant="secondary">{generatedPrompt.challengeElement}</Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {generatedPrompt && (
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              setGeneratedPrompt(null);
            }}
          >
            Generate New Prompt
          </Button>
          <Button onClick={handleSelectPrompt}>
            Use This Prompt
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}