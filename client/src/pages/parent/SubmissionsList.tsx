import React from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WritingSubmission, User } from '@/types';

export default function SubmissionsList() {
  const { childId } = useParams();
  const [, navigate] = useLocation();

  // Fetch child details
  const { data: child, isLoading: isLoadingChild } = useQuery<Omit<User, 'password'>>({
    queryKey: ['/api/parent/students', childId],
    queryFn: async () => {
      // For now, we'll get all students and filter
      const students = await fetch('/api/parent/students').then(res => res.json());
      return students.find((s: any) => s.id === Number(childId));
    },
    enabled: !!childId,
  });

  // Fetch child submissions
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery<WritingSubmission[]>({
    queryKey: [`/api/parent/student/${childId}/submissions`],
    enabled: !!childId,
  });

  const handleBackClick = () => {
    navigate(`/parent/child/${childId}`);
  };

  if (isLoadingChild || isLoadingSubmissions) {
    return (
      <MainLayout
        title="Submissions"
        subtitle="Loading submissions..."
        showBackButton
        onBackClick={handleBackClick}
      >
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-center">
              <p>Loading submissions data...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!child) {
    return (
      <MainLayout
        title="Child Not Found"
        subtitle="Unable to load information"
        showBackButton
        onBackClick={() => navigate('/parent')}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500">Child information could not be found</p>
            <Button onClick={() => navigate('/parent')} className="mt-4">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`${child.displayName}'s Submissions`}
      subtitle="All writing submissions"
      showBackButton
      onBackClick={handleBackClick}
    >
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Writing Submissions</CardTitle>
            <CardDescription>
              All writing submissions from {child.displayName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No writing submissions yet.
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-6">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{submission.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {submission.submittedAt ? 
                            new Date(submission.submittedAt).toLocaleDateString() : 
                            'Draft'}
                        </div>
                      </div>
                      <p className="text-sm line-clamp-3 mb-3">
                        {submission.content.slice(0, 150)}...
                      </p>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm">
                          <span className="font-medium">Status: </span>
                          <Badge variant={
                            submission.status === 'reviewed' ? 'default' :
                            submission.status === 'submitted' ? 'outline' : 'secondary'
                          }>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                        </div>
                        <Link href={`/parent/submission/${submission.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}