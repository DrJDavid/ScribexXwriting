import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/context/ThemeContext';
import MainLayout from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { WritingSubmission } from '@shared/schema';

const OWLSubmissionsList: React.FC = () => {
  const { setTheme, theme } = useTheme();
  const [, navigate] = useLocation();
  
  // Make sure OWL theme is active
  useEffect(() => {
    setTheme('owl');
  }, [setTheme]);
  
  // Fetch user's writing submissions
  const { data: submissions, isLoading, error } = useQuery<WritingSubmission[]>({
    queryKey: ['/api/writing/submissions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/writing/submissions');
      return await res.json() as WritingSubmission[];
    }
  });
  
  const handleViewSubmission = (id: number) => {
    navigate(`/writing/submissions/${id}`);
  };
  
  const handleBackToTown = () => {
    navigate('/owl');
  };
  
  // Theme-specific styles
  const isREDI = theme === 'redi';
  const cardBgClass = isREDI ? 'bg-[#1e1e1e]' : 'bg-[#2d4438]';
  const cardBorderClass = isREDI ? 'border-[#39ff14]' : 'border-[#ffd700]';
  const accentColor = isREDI ? 'text-[#39ff14]' : 'text-[#ffd700]';
  
  // Handle loading state
  if (isLoading) {
    return (
      <MainLayout title="Writing Portfolio" showBackButton={true} onBackClick={handleBackToTown}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <MainLayout title="Writing Portfolio" showBackButton={true} onBackClick={handleBackToTown}>
        <div className="p-4">
          <Card className={`${cardBgClass} border border-red-500 p-4 shadow-md`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-bold text-red-500">Error</h3>
            </div>
            <p className="text-white">
              There was an error loading your writing submissions. Please try again later.
            </p>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout 
      title="Writing Portfolio" 
      subtitle="Your writing submissions and feedback"
      showBackButton={true} 
      onBackClick={handleBackToTown}
    >
      <div className="p-4 space-y-4">
        {submissions && submissions.length > 0 ? (
          submissions.map((submission) => (
            <Card 
              key={submission.id} 
              className={`${cardBgClass} border ${cardBorderClass} p-4 shadow-md relative overflow-hidden`}
            >
              {/* Status indicator */}
              <div className="absolute top-0 right-0">
                {submission.status === 'reviewed' ? (
                  <div className="bg-green-600 text-white px-2 py-1 text-xs uppercase">
                    Reviewed
                  </div>
                ) : (
                  <div className="bg-yellow-600 text-white px-2 py-1 text-xs uppercase">
                    Pending
                  </div>
                )}
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <FileText className={`h-5 w-5 ${accentColor}`} />
                </div>
                
                <div className="flex-grow">
                  <h3 className={`text-lg font-bold ${accentColor} mb-1`}>{submission.title}</h3>
                  
                  <p className="text-gray-300 text-sm mb-2">
                    Submitted: {new Date(submission.submittedAt || Date.now()).toLocaleDateString()}
                  </p>
                  
                  <p className="text-white line-clamp-2 mb-3">
                    {submission.content.substring(0, 120)}...
                  </p>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleViewSubmission(submission.id)}
                      className="bg-primary/90 hover:bg-primary"
                      size="sm"
                    >
                      View {submission.status === 'reviewed' ? 'Feedback' : 'Submission'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className={`${cardBgClass} border ${cardBorderClass} p-6 shadow-md text-center`}>
            <p className="text-white mb-4">You haven't submitted any writing quests yet.</p>
            <Button 
              onClick={handleBackToTown}
              className="bg-primary hover:bg-primary/80"
            >
              Browse Writing Quests
            </Button>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default OWLSubmissionsList;