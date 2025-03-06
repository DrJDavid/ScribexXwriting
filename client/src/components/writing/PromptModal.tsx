import React, { useEffect } from 'react';
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
  // Debug logging
  useEffect(() => {
    console.log("PromptModal rendered with open:", open);
    console.log("PromptModal prompt:", prompt);
  }, [open, prompt]);

  // Force Dialog to not close when clicking outside if we have a prompt
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && prompt) {
      // If trying to close and we have a prompt, only allow via buttons
      // This prevents accidental dismissal
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">Your Custom Prompt is Ready!</DialogTitle>
          <DialogDescription>
            Review your custom prompt and start writing when ready
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          {prompt ? (
            <>
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">Prompt</h3>
                <p>{prompt.prompt}</p>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-semibold mb-2">Scenario</h3>
                <p>{prompt.scenario}</p>
              </div>
              
              {prompt.guidingQuestions && prompt.guidingQuestions.length > 0 && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Guiding Questions</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {prompt.guidingQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {prompt.suggestedElements && prompt.suggestedElements.length > 0 && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Suggested Elements</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {prompt.suggestedElements.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {prompt.challengeElement && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Challenge Element</h3>
                  <p>{prompt.challengeElement}</p>
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
          {prompt ? (
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