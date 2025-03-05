import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, SendIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from 'nanoid';
import { ScrollArea } from "@/components/ui/scroll-area";

interface WritersBlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questId: string;
  title: string;
  currentContent: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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

  // Custom chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to send messages to the API
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    try {
      // Create a new user message
      const userMessageId = nanoid();
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: content
      };
      
      // Add user message to the messages
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      // Start loading
      setIsLoading(true);
      setError(null);
      
      // Clear input
      setInput('');
      
      // Call API
      const response = await fetch('/api/writing/writers-block-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questId,
          title,
          currentContent,
          messages: updatedMessages
        }),
      });
      
      // Check response
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Create placeholder for assistant response
      const assistantMessageId = nanoid();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: ''
      };
      
      // Add assistant message placeholder
      setMessages([...updatedMessages, assistantMessage]);
      
      // Read the stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body cannot be read');
      
      let assistantContent = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Convert bytes to text
          const text = new TextDecoder().decode(value);
          
          // Split by lines
          const lines = text.split('\n');
          
          // Process each line
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              
              if (data === '[DONE]') {
                console.log("Stream complete");
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                
                if (parsed.delta || parsed.content) {
                  assistantContent += parsed.delta || parsed.content || '';
                  
                  // Update assistant message with accumulated content
                  setMessages(current => 
                    current.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: assistantContent } 
                        : msg
                    )
                  );
                }
              } catch (e) {
                console.error("Error parsing JSON from stream:", e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      setIsLoading(false);
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to get a response",
        variant: "destructive",
      });
    }
  };
  
  // Form handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
  };

  // Clear messages when dialog is opened
  useEffect(() => {
    if (open) {
      setMessages([]);
    }
  }, [open]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && open) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

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
                        {message.content || (message.role === 'assistant' && isLoading ? 'Thinking...' : '')}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
                    Error: {error.message}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
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