import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import WritingInterface from '@/components/writing/WritingInterface';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getQuestById, WritingQuest } from '@/data/quests';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface GeneratedPrompt {
  prompt: string;
  scenario: string;
  guidingQuestions: string[];
  suggestedElements: string[];
  challengeElement: string;
}

const OWLWritingQuest: React.FC = () => {
  const { setTheme } = useTheme();
  const params = useParams<{ questId: string }>();
  const [, navigate] = useLocation();
  const { completeQuest } = useProgress();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Make sure OWL theme is active
  useEffect(() => {
    setTheme('owl');
  }, [setTheme]);
  
  // Log component rendering and props for debugging
  console.log("OWLWritingQuest rendering, params:", params);
  
  // Get URL parameters more reliably by using window.location directly
  const searchParams = useMemo(() => {
    const rawSearch = window.location.search;
    const urlParams = new URLSearchParams(rawSearch);
    console.log("Raw URL query string:", rawSearch);
    console.log("URL params:", {
      locationId: urlParams.get('locationId'),
      promptType: urlParams.get('promptType'),
      mode: urlParams.get('mode'),
      promptKey: urlParams.get('promptKey')
    });
    return urlParams;
  }, []);
  
  // Check if this is a free-write or a regular quest - check both the params and the URL path
  const isFreeWrite = params.questId === 'free-write' || window.location.pathname.includes('/free-write');
  console.log("Is free write mode:", isFreeWrite);
  
  // For free-write, get location, prompt type and mode from query parameters
  // Decode URL components if they were encoded
  const locationId = searchParams.get('locationId') ? decodeURIComponent(searchParams.get('locationId')!) : null;
  const promptType = searchParams.get('promptType') ? decodeURIComponent(searchParams.get('promptType')!) : null;
  const mode = searchParams.get('mode') ? decodeURIComponent(searchParams.get('mode')!) : null;
  const promptKey = searchParams.get('promptKey') ? decodeURIComponent(searchParams.get('promptKey')!) : null;
  
  // Parse the prompt data if it exists
  const [generatedPromptData, setGeneratedPromptData] = useState<GeneratedPrompt | null>(null);
  
  useEffect(() => {
    console.log("Checking for prompt key:", { promptKey, mode });
    
    if (promptKey && mode === 'generated') {
      try {
        // Get the prompt data from sessionStorage
        const storedData = sessionStorage.getItem(promptKey);
        console.log("Retrieved data from sessionStorage:", storedData);
        
        if (!storedData) {
          console.error("No data found in sessionStorage for key:", promptKey);
          return;
        }
        
        // Parse the JSON data
        const parsedPrompt = JSON.parse(storedData);
        console.log("Parsed prompt data from sessionStorage:", parsedPrompt);
        
        // Verify the parsed prompt has the required fields
        if (parsedPrompt && parsedPrompt.prompt) {
          // Ensure all the expected properties are present
          const validatedPrompt = {
            prompt: parsedPrompt.prompt || "",
            scenario: parsedPrompt.scenario || "",
            guidingQuestions: Array.isArray(parsedPrompt.guidingQuestions) ? parsedPrompt.guidingQuestions : [],
            suggestedElements: Array.isArray(parsedPrompt.suggestedElements) ? parsedPrompt.suggestedElements : [],
            challengeElement: parsedPrompt.challengeElement || ""
          };
          
          console.log("Valid prompt data loaded:", validatedPrompt);
          setGeneratedPromptData(validatedPrompt);
          
          // Clean up - remove from sessionStorage after loading
          // This helps prevent storage clutter with one-time prompt data
          sessionStorage.removeItem(promptKey);
        } else {
          console.error("Parsed prompt does not have required fields:", parsedPrompt);
        }
      } catch (err) {
        console.error("Error retrieving prompt data from sessionStorage:", err);
        console.error("Error details:", String(err));
      }
    }
  }, [promptKey, mode]);
  
  console.log("Extracted parameters:", { 
    isFreeWrite, 
    locationId, 
    promptType, 
    mode,
    hasPromptKey: !!promptKey,
    questId: params.questId 
  });
  
  // Get the quest data for regular quests
  const quest = useMemo(() => {
    const foundQuest = isFreeWrite ? null : getQuestById(params.questId);
    console.log("Found quest:", foundQuest);
    return foundQuest;
  }, [isFreeWrite, params.questId]);
  
  // Create a virtual quest for free-write mode
  const freeWriteQuest = useMemo(() => {
    if (!isFreeWrite) return null;
    
    console.log("Creating free-write quest with:", { locationId, promptType, mode });
    
    // Safety checks for required parameters
    if (!locationId || !promptType) {
      console.error("Missing required parameters for free-write");
      return null;
    }
    
    // Create a safe version of the quest
    const capitalizedType = promptType 
      ? `${promptType.charAt(0).toUpperCase()}${promptType.slice(1)}`
      : 'Creative';
      
    // Different title and description based on mode
    let title = `Free ${capitalizedType} Writing`;
    let description = `Express yourself freely in ${promptType} writing format.`;
    let questTags = ['free-writing', promptType];
    
    // Adjust title and description based on the mode
    if (mode === 'generated') {
      title = `Generated ${capitalizedType} Prompt`;
      description = `Write based on the custom prompt generated for this ${promptType} writing task.`;
      questTags = [...questTags, 'generated-prompt'];
    } else if (mode === 'free') {
      title = `Free ${capitalizedType} Writing`;
      description = `Express yourself freely without constraints. This ${promptType} writing exercise allows you to explore your own ideas and creativity.`;
      questTags = [...questTags, 'no-constraints'];
    }
      
    const virtualQuest: WritingQuest = {
      id: 'free-write',
      locationId: locationId,
      title: title,
      description: description,
      tags: questTags,
      minWordCount: 150, // Slightly higher for structured prompts
      skillFocus: 'voice' as const,
      level: 1,
      unlockRequirements: {
        skillMastery: { mechanics: 0, sequencing: 0, voice: 0 },
      }
    };
    
    console.log("Created virtual quest:", virtualQuest);
    return virtualQuest;
  }, [isFreeWrite, locationId, promptType, mode]);
  
  // Add redirection effect when parameters are invalid
  useEffect(() => {
    const redirectToOwl = () => {
      console.log("Redirecting to OWL Town due to missing quest data");
      navigate('/owl');
    };
    
    // For free-write mode, we must have both locationId and promptType
    if (isFreeWrite) {
      console.log("Free write mode validation:", { locationId, promptType });
      
      if (!locationId || !promptType) {
        console.error("Missing required parameters for free-write mode");
        toast({
          title: "Navigation Error",
          description: "Missing location or prompt type for free-write mode. Returning to OWL Town.",
          variant: "destructive"
        });
        redirectToOwl();
        return;
      }
      
      // Valid free-write mode with required parameters
      console.log("Valid free-write mode with parameters:", { locationId, promptType });
      setIsLoading(false);
      return;
    }
    
    // For regular quests, we must have a valid quest object
    if (!quest) {
      console.error("No quest found for ID:", params.questId);
      redirectToOwl();
      return;
    }
    
    // If we reach here, we have valid params
    console.log("Valid quest found:", quest.id);
    setIsLoading(false);
  }, [isFreeWrite, locationId, promptType, quest, navigate, params.questId, toast]);
  
  // Submit writing mutation - defined unconditionally to avoid hooks ordering issues
  const submitWritingMutation = useMutation({
    mutationFn: async (data: { questId: string; title: string; content: string }) => {
      const res = await apiRequest('POST', '/api/writing/submit', data);
      return res.json();
    },
  });
  
  // Save draft mutation - defined unconditionally to avoid hooks ordering issues
  const saveDraftMutation = useMutation({
    mutationFn: async (data: { questId: string; title: string; content: string }) => {
      const res = await apiRequest('POST', '/api/writing/draft', data);
      return res.json();
    },
  });
  
  // Handle submission - defined unconditionally
  const handleSubmit = async (questId: string, title: string, content: string) => {
    try {
      const result = await submitWritingMutation.mutateAsync({ questId, title, content });
      
      // Record quest completion
      completeQuest(questId);
      
      // Show toast but don't navigate away - this allows the confirmation dialog to remain visible
      toast({
        title: 'Quest Completed',
        description: 'Your writing has been submitted successfully!',
      });
      
      // Return result - WritingInterface will display it and start analysis
      return result;
    } catch (error) {
      toast({
        title: 'Submission Error',
        description: 'There was a problem submitting your quest.',
        variant: 'destructive',
      });
      throw error; // Re-throw to let WritingInterface know there was an error
    }
  };
  
  // Handle saving draft - defined unconditionally
  const handleSaveDraft = async (questId: string, title: string, content: string) => {
    try {
      await saveDraftMutation.mutateAsync({ questId, title, content });
      
      toast({
        title: 'Draft Saved',
        description: 'Your writing has been saved as a draft.',
      });
    } catch (error) {
      toast({
        title: 'Save Error',
        description: 'There was a problem saving your draft.',
        variant: 'destructive',
      });
    }
  };
  
  // Use either the real quest or the free-write quest
  // If in free-write mode, create a default quest if one wasn't created already
  const currentQuest = quest || freeWriteQuest || (isFreeWrite && locationId && promptType ? {
    id: 'free-write',
    locationId: locationId,
    title: `Free ${promptType.charAt(0).toUpperCase() + promptType.slice(1)} Writing`,
    description: `Express yourself freely in ${promptType} writing format.`,
    tags: ['free-writing', promptType],
    minWordCount: 150,
    skillFocus: 'voice' as const,
    level: 1,
    unlockRequirements: {
      skillMastery: { mechanics: 0, sequencing: 0, voice: 0 },
    }
  } : null);
  
  // Show loading state while checking parameters
  if (isLoading) {
    return (
      <MainLayout title="Loading Quest..." showBackButton={true} onBackClick={() => navigate('/owl')}>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Loading your writing quest...</p>
        </div>
      </MainLayout>
    );
  }
  
  // Handle missing quest data with a user-friendly error message instead of blank screen
  if (!currentQuest) {
    return (
      <MainLayout title="Quest Not Found" showBackButton={true} onBackClick={() => navigate('/owl')}>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-xl mb-4">We couldn't find the requested writing quest.</p>
          <p className="mb-6">This could be because the quest doesn't exist or because required information is missing.</p>
          <button 
            onClick={() => navigate('/owl')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Return to OWL Town
          </button>
        </div>
      </MainLayout>
    );
  }
  
  // Handle back button
  const handleBack = () => {
    navigate('/owl');
  };

  return (
    <MainLayout 
      title={currentQuest.title} 
      showBackButton={true}
      onBackClick={handleBack}
      rightButton={
        <button className="text-white flex items-center">
          Save
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
        </button>
      }
    >
      <WritingInterface
        questId={currentQuest.id}
        title={currentQuest.title}
        description={generatedPromptData ? 
          `${generatedPromptData.prompt}\n\n${generatedPromptData.scenario}` : 
          currentQuest.description}
        tags={currentQuest.tags}
        minWordCount={currentQuest.minWordCount}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        generatedPrompt={generatedPromptData}
      />
    </MainLayout>
  );
};

export default OWLWritingQuest;
