import React, { useEffect, useState } from 'react';
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
  // Local copy of prompt to ensure it's preserved
  const [localPrompt, setLocalPrompt] = useState<GeneratedPrompt | null>(null);
  
  // Update local prompt when parent prompt changes
  useEffect(() => {
    if (prompt) {
      console.log("Updating localPrompt from prompt:", prompt);
      setLocalPrompt({
        prompt: prompt.prompt,
        scenario: prompt.scenario,
        guidingQuestions: [...(prompt.guidingQuestions || [])],
        suggestedElements: [...(prompt.suggestedElements || [])],
        challengeElement: prompt.challengeElement || ""
      });
    }
  }, [prompt]);
  
  // Debug logging
  useEffect(() => {
    console.log("PromptModal rendered with:", { open, promptExists: !!prompt, localPromptExists: !!localPrompt });
  }, [open, prompt, localPrompt]);
  
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
          {localPrompt ? (
            <>
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">Prompt</h3>
                <p>{localPrompt.prompt}</p>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">Scenario</h3>
                <p>{localPrompt.scenario}</p>
              </div>
              
              {localPrompt.guidingQuestions && localPrompt.guidingQuestions.length > 0 && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Guiding Questions</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {localPrompt.guidingQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {localPrompt.suggestedElements && localPrompt.suggestedElements.length > 0 && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Suggested Elements</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {localPrompt.suggestedElements.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {localPrompt.challengeElement && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Challenge Element</h3>
                  <p>{localPrompt.challengeElement}</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Prompt is being generated...</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          {localPrompt ? (
            <>
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
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}