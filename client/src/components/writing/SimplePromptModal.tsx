import React from 'react';
import { Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { GeneratedPrompt } from './WritePromptGenerator';

interface SimplePromptModalProps {
  isOpen: boolean;
  promptData: GeneratedPrompt | null;
  onClose: () => void;
  onStartWriting: () => void;
  onNewPrompt: () => void;
}

export function SimplePromptModal({
  isOpen,
  promptData,
  onClose,
  onStartWriting,
  onNewPrompt
}: SimplePromptModalProps) {
  if (!isOpen || !promptData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-primary">Your Custom Prompt is Ready!</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-semibold mb-2">Prompt</h3>
            <p>{promptData.prompt}</p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-semibold mb-2">Scenario</h3>
            <p>{promptData.scenario}</p>
          </div>
          
          {promptData.guidingQuestions && promptData.guidingQuestions.length > 0 && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Guiding Questions</h3>
              <ul className="list-disc pl-5 space-y-1">
                {promptData.guidingQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
          
          {promptData.suggestedElements && promptData.suggestedElements.length > 0 && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Suggested Elements</h3>
              <ul className="list-disc pl-5 space-y-1">
                {promptData.suggestedElements.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          
          {promptData.challengeElement && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Challenge Element</h3>
              <p>{promptData.challengeElement}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onNewPrompt}>
            Generate New Prompt
          </Button>
          <Button 
            variant="default" 
            size="lg" 
            className="bg-primary hover:bg-primary/90"
            onClick={onStartWriting}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Start Writing
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}