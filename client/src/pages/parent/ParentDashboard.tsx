import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { User } from '../../../shared/schema';

type StudentWithoutPassword = Omit<User, 'password'>;

export default function ParentDashboard() {
  const [studentUsername, setStudentUsername] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch students linked to this parent
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<StudentWithoutPassword[]>({
    queryKey: ['/api/parent/students'],
    enabled: !!user && user.role === 'parent',
  });

  // Mutation for linking a student to this parent
  const linkStudentMutation = useMutation({
    mutationFn: async (username: string) => {
      return apiRequest('/api/parent/link-student', {
        method: 'POST',
        body: JSON.stringify({ studentUsername: username }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: 'Student Linked',
        description: `${studentUsername} has been linked to your account.`,
      });
      setStudentUsername('');
      // Invalidate the query to refetch students
      queryClient.invalidateQueries({queryKey: ['/api/parent/students']});
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to link student',
        variant: 'destructive',
      });
    }
  });

  // Mutation for unlinking a student
  const unlinkStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return apiRequest(`/api/parent/unlink-student/${studentId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Student Unlinked',
        description: 'Student has been unlinked from your account.',
      });
      // Invalidate the query to refetch students
      queryClient.invalidateQueries({queryKey: ['/api/parent/students']});
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unlink student',
        variant: 'destructive',
      });
    }
  });

  const handleLinkStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentUsername.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a student username',
        variant: 'destructive',
      });
      return;
    }
    
    linkStudentMutation.mutate(studentUsername);
  };

  const handleUnlinkStudent = (studentId: number) => {
    if (confirm('Are you sure you want to unlink this student?')) {
      unlinkStudentMutation.mutate(studentId);
    }
  };

  return (
    <MainLayout title="Parent Dashboard" subtitle="Monitor your child's learning progress">
      <div className="container mx-auto py-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Link Your Child's Account</CardTitle>
            <CardDescription>
              Enter your child's username to connect their account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLinkStudent} className="flex space-x-4">
              <Input
                placeholder="Student username"
                value={studentUsername}
                onChange={(e) => setStudentUsername(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={linkStudentMutation.isPending}
              >
                {linkStudentMutation.isPending ? 'Linking...' : 'Link Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Children's Accounts</CardTitle>
            <CardDescription>
              View and manage your children's linked accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStudents ? (
              <div className="text-center py-4">Loading accounts...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No accounts linked yet. Use the form above to link your child's account.
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{student.displayName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Username: {student.username} | Grade: {student.grade}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/parent/child/${student.id}`}>
                          <Button variant="outline" size="sm">
                            View Progress
                          </Button>
                        </Link>
                        <Link href={`/parent/child/${student.id}/submissions`}>
                          <Button variant="outline" size="sm">
                            View Writing
                          </Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleUnlinkStudent(student.id)}
                          disabled={unlinkStudentMutation.isPending}
                        >
                          Unlink
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent Resources</CardTitle>
            <CardDescription>
              Helpful tools and materials to support your child's writing journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Writing Support Guide</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn how to support your child's writing development at home.
                  </p>
                  <Button variant="outline" size="sm">Read Guide</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    Understanding your child's writing progress reports.
                  </p>
                  <Button variant="outline" size="sm">View Tutorial</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Writing Prompts</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    Additional writing activities to practice at home.
                  </p>
                  <Button variant="outline" size="sm">Get Prompts</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    Need help? Reach out to our parent support team.
                  </p>
                  <Button variant="outline" size="sm">Get Help</Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}