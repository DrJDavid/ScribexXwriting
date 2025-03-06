import React from 'react';
import { Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GeneratedPrompt } from './WritePromptGenerator';

interface PromptDisplayProps {
  prompt: GeneratedPrompt;
  onNewPrompt: () => void;
  onStartWriting: () => void;
}

export function PromptDisplay({ prompt, onNewPrompt, onStartWriting }: PromptDisplayProps) {
  if (!prompt) return null;

  return (
    <Card className="border-primary border-2 shadow-lg">
      <CardHeader className="bg-primary/10">
        <CardTitle>Your Custom Prompt is Ready!</CardTitle>
        <CardDescription>
          Review your custom prompt and start writing when ready
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-semibold mb-2">Prompt</h3>
            <p>{prompt.prompt}</p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-semibold mb-2">Scenario</h3>
            <p>{prompt.scenario}</p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-semibold mb-2">Guiding Questions</h3>
            <ul className="list-disc pl-5 space-y-1">
              {prompt.guidingQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-semibold mb-2">Suggested Elements</h3>
            <ul className="list-disc pl-5 space-y-1">
              {prompt.suggestedElements.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-semibold mb-2">Challenge Element</h3>
            <p>{prompt.challengeElement}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-primary/5">
        <Button variant="outline" onClick={onNewPrompt}>
          Generate New Prompt
        </Button>
        <Button variant="default" size="lg" className="animate-pulse" onClick={onStartWriting}>
          <Pencil className="w-4 h-4 mr-2" />
          Start Writing
        </Button>
      </CardFooter>
    </Card>
  );
}