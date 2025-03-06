import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, useParams, useLocation } from 'wouter';
import { Progress as StudentProgress, SkillMastery, User, WritingSubmission } from '@/types';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar } from '@/components/ui/calendar';

// Constants for the calendar view
const ACTIVE_DAY_STYLE = "bg-green-500 text-white rounded-full";
const INACTIVE_DAY_STYLE = "text-gray-500";

export default function ChildDetails() {
  const { childId } = useParams();
  const [, navigate] = useLocation();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
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

  // Fetch child progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery<StudentProgress>({
    queryKey: ['/api/parent/student', childId, 'progress'],
    enabled: !!childId,
  });

  // Fetch child submissions
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery<WritingSubmission[]>({
    queryKey: ['/api/parent/student', childId, 'submissions'],
    enabled: !!childId,
  });

  const handleBackClick = () => {
    navigate('/parent');
  };

  if (isLoadingChild || isLoadingProgress) {
    return (
      <MainLayout 
        title="Child Details" 
        subtitle="Loading information..." 
        showBackButton 
        onBackClick={handleBackClick}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-center">
            <p>Loading data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!child || !progress) {
    return (
      <MainLayout 
        title="Child Not Found" 
        subtitle="Unable to load information" 
        showBackButton 
        onBackClick={handleBackClick}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500">Information could not be found</p>
            <Button onClick={handleBackClick} className="mt-4">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // For demonstration - days with activity in the last month
  const activeDays = [2, 5, 8, 9, 12, 15, 19, 22, 26, 29];
  
  // Mock activity data for charts
  const weeklyProgress = [
    { day: 'Mon', exercises: 2, writing: 1 },
    { day: 'Tue', exercises: 0, writing: 0 },
    { day: 'Wed', exercises: 3, writing: 0 },
    { day: 'Thu', exercises: 1, writing: 1 },
    { day: 'Fri', exercises: 0, writing: 0 },
    { day: 'Sat', exercises: 4, writing: 2 },
    { day: 'Sun', exercises: 2, writing: 1 },
  ];

  // Skill distribution for pie chart
  const skillDistribution = [
    { name: 'Mechanics', value: progress.rediSkillMastery.mechanics },
    { name: 'Sequencing', value: progress.rediSkillMastery.sequencing },
    { name: 'Voice', value: progress.rediSkillMastery.voice },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <MainLayout 
      title={child.displayName} 
      subtitle={`Grade ${child.grade} - Progress Report`} 
      showBackButton 
      onBackClick={handleBackClick}
    >
      <div className="container mx-auto py-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Current levels and skill development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">REDI Level: Foundation Skills</span>
                  <span className="font-bold">{progress.rediLevel} / 10</span>
                </div>
                <Progress value={progress.rediLevel * 10} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">OWL Level: Writing Mastery</span>
                  <span className="font-bold">{progress.owlLevel} / 10</span>
                </div>
                <Progress value={progress.owlLevel * 10} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{progress.completedExercises.length}</div>
                  <div className="text-sm text-muted-foreground">Exercises Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{progress.completedQuests.length}</div>
                  <div className="text-sm text-muted-foreground">Writing Quests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{progress.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Calendar</CardTitle>
              <CardDescription>Recent learning activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiersClassNames={{
                  selected: "bg-primary text-primary-foreground"
                }}
                components={{
                  DayContent: ({ date: dayDate }) => {
                    const day = dayDate.getDate();
                    const currentMonth = dayDate.getMonth() === new Date().getMonth();
                    const isActiveDay = currentMonth && activeDays.includes(day);
                    
                    return (
                      <div className={isActiveDay ? ACTIVE_DAY_STYLE : ""}>
                        {day}
                      </div>
                    );
                  }
                }}
              />
              <div className="mt-4 text-sm text-center text-muted-foreground">
                Green highlights indicate days with learning activity
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">Weekly Progress</TabsTrigger>
            <TabsTrigger value="skills">Skills Breakdown</TabsTrigger>
            <TabsTrigger value="writing">Recent Writing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Activities completed in the past week</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyProgress}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="exercises" name="Exercises" fill="#6320ee" />
                    <Bar dataKey="writing" name="Writing Activities" fill="#3cb371" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="skills" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skill Distribution</CardTitle>
                  <CardDescription>Mastery across different writing skills</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={skillDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {skillDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Development Tips</CardTitle>
                  <CardDescription>Suggestions to support your child</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    <div className="space-y-4">
                      <div className="p-3 border rounded-lg">
                        <h3 className="font-medium text-blue-600">Mechanics</h3>
                        <p className="text-sm mt-1">
                          Practice identifying grammatical errors in sentences together. 
                          Read stories aloud and discuss punctuation choices.
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <h3 className="font-medium text-green-600">Sequencing</h3>
                        <p className="text-sm mt-1">
                          Ask your child to describe their day in order. Create story cards 
                          that they can arrange in a logical sequence.
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <h3 className="font-medium text-amber-600">Voice</h3>
                        <p className="text-sm mt-1">
                          Encourage creative writing through journaling. Discuss how different 
                          authors have unique voices in books they enjoy.
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <h3 className="font-medium text-purple-600">General Tips</h3>
                        <p className="text-sm mt-1">
                          Set aside 15-20 minutes of daily reading time. Discuss the stories 
                          and ask open-ended questions about the characters and plot.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="writing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Writing Submissions</CardTitle>
                <CardDescription>
                  Your child's latest writing activities
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
                            <Link href={`/parent/submission/${submission.id}`}>
                              <Button variant="outline" size="sm">Read Full Submission</Button>
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