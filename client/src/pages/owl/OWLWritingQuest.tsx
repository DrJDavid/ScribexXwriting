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
    const urlParams = new URLSearchParams(window.location.search);
    console.log("URL params:", {
      locationId: urlParams.get('locationId'),
      promptType: urlParams.get('promptType')
    });
    return urlParams;
  }, []);
  
  // Check if this is a free-write or a regular quest
  const isFreeWrite = params.questId === 'free-write';
  console.log("Is free write mode:", isFreeWrite);
  
  // For free-write, get location, prompt type and mode from query parameters
  const locationId = searchParams.get('locationId');
  const promptType = searchParams.get('promptType');
  const mode = searchParams.get('mode'); // 'generated' for generated prompts
  
  console.log("Extracted parameters:", { 
    isFreeWrite, 
    locationId, 
    promptType, 
    mode,
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
    
    // If this is a generated prompt mode, adjust the title and description
    if (mode === 'generated') {
      title = `Generated ${capitalizedType} Prompt`;
      description = `Write based on the custom prompt generated for this ${promptType} writing task.`;
      questTags = [...questTags, 'generated-prompt'];
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
    
    if (isFreeWrite && (!locationId || !promptType)) {
      redirectToOwl();
      return;
    }
    
    if (!isFreeWrite && !quest) {
      redirectToOwl();
      return;
    }
    
    // If we reach here, we have valid params
    setIsLoading(false);
  }, [isFreeWrite, locationId, promptType, quest, navigate]);
  
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
  const currentQuest = quest || freeWriteQuest;
  
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
        description={currentQuest.description}
        tags={currentQuest.tags}
        minWordCount={currentQuest.minWordCount}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
      />
    </MainLayout>
  );
};

export default OWLWritingQuest;
