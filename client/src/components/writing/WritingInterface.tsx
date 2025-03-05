import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocation } from 'wouter';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import WritingFeedback from '@/components/writing/WritingFeedback';
import { WritersBlockModal } from '@/components/writing/WritersBlockModal';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import type { AIFeedback, SkillMastery } from '@shared/schema';

export interface WritingQuestProps {
  questId: string;
  title: string;
  description: string;
  tags: string[];
  minWordCount?: number;
  onSubmit: (questId: string, title: string, content: string) => Promise<any>;
  onSaveDraft: (questId: string, title: string, content: string) => void;
}

const WritingInterface: React.FC<WritingQuestProps> = ({
  questId,
  title: questTitle,
  description,
  tags,
  minWordCount = 0,
  onSubmit,
  onSaveDraft,
}) => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [writersBlockDialogOpen, setWritersBlockDialogOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  
  const isREDI = theme === 'redi';
  
  // Calculate word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const meetsWordCount = !minWordCount || wordCount >= minWordCount;
  
  // Theme-specific classes
  const questBgClass = isREDI ? 'bg-[#1e1e1e]' : 'bg-[#2d4438]';
  const primaryBgClass = isREDI 
    ? 'bg-gradient-to-r from-[#6320ee] to-[#1c77c3]' 
    : 'bg-gradient-to-r from-[#3cb371] to-[#588157]';
  const secondaryBgClass = isREDI 
    ? 'bg-[#1e1e1e] border border-[#39ff14]' 
    : 'bg-[#2d4438] border border-[#ffd700]';
  const accentColor = isREDI ? 'text-[#39ff14]' : 'text-[#ffd700]';
  const tagBgClass = isREDI 
    ? 'bg-[#6320ee] bg-opacity-20 text-[#39ff14]' 
    : 'bg-[#3cb371] bg-opacity-20 text-[#ffd700]';
  const fontClass = isREDI ? 'font-orbitron' : 'font-montserrat';
  
  const handleOpenSubmitDialog = () => {
    if (title.trim() && content.trim() && meetsWordCount) {
      setSubmissionDialogOpen(true);
    }
  };
  
  // Analysis mutation
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
      setSubmissionData({
        ...submissionData,
        aiFeedback: data.feedback,
        skillsAssessed: data.skillsAssessed,
        suggestedExercises: data.suggestedExercises || []
      });
      setIsLoadingAnalysis(false);
      toast({
        title: 'Analysis Complete',
        description: 'Your writing has been analyzed successfully.',
      });
    },
    onError: (error) => {
      setIsLoadingAnalysis(false);
      toast({
        title: 'Analysis Failed',
        description: 'There was an error analyzing your writing. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Analysis mutation only

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const result = await onSubmit(questId, title, content);
      
      // Store the submission data for later analysis display
      setSubmissionData(result);
      setSubmissionSuccess(true);
      
      // Request analysis right away
      setIsLoadingAnalysis(true);
      analysisMutation.mutate({
        submissionId: result.id,
        questId: result.questId,
        title: result.title,
        content: result.content
      });
      
      // Keep dialog open to show success message
    } catch (error) {
      console.error("Error submitting quest:", error);
      setSubmissionSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleWritersBlockHelp = () => {
    setWritersBlockDialogOpen(true);
  };
  
  const handleWritersBlockSubmit = () => {
    if (writersBlockPrompt.trim()) {
      setIsLoadingWritersBlockResponse(true);
      writersBlockMutation.mutate({
        questId,
        title: title || questTitle,
        prompt: writersBlockPrompt,
        currentContent: content
      });
    }
  };
  
  const handleSaveDraft = () => {
    if (title.trim() || content.trim()) {
      onSaveDraft(questId, title, content);
    }
  };
  
  const closeSubmitDialog = () => {
    setSubmissionDialogOpen(false);
    // Reset success status when closing
    if (submissionSuccess) {
      setSubmissionSuccess(false);
    }
  };

  return (
    <div className="flex flex-col flex-grow">
      <div className={`${questBgClass} rounded-lg p-4 mb-4`}>
        <h3 className={`text-white ${fontClass} text-lg mb-2`}>Quest: {questTitle}</h3>
        <p className="text-gray-200 text-sm mb-3">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} className={tagBgClass}>
              {tag}
            </Badge>
          ))}
          {minWordCount > 0 && (
            <Badge className={tagBgClass}>
              {minWordCount}+ words
            </Badge>
          )}
        </div>
      </div>
      
      {!submissionData && (
        <>
          {/* Writing area */}
          <div className="bg-white rounded-xl p-5 shadow-lg flex flex-col flex-grow mb-4">
            <div className="mb-2">
              <Input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border-b border-gray-300 font-medium text-lg focus:outline-none focus:border-[#3cb371]"
              />
            </div>
            <Textarea
              placeholder="Start writing here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-grow p-3 text-gray-800 resize-none border-0 focus:outline-none font-inter"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Word count: {wordCount}</span>
              {minWordCount > 0 && (
                <span className={meetsWordCount ? 'text-green-500' : 'text-red-500'}>
                  {minWordCount} minimum
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleWritersBlockHelp}
              className={`w-full py-2 font-medium text-white ${secondaryBgClass} rounded-md hover:bg-opacity-90 transition text-sm ${fontClass}`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Writer's Block Help
            </Button>
            <Button
              onClick={handleOpenSubmitDialog}
              disabled={!title.trim() || !content.trim() || !meetsWordCount}
              className={`w-full py-2 font-medium text-white ${primaryBgClass} rounded-md shadow hover:opacity-90 transition text-sm ${fontClass}`}
            >
              Submit Quest
            </Button>
          </div>
        </>
      )}
      
      {/* Analysis and Submission Results */}
      {submissionData && (
        <div className="mt-2 space-y-6">
          {/* Submitted Content */}
          <Card className={`${questBgClass} border-t-4 border-t-[#ffd700] p-4 shadow-md`}>
            <h3 className={`text-lg font-bold text-white mb-2`}>Your Submission</h3>
            <h4 className={`text-md font-semibold ${accentColor} mb-1`}>{submissionData.title}</h4>
            <div className="max-h-60 overflow-y-auto pr-2 text-white">
              <p className="whitespace-pre-wrap">{submissionData.content}</p>
            </div>
          </Card>
          
          {/* Analysis Loading or Display */}
          {isLoadingAnalysis ? (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-gray-600 text-center">
                Analyzing your writing...<br />
                This may take a moment
              </p>
            </div>
          ) : submissionData.aiFeedback ? (
            <WritingFeedback 
              feedback={submissionData.aiFeedback as AIFeedback}
              skillsAssessed={submissionData.skillsAssessed as SkillMastery}
              suggestedExercises={submissionData.suggestedExercises || []}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-center mb-4">
                Waiting for analysis to complete...
              </p>
              <Button 
                onClick={() => {
                  setIsLoadingAnalysis(true);
                  analysisMutation.mutate({
                    submissionId: submissionData.id,
                    questId: submissionData.questId,
                    title: submissionData.title,
                    content: submissionData.content
                  });
                }}
                className={primaryBgClass}
              >
                Request Analysis
              </Button>
            </div>
          )}
          
          {/* Return to OWL Town button */}
          <div className="flex justify-center mt-6">
            <Button 
              onClick={() => navigate('/owl')}
              variant="outline"
              className="px-6"
            >
              Return to Town
            </Button>
          </div>
        </div>
      )}

      {/* Submission Confirmation Dialog */}
      <Dialog open={submissionDialogOpen} onOpenChange={closeSubmitDialog}>
        <DialogContent className={`${fontClass} p-6 max-w-md`}>
          {!submissionSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl mb-2">Submit Your Quest?</DialogTitle>
                <DialogDescription>
                  Are you ready to submit your writing? Once submitted, your writing will be analyzed and you'll receive personalized feedback and skill rewards.
                </DialogDescription>
              </DialogHeader>

              <div className="my-4 p-3 bg-gray-100 rounded-md">
                <h4 className="font-medium mb-1">{title}</h4>
                <p className="text-sm text-gray-700 truncate">{content.substring(0, 100)}...</p>
                <p className="text-xs text-gray-500 mt-2">{wordCount} words</p>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={closeSubmitDialog}
                  className={`mr-2 ${secondaryBgClass}`}
                >
                  Keep Editing
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={primaryBgClass}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quest'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className={`text-xl mb-2 ${accentColor}`}>Quest Submitted!</DialogTitle>
                <DialogDescription>
                  Your writing has been submitted successfully. You've earned stars for your effort!
                </DialogDescription>
              </DialogHeader>
              
              <div className="my-6 text-center">
                <div className="inline-block p-4 bg-yellow-100 rounded-full mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium mt-2">Your writing is being analyzed</p>
                <p className="text-sm text-gray-600 mt-1">Your feedback will appear on this page when ready!</p>
              </div>

              <DialogFooter>
                <Button 
                  onClick={closeSubmitDialog}
                  className={primaryBgClass}
                >
                  View Analysis
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Writer's Block Help Modal */}
      <WritersBlockModal
        open={writersBlockDialogOpen}
        onOpenChange={setWritersBlockDialogOpen}
        questId={questId}
        title={title || questTitle}
        currentContent={content}
      />
    </div>
  );
};

export default WritingInterface;
