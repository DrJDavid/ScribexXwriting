import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WritingSubmission, SkillMastery, AIFeedback, User } from '../../types';
import WritingFeedback from '@/components/writing/WritingFeedback';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubmissionDetails() {
  const params = useParams();
  const submissionId = params?.submissionId;
  const [, navigate] = useLocation();

  // Fetch the submission details
  const { data: submission, isLoading: isLoadingSubmission } = useQuery<WritingSubmission>({
    queryKey: [`/api/teacher/submissions/${submissionId}`],
    enabled: !!submissionId,
  });

  // Fetch the student details
  const { data: student, isLoading: isLoadingStudent } = useQuery<User>({
    queryKey: [`/api/teacher/student/${submission?.userId}`],
    enabled: !!submission?.userId,
  });

  const handleBackClick = () => {
    if (student) {
      navigate(`/teacher/student/${student.id}/submissions`);
    } else {
      navigate('/teacher');
    }
  };

  if (isLoadingSubmission || isLoadingStudent) {
    return (
      <MainLayout
        title="Submission Details"
        subtitle="Loading submission information..."
        showBackButton
        onBackClick={handleBackClick}
      >
        <div className="container mx-auto py-6 max-w-4xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!submission) {
    return (
      <MainLayout
        title="Submission Not Found"
        subtitle="Unable to load submission information"
        showBackButton
        onBackClick={handleBackClick}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500">The requested submission could not be found</p>
            <Button onClick={handleBackClick} className="mt-4">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const formattedDate = submission.submittedAt 
    ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Not submitted';

  const renderFeedback = () => {
    if (!submission.aiFeedback || !submission.skillsAssessed) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No feedback available for this submission yet.</p>
        </div>
      );
    }

    const feedback = submission.aiFeedback as unknown as AIFeedback;
    const skillsAssessed = submission.skillsAssessed as unknown as SkillMastery;

    return (
      <WritingFeedback
        feedback={feedback}
        skillsAssessed={skillsAssessed}
        suggestedExercises={submission.suggestedExercises as string[] || []}
      />
    );
  };

  return (
    <MainLayout
      title={`${student?.displayName}'s Submission`}
      subtitle={submission.title}
      showBackButton
      onBackClick={handleBackClick}
    >
      <div className="container mx-auto py-6 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{submission.title}</CardTitle>
                <CardDescription>
                  {formattedDate}
                </CardDescription>
              </div>
              <Badge variant={
                submission.status === 'reviewed' ? 'default' :
                submission.status === 'submitted' ? 'outline' : 'secondary'
              }>
                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">
              {submission.content}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="feedback" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
            <TabsTrigger value="teacher">Teacher Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feedback" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Writing Analysis</CardTitle>
                <CardDescription>
                  Automated feedback on this writing submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderFeedback()}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="teacher" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Feedback</CardTitle>
                <CardDescription>
                  Your notes and feedback for this submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Teacher Notes</h4>
                    <div className="p-4 border rounded-md">
                      {submission.feedback || 
                        <span className="text-muted-foreground italic">No teacher feedback provided yet.</span>
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}