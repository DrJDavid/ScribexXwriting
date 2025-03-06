import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useProgress } from '@/context/ProgressContext';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Leaf, TreePine, Award, User, Lock, FileText } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  age: z.coerce.number().min(5).max(18),
  grade: z.coerce.number().min(1).max(12),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  newPassword: z.string().min(6, {
    message: "New password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Confirm password must be at least 6 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { progress } = useProgress();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      age: user?.age || 10,
      grade: user?.grade || 6,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      const response = await apiRequest('PATCH', '/api/user/profile', data);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      await apiRequest('PATCH', '/api/user/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      passwordForm.reset();
      
      toast({
        title: 'Password changed',
        description: 'Your password has been successfully changed.',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast({
        title: 'Password change failed',
        description: 'Could not change your password. Please check your current password and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user || !progress) {
    return <div>Loading...</div>;
  }

  // Calculate overall mastery
  const totalMastery = (progress.skillMastery.mechanics + progress.skillMastery.sequencing + progress.skillMastery.voice) / 3;

  return (
    <MainLayout title="Your Profile" subtitle="Manage your account and view your progress">
      <div className="relative overflow-hidden">
        {/* Botanical decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 text-green-200 opacity-10 transform rotate-45">
          <TreePine size={160} />
        </div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 text-green-200 opacity-10 transform -rotate-45">
          <Leaf size={160} />
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Award size={16} />
              <span>Progress</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock size={16} />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Info Card */}
              <Card className="md:col-span-1 relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    About You
                  </CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Username</div>
                      <div className="text-lg font-semibold">{user.username}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Display Name</div>
                      <div className="text-lg font-semibold">{user.displayName}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Age</div>
                      <div className="text-lg font-semibold">{user.age} years old</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Grade</div>
                      <div className="text-lg font-semibold">{user.grade}th Grade</div>
                    </div>
                  </div>
                </CardContent>
                {/* Botanical background element */}
                <div className="absolute bottom-0 right-0 w-20 h-20 text-green-100 opacity-10">
                  <Leaf size={80} />
                </div>
              </Card>

              {/* Edit Profile Form */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your display name" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is how you'll appear to others in the platform.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age</FormLabel>
                              <FormControl>
                                <Input placeholder="Your age" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade</FormLabel>
                              <FormControl>
                                <Input placeholder="Your grade" type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800"
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {/* Overall Progress Card */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Overall Writing Progress
                </CardTitle>
                <CardDescription>Your writing journey at a glance</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Overall Mastery</span>
                      <span className="text-sm font-medium">{Math.round(totalMastery)}%</span>
                    </div>
                    <Progress value={totalMastery} className="h-3 bg-green-100" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Mechanics</span>
                        <span className="text-sm font-medium">{progress.skillMastery.mechanics}%</span>
                      </div>
                      <Progress value={progress.skillMastery.mechanics} className="h-2 bg-green-100" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Sequencing</span>
                        <span className="text-sm font-medium">{progress.skillMastery.sequencing}%</span>
                      </div>
                      <Progress value={progress.skillMastery.sequencing} className="h-2 bg-green-100" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Voice</span>
                        <span className="text-sm font-medium">{progress.skillMastery.voice}%</span>
                      </div>
                      <Progress value={progress.skillMastery.voice} className="h-2 bg-green-100" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-green-200">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                            <FileText size={14} />
                          </span>
                          Exercises
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{progress.completedExercises.length}</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-green-200">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <FileText size={14} />
                          </span>
                          Quests
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{progress.completedQuests.length}</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-green-200">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                            <Award size={14} />
                          </span>
                          Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{progress.achievements.length}</p>
                        <p className="text-sm text-muted-foreground">Unlocked</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              
              {/* Botanical decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 text-green-200 opacity-20 transform rotate-45">
                <TreePine size={128} />
              </div>
              <div className="absolute top-5 right-5 w-6 h-6 text-green-500 opacity-20">
                <Leaf size={24} />
              </div>
              <div className="absolute bottom-10 left-10 w-8 h-8 text-green-500 opacity-20">
                <Leaf size={32} />
              </div>
            </Card>
            
            {/* Unlocked Locations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  Unlocked Locations
                </CardTitle>
                <CardDescription>Places you've discovered in OWL Town</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {progress.unlockedLocations.length > 0 ? (
                    progress.unlockedLocations.map((location) => (
                      <Card key={location} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base font-medium">{location}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                          <div className="text-xs text-muted-foreground">Unlocked</div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground italic">
                      No locations unlocked yet. Explore OWL Town to discover new locations.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Your current password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Your new password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 6 characters long.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "Changing Password..." : "Change Password"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              
              {/* Botanical decorative elements */}
              <div className="absolute -bottom-5 -right-5 w-24 h-24 text-green-100 opacity-10 transform rotate-45">
                <Leaf size={96} />
              </div>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Account Security
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-2">Account Protection</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Remember to use a strong password and never share your login credentials with others.
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">Last password change</div>
                      <div className="text-sm text-muted-foreground">Never</div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" onClick={() => passwordForm.reset()}>
                        Change
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">Connected devices</div>
                      <div className="text-sm text-muted-foreground">Manage devices that are logged in</div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {/* Botanical decorative elements */}
              <div className="absolute -bottom-5 -right-5 w-24 h-24 text-red-100 opacity-10 transform rotate-45">
                <Leaf size={96} />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}