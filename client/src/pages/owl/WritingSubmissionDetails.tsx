import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import MainLayout from '@/components/layouts/MainLayout';
import { useTheme } from '@/context/ThemeContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import WritingFeedback from '@/components/writing/WritingFeedback';
import type { WritingSubmission, AIFeedback, SkillMastery } from '@shared/schema';

const WritingSubmissionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const numId = parseInt(id);
  const { setTheme, theme } = useTheme();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Make sure OWL theme is active
  useEffect(() => {
    setTheme('owl');
  }, [setTheme]);
  
  // Fetch submission details
  const { data: submission, isLoading, error } = useQuery<WritingSubmission>({
    queryKey: ['/api/writing/submissions', numId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/writing/submissions/${numId}`);
      return await res.json() as WritingSubmission;
    },
    enabled: !isNaN(numId),
  });
  
  // Request AI analysis mutation
  const analysisMutation = useMutation<any, Error, {
    submissionId: number;
    questId: string;
    title: string;
    content: string;
  }>({
    mutationFn: async (data) => {
      const res = await apiRequest('POST', '/api/writing/analyze', data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/writing/submissions', numId] });
      toast({
        title: 'Analysis Complete',
        description: 'Your writing has been analyzed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: 'There was an error analyzing your writing. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  const handleRequestAnalysis = () => {
    if (!submission) return;
    
    analysisMutation.mutate({
      submissionId: submission.id,
      questId: submission.questId,
      title: submission.title,
      content: submission.content,
    });
  };
  
  const handleBack = () => {
    navigate('/owl');
  };
  
  // Theme variables
  const isREDI = theme === 'redi';
  const primaryColor = isREDI ? 'text-[#39ff14]' : 'text-[#ffd700]';
  const cardBgClass = isREDI ? 'bg-[#1e1e1e]' : 'bg-[#2d4438]';
  const cardBorderClass = isREDI ? 'border-[#39ff14]' : 'border-[#ffd700]';
  
  // Handle loading state
  if (isLoading) {
    return (
      <MainLayout title="Loading Submission" showBackButton={true} onBackClick={handleBack}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  // Handle error state
  if (error || !submission) {
    return (
      <MainLayout title="Submission Not Found" showBackButton={true} onBackClick={handleBack}>
        <div className="p-4">
          <Card className={`${cardBgClass} border ${cardBorderClass} p-4 shadow-md`}>
            <h3 className={`text-lg font-bold ${primaryColor} mb-2`}>Error</h3>
            <p className="text-white">
              The requested writing submission could not be loaded. Please try again later.
            </p>
            <Button 
              onClick={handleBack}
              className="mt-4 bg-primary hover:bg-primary/80"
            >
              Return to Town
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  // Check if analysis is in progress
  const isAnalyzing = analysisMutation.isPending;
  const hasAIFeedback = submission.aiFeedback && submission.skillsAssessed;
  
  // Render different sections based on state
  const renderAnalysisButton = () => {
    if (!hasAIFeedback && !isAnalyzing) {
      return (
        <div className="flex justify-center my-6">
          <Button 
            onClick={handleRequestAnalysis}
            className="bg-primary hover:bg-primary/80 px-6"
            size="lg"
          >
            Request AI Feedback
          </Button>
        </div>
      );
    }
    return null;
  };
  
  const renderLoadingIndicator = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-white text-center">
            Analyzing your writing...<br />
            This may take a moment
          </p>
        </div>
      );
    }
    return null;
  };
  
  const renderFeedback = () => {
    if (hasAIFeedback) {
      return (
        <WritingFeedback 
          feedback={submission.aiFeedback as AIFeedback}
          skillsAssessed={submission.skillsAssessed as SkillMastery}
          suggestedExercises={(submission.suggestedExercises as string[]) || []}
        />
      );
    }
    return null;
  };
  
  return (
    <MainLayout 
      title={submission.title} 
      showBackButton={true} 
      onBackClick={handleBack}
      subtitle={`Submitted on ${new Date(submission.submittedAt || Date.now()).toLocaleDateString()}`}
    >
      <div className="p-4 space-y-6">
        {/* Writing Content */}
        <Card className={`${cardBgClass} border ${cardBorderClass} p-4 shadow-md`}>
          <h3 className={`text-lg font-bold ${primaryColor} mb-2`}>Your Writing</h3>
          <div className="text-white whitespace-pre-wrap">
            {submission.content}
          </div>
        </Card>
        
        <Separator className="border-gray-600" />
        
        {/* Analysis State */}
        {renderAnalysisButton()}
        {renderLoadingIndicator()}
        {renderFeedback()}
      </div>
    </MainLayout>
  );
};

export default WritingSubmissionDetails;