import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, SendIcon, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChat } from 'ai/react';
import { nanoid } from 'nanoid';
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the AI SDK's chat hook
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages
  } = useChat({
    api: "/api/writing/writers-block-help",
    id: nanoid(),
    initialMessages: [], // Start with empty messages array
    body: {
      questId,
      title,
      currentContent
    },
    onResponse: (response) => {
      // Check for successful response
      if (response.status !== 200) {
        console.error("Chat response error:", response.statusText);
      }
    },
    onError: (err) => {
      console.error("Chat error:", err);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Clear messages when dialog is opened
  useEffect(() => {
    if (open) {
      setMessages([]);
    }
  }, [open, setMessages]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && open) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      toast({
        title: "No message",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }
    handleSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] max-h-[700px] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Writing Coach Chat</DialogTitle>
          <DialogDescription>
            Chat with your AI writing coach to get help with your assignment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 min-h-[300px]">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-8 text-muted-foreground">
                  <div>
                    <p className="mb-2">👋 Welcome to your Writing Coach Chat!</p>
                    <p className="text-sm">
                      Describe what you're struggling with, and I'll help you overcome your writer's block.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-muted rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={onFormSubmit} className="flex gap-2">
              <Textarea
                autoFocus
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onFormSubmit(e);
                  }
                }}
                placeholder="Ask for writing help..."
                className="flex-1 min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
              </Button>
            </form>
            
            <div className="mt-2 text-xs text-muted-foreground">
              <p>Press Enter to send, Shift+Enter for a new line</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}