import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { User } from '@/types';

type StudentWithoutPassword = Omit<User, 'password'>;

export default function TeacherDashboard() {
  const [studentUsername, setStudentUsername] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch students linked to this teacher
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<StudentWithoutPassword[]>({
    queryKey: ['/api/teacher/students'],
    enabled: !!user && user.role === 'teacher',
  });

  // Mutation for linking a student to this teacher
  const linkStudentMutation = useMutation({
    mutationFn: async (username: string) => {
      return apiRequest('/api/teacher/link-student', 'POST', { studentUsername: username });
    },
    onSuccess: () => {
      toast({
        title: 'Student Linked',
        description: `${studentUsername} has been linked to your account.`,
      });
      setStudentUsername('');
      // Invalidate the query to refetch students
      queryClient.invalidateQueries({queryKey: ['/api/teacher/students']});
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
      return apiRequest(`/api/teacher/unlink-student/${studentId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: 'Student Unlinked',
        description: 'Student has been unlinked from your account.',
      });
      // Invalidate the query to refetch students
      queryClient.invalidateQueries({queryKey: ['/api/teacher/students']});
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
    <MainLayout title="Teacher Dashboard" subtitle="Manage your students and view their progress">
      <div className="container mx-auto py-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Link a Student</CardTitle>
            <CardDescription>
              Enter a student's username to link them to your account
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
                {linkStudentMutation.isPending ? 'Linking...' : 'Link Student'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="reports">Progress Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Students</CardTitle>
                <CardDescription>
                  View and manage students linked to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStudents ? (
                  <div className="text-center py-4">Loading students...</div>
                ) : students.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No students linked yet. Use the form above to link students.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-auto pr-2">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{student.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            Username: {student.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Grade: {student.grade}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/teacher/student/${student.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Reports</CardTitle>
                <CardDescription>
                  Track your students' progress and writing development
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStudents ? (
                  <div className="text-center py-4">Loading students...</div>
                ) : students.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No students linked yet. Link students to view their progress.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {students.map((student) => (
                      <div key={student.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{student.displayName}</h3>
                            <p className="text-sm text-muted-foreground">Grade {student.grade}</p>
                          </div>
                          <Link href={`/teacher/student/${student.id}/submissions`}>
                            <Button variant="outline" size="sm">
                              View Submissions
                            </Button>
                          </Link>
                        </div>
                        <Separator className="my-2" />
                        <Link href={`/teacher/student/${student.id}`}>
                          <Button variant="link" className="p-0 h-auto">
                            View detailed progress report →
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}