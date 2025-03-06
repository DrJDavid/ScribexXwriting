import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import WritingInterface from '@/components/writing/WritingInterface';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  prompt: string;
  wordMinimum: number;
  skillFocus: 'mechanics' | 'sequencing' | 'voice';
  difficulty: number;
}

const DailyWritingChallenge: React.FC = () => {
  const { setTheme } = useTheme();
  const params = useParams<{ challengeId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const { updateStreak } = useProgress();

  // Use synthwave theme for daily challenges
  useEffect(() => {
    setTheme('redi');
  }, [setTheme]);
  
  // Fetch the challenge data
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setIsLoading(true);
        const data = await apiRequest(`/api/daily-challenge/${params.challengeId}`, 'GET');
        if (data) {
          setChallenge(data);
        } else {
          // Handle missing challenge
          toast({
            title: "Challenge Not Found",
            description: "The requested daily challenge could not be found.",
            variant: "destructive"
          });
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching daily challenge:", error);
        toast({
          title: "Error",
          description: "Failed to load the daily challenge. Please try again.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.challengeId) {
      fetchChallenge();
    }
  }, [params.challengeId, navigate, toast]);

  // Submit writing mutation
  const submitWritingMutation = useMutation({
    mutationFn: async (data: { challengeId: string; title: string; content: string }) => {
      return apiRequest('/api/daily-challenge/submit', 'POST', data);
    },
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: { challengeId: string; title: string; content: string }) => {
      return apiRequest('/api/daily-challenge/draft', 'POST', data);
    },
  });

  // Handle submission
  const handleSubmit = async (questId: string, title: string, content: string) => {
    try {
      const result = await submitWritingMutation.mutateAsync({ 
        challengeId: params.challengeId, 
        title, 
        content 
      });
      
      // Update streak
      if (updateStreak) {
        await updateStreak(true);
      }
      
      toast({
        title: "Challenge Completed!",
        description: "Your daily writing has been submitted successfully.",
      });
      
      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error("Error submitting challenge:", error);
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your writing. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle saving draft
  const handleSaveDraft = async (questId: string, title: string, content: string) => {
    try {
      await saveDraftMutation.mutateAsync({ 
        challengeId: params.challengeId, 
        title, 
        content 
      });
      
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved.",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Save Error",
        description: "There was a problem saving your draft. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle going back
  const handleBack = () => {
    navigate('/');
  };

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout title="Loading Challenge..." showBackButton={true} onBackClick={handleBack}>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Loading your daily challenge...</p>
        </div>
      </MainLayout>
    );
  }

  // Handle missing challenge data
  if (!challenge) {
    return (
      <MainLayout title="Challenge Not Found" showBackButton={true} onBackClick={handleBack}>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-xl mb-4">We couldn't find the requested daily challenge.</p>
          <p className="mb-6">This could be because the challenge has expired or no longer exists.</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Return to Home
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={challenge.title} 
      showBackButton={true}
      onBackClick={handleBack}
      subtitle="Daily Challenge"
    >
      <WritingInterface
        questId={params.challengeId}
        title={challenge.title}
        description={challenge.description + "\n\n" + challenge.prompt}
        tags={[`Skill Focus: ${challenge.skillFocus}`, `Difficulty: ${challenge.difficulty}`]}
        minWordCount={challenge.wordMinimum}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
      />
    </MainLayout>
  );
};

export default DailyWritingChallenge;