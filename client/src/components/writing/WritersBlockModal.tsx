import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WritersBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questId: string;
  title: string;
  currentContent: string;
}

export function WritersBlockModal({
  open,
  onOpenChange,
  questId,
  title,
  currentContent
}: WritersBlockModalProps) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Clear state when dialog opens
  React.useEffect(() => {
    if (open) {
      setPrompt("");
      setResponse("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "No prompt provided",
        description: "Please describe what you're struggling with",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await apiRequest("POST", "/api/writing/writers-block-help", {
        questId,
        title,
        prompt,
        currentContent
      });
      
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error("Error getting writer's block help:", error);
      toast({
        title: "Failed to get help",
        description: "There was a problem connecting to our writing assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Writer's Block Assistant</DialogTitle>
          <DialogDescription>
            Feeling stuck? Describe what you're struggling with and our AI writing coach will provide suggestions to help you continue.
          </DialogDescription>
        </DialogHeader>
        
        {!response ? (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prompt" className="text-left">
                What are you struggling with?
              </Label>
              <Textarea
                id="prompt"
                placeholder="I'm having trouble starting my conclusion paragraph..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="resize-none"
                disabled={isLoading}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting help...
                  </>
                ) : (
                  "Get help"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-left">Suggestions from your Writing Coach:</Label>
              <div className="bg-muted p-4 rounded-md whitespace-pre-line text-sm">
                {response}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResponse("")}>
                Ask another question
              </Button>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Return to writing
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}