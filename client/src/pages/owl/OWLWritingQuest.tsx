import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import WritingInterface from '@/components/writing/WritingInterface';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getQuestById } from '@/data/quests';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

const OWLWritingQuest: React.FC = () => {
  const { setTheme } = useTheme();
  const params = useParams<{ questId: string }>();
  const [, navigate] = useLocation();
  const { completeQuest } = useProgress();
  const { toast } = useToast();
  
  // Make sure OWL theme is active
  useEffect(() => {
    setTheme('owl');
  }, [setTheme]);
  
  // Check if this is a free-write or a regular quest
  const isFreeWrite = params.questId === 'free-write';
  
  // For free-write, get location and prompt type from query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const locationId = searchParams.get('locationId');
  const promptType = searchParams.get('promptType');
  
  // Get the quest data for regular quests
  const quest = isFreeWrite ? null : getQuestById(params.questId);
  
  // If regular quest not found, go back to town
  useEffect(() => {
    if (!isFreeWrite && !quest && params.questId) {
      navigate('/owl');
    }
  }, [isFreeWrite, quest, params.questId, navigate]);
  
  // If free-write but missing parameters, go back to town
  useEffect(() => {
    if (isFreeWrite && (!locationId || !promptType)) {
      navigate('/owl');
    }
  }, [isFreeWrite, locationId, promptType, navigate]);
  
  // Create a virtual quest for free-write mode
  const freeWriteQuest = isFreeWrite ? {
    id: 'free-write',
    locationId: locationId || '',
    title: `Free ${promptType?.charAt(0).toUpperCase() + promptType?.slice(1) || 'Creative'} Writing`,
    description: `Express yourself freely in ${promptType || 'creative'} writing format.`,
    tags: ['free-writing', promptType || 'creative'],
    minWordCount: 100,
    skillFocus: 'voice' as const,
    level: 1,
    unlockRequirements: {
      skillMastery: { mechanics: 0, sequencing: 0, voice: 0 },
    }
  } : null;
  
  // Use either the real quest or the free-write quest
  const currentQuest = quest || freeWriteQuest;
  
  if (!currentQuest) {
    return null;
  }
  
  // Submit writing mutation
  const submitWritingMutation = useMutation({
    mutationFn: async (data: { questId: string; title: string; content: string }) => {
      const res = await apiRequest('POST', '/api/writing/submit', data);
      return res.json();
    },
  });
  
  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: { questId: string; title: string; content: string }) => {
      const res = await apiRequest('POST', '/api/writing/draft', data);
      return res.json();
    },
  });
  
  // Handle submission
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
  
  // Handle saving draft
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
  
  // Handle back button
  const handleBack = () => {
    navigate('/owl');
  };

  return (
    <MainLayout 
      title={quest.title} 
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
        questId={quest.id}
        title={quest.title}
        description={quest.description}
        tags={quest.tags}
        minWordCount={quest.minWordCount}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
      />
    </MainLayout>
  );
};

export default OWLWritingQuest;
