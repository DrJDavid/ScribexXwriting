import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { GeneratedPrompt } from './WritePromptGenerator';

interface PromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: GeneratedPrompt | null;
  onStartWriting: () => void;
  onNewPrompt: () => void;
}

export function PromptModal({ 
  open, 
  onOpenChange, 
  prompt, 
  onStartWriting, 
  onNewPrompt 
}: PromptModalProps) {
  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">Your Custom Prompt is Ready!</DialogTitle>
          <DialogDescription>
            Review your custom prompt and start writing when ready
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
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
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onNewPrompt}>
            Generate New Prompt
          </Button>
          <Button variant="default" size="lg" className="animate-pulse" onClick={onStartWriting}>
            <Pencil className="w-4 h-4 mr-2" />
            Start Writing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}