import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, useParams, useLocation } from 'wouter';
import { Progress as StudentProgress, SkillMastery, User, WritingSubmission } from '../../../shared/schema';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StudentDetails() {
  const { studentId } = useParams();
  const [, navigate] = useLocation();
  
  // Fetch student details
  const { data: student, isLoading: isLoadingStudent } = useQuery<Omit<User, 'password'>>({
    queryKey: ['/api/teacher/students', studentId],
    queryFn: async () => {
      // For now, we'll need to get all students and filter
      const students = await fetch('/api/teacher/students').then(res => res.json());
      return students.find((s: any) => s.id === Number(studentId));
    },
    enabled: !!studentId,
  });

  // Fetch student progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery<StudentProgress>({
    queryKey: ['/api/teacher/student', studentId, 'progress'],
    enabled: !!studentId,
  });

  // Fetch student submissions
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery<WritingSubmission[]>({
    queryKey: ['/api/teacher/student', studentId, 'submissions'],
    enabled: !!studentId,
  });

  const handleBackClick = () => {
    navigate('/teacher');
  };

  if (isLoadingStudent || isLoadingProgress) {
    return (
      <MainLayout 
        title="Student Details" 
        subtitle="Loading student information..." 
        showBackButton 
        onBackClick={handleBackClick}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-center">
            <p>Loading student data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!student || !progress) {
    return (
      <MainLayout 
        title="Student Not Found" 
        subtitle="Unable to load student information" 
        showBackButton 
        onBackClick={handleBackClick}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500">Student information could not be found</p>
            <Button onClick={handleBackClick} className="mt-4">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Format data for the skills progress charts
  const rediSkillsData = [
    { name: 'Mechanics', value: progress.rediSkillMastery.mechanics },
    { name: 'Sequencing', value: progress.rediSkillMastery.sequencing },
    { name: 'Voice', value: progress.rediSkillMastery.voice },
  ];

  const owlSkillsData = [
    { name: 'Mechanics', value: progress.owlSkillMastery.mechanics },
    { name: 'Sequencing', value: progress.owlSkillMastery.sequencing },
    { name: 'Voice', value: progress.owlSkillMastery.voice },
  ];

  return (
    <MainLayout 
      title={student.displayName} 
      subtitle={`Student Profile - Grade ${student.grade}`} 
      showBackButton 
      onBackClick={handleBackClick}
    >
      <div className="container mx-auto py-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Student profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2">
                <span className="font-medium">Username:</span>
                <span>{student.username}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="font-medium">Display Name:</span>
                <span>{student.displayName}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="font-medium">Age:</span>
                <span>{student.age}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="font-medium">Grade:</span>
                <span>{student.grade}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Current levels and streaks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">REDI Level</span>
                  <span className="font-bold">{progress.rediLevel}</span>
                </div>
                <Progress value={progress.rediLevel} max={10} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">OWL Level</span>
                  <span className="font-bold">{progress.owlLevel}</span>
                </div>
                <Progress value={progress.owlLevel} max={10} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="font-medium">Writing Streak:</span>
                  <span className="ml-2 font-bold">{progress.currentStreak} days</span>
                </div>
                <div>
                  <span className="font-medium">Best Streak:</span>
                  <span className="ml-2 font-bold">{progress.longestStreak} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="skills" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="skills">Skill Mastery</TabsTrigger>
            <TabsTrigger value="activities">Completed Activities</TabsTrigger>
            <TabsTrigger value="submissions">Writing Submissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="skills" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>REDI Skills</CardTitle>
                  <CardDescription>Mastery levels for REDI foundation skills</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={rediSkillsData}
                      margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Mastery %" fill="#6320ee" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>OWL Skills</CardTitle>
                  <CardDescription>Mastery levels for OWL writing skills</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={owlSkillsData}
                      margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Mastery %" fill="#3cb371" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="activities" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Exercises</CardTitle>
                  <CardDescription>
                    {progress.completedExercises.length} exercises completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    {progress.completedExercises.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No exercises completed yet.
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {progress.completedExercises.map((exerciseId, index) => (
                          <li key={exerciseId} className="p-3 border rounded-lg">
                            <div className="flex justify-between">
                              <span>Exercise #{index + 1}</span>
                              <span className="text-sm text-muted-foreground">ID: {exerciseId}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completed Quests</CardTitle>
                  <CardDescription>
                    {progress.completedQuests.length} writing quests completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    {progress.completedQuests.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No writing quests completed yet.
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {progress.completedQuests.map((questId, index) => (
                          <li key={questId} className="p-3 border rounded-lg">
                            <div className="flex justify-between">
                              <span>Quest #{index + 1}</span>
                              <span className="text-sm text-muted-foreground">ID: {questId}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="submissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Writing Submissions</CardTitle>
                <CardDescription>
                  Recent writing submissions from this student
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSubmissions ? (
                  <div className="text-center py-4">Loading submissions...</div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No writing submissions yet.
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
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
                              <span className={submission.status === 'completed' ? 'text-green-500' : 'text-amber-500'}>
                                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                              </span>
                            </div>
                            <Link href={`/teacher/submission/${submission.id}`}>
                              <Button variant="outline" size="sm">View Full Submission</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}