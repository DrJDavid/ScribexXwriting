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
        {/* Advanced botanical decorative elements - Background layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Dynamic animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-teal-50/30 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-teal-950/30 animate-gradient-slow"></div>
          
          {/* Decorative patterns */}
          <div className="absolute top-0 right-0 w-full h-96 opacity-[0.03] dark:opacity-[0.05]" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
          
          {/* Large botanical elements */}
          <div className="absolute -top-20 -right-20 w-80 h-80 text-green-200 opacity-[0.07] transform rotate-45 animate-float-slow">
            <TreePine size={320} />
          </div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 text-green-200 opacity-[0.07] transform -rotate-45 animate-float-slow-reverse">
            <Leaf size={320} />
          </div>
          
          {/* Small botanical elements scattered around */}
          <div className="absolute top-1/4 right-1/3 w-12 h-12 text-emerald-300 opacity-[0.08] transform rotate-12 animate-pulse-slow">
            <Leaf size={48} />
          </div>
          <div className="absolute top-1/2 left-1/5 w-8 h-8 text-green-300 opacity-[0.06] transform -rotate-12 animate-float-slow">
            <Leaf size={32} />
          </div>
          <div className="absolute bottom-1/4 right-1/4 w-14 h-14 text-teal-300 opacity-[0.07] transform rotate-45 animate-float-slow-reverse">
            <TreePine size={56} />
          </div>
          
          {/* Subtle vine patterns */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-200/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-200/30 to-transparent"></div>
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-green-200/30 to-transparent"></div>
          <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-green-200/30 to-transparent"></div>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-gradient-to-r from-green-100/80 via-emerald-100/80 to-teal-100/80 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 backdrop-blur-sm shadow-md rounded-xl p-1 overflow-hidden border border-green-200/50 dark:border-green-700/30">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-green-950/70 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-sm data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300 transition-all duration-200">
              <User size={16} className="animate-pulse-slow" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-green-950/70 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 transition-all duration-200">
              <Award size={16} className="animate-pulse-slow" />
              <span>Progress</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-green-950/70 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-sm data-[state=active]:text-teal-700 dark:data-[state=active]:text-teal-300 transition-all duration-200">
              <Lock size={16} className="animate-pulse-slow" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Subtle dotted vine path */}
          <div className="absolute left-4 top-28 bottom-12 w-[1px] border-l border-green-300/30 border-dashed dark:border-green-700/30 z-0"></div>
          <div className="absolute right-4 top-32 bottom-8 w-[1px] border-l border-green-300/30 border-dashed dark:border-green-700/30 z-0"></div>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Info Card - Enhanced with botanical styling */}
              <Card className="md:col-span-1 relative overflow-hidden group animate-grow-fade border border-green-200/50 dark:border-green-700/30 shadow-md backdrop-blur-sm bg-gradient-to-br from-white/90 via-green-50/80 to-emerald-50/90 dark:from-green-950/90 dark:via-green-900/70 dark:to-emerald-900/80">
                <CardHeader className="pb-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-100/80 to-transparent dark:from-green-900/60 dark:to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                  <CardTitle className="flex items-center gap-2 relative">
                    <div className="p-1.5 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 shadow-sm">
                      <User className="h-4 w-4 text-green-700 dark:text-green-200 animate-pulse-slow" />
                    </div>
                    <span className="bg-gradient-to-r from-green-700 to-emerald-600 dark:from-green-300 dark:to-emerald-200 bg-clip-text text-transparent font-bold">
                      About You
                    </span>
                  </CardTitle>
                  <CardDescription className="relative ml-8">Your personal information</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-5 ml-1">
                    <div className="relative group/item transition-all duration-300 hover:pl-2">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-200 dark:bg-green-700 opacity-0 group-hover/item:opacity-100 rounded-full transition-opacity"></div>
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wide text-xs">Username</div>
                      <div className="text-lg font-semibold group-hover/item:text-green-700 dark:group-hover/item:text-green-300 transition-colors">{user.username}</div>
                    </div>
                    <div className="relative group/item transition-all duration-300 hover:pl-2">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-200 dark:bg-green-700 opacity-0 group-hover/item:opacity-100 rounded-full transition-opacity"></div>
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wide text-xs">Display Name</div>
                      <div className="text-lg font-semibold group-hover/item:text-green-700 dark:group-hover/item:text-green-300 transition-colors">{user.displayName}</div>
                    </div>
                    <div className="relative group/item transition-all duration-300 hover:pl-2">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-200 dark:bg-green-700 opacity-0 group-hover/item:opacity-100 rounded-full transition-opacity"></div>
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wide text-xs">Age</div>
                      <div className="text-lg font-semibold group-hover/item:text-green-700 dark:group-hover/item:text-green-300 transition-colors">{user.age} years old</div>
                    </div>
                    <div className="relative group/item transition-all duration-300 hover:pl-2">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-200 dark:bg-green-700 opacity-0 group-hover/item:opacity-100 rounded-full transition-opacity"></div>
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wide text-xs">Grade</div>
                      <div className="text-lg font-semibold group-hover/item:text-green-700 dark:group-hover/item:text-green-300 transition-colors">{user.grade}th Grade</div>
                    </div>
                  </div>
                </CardContent>
                
                {/* Enhanced decorative elements */}
                <div className="absolute bottom-0 right-0 w-32 h-32 text-green-400 opacity-5 dark:opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                  <Leaf size={128} className="animate-leaf-sway" />
                </div>
                <div className="absolute -top-4 -left-4 w-16 h-16 text-green-400 opacity-5 dark:opacity-10 transform -rotate-12">
                  <TreePine size={64} className="animate-float-slow" />
                </div>
                <div className="absolute top-1/2 right-0 w-1 h-12 bg-gradient-to-b from-transparent via-green-300/30 dark:via-green-500/20 to-transparent"></div>
              </Card>

              {/* Edit Profile Form - Enhanced with botanical styling */}
              <Card className="md:col-span-2 relative overflow-hidden group animate-grow-fade border border-green-200/50 dark:border-green-700/30 shadow-md backdrop-blur-sm bg-gradient-to-br from-white/90 via-green-50/80 to-emerald-50/90 dark:from-green-950/90 dark:via-green-900/70 dark:to-emerald-900/80">
                <CardHeader className="pb-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/80 to-transparent dark:from-emerald-900/60 dark:to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                  <CardTitle className="flex items-center gap-2 relative">
                    <div className="p-1.5 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-700 shadow-sm">
                      <div className="h-4 w-4 text-emerald-700 dark:text-emerald-200 relative">
                        <Leaf className="absolute inset-0 animate-spin-slow opacity-70" size={16} />
                        <TreePine className="absolute inset-0" size={16} />
                      </div>
                    </div>
                    <span className="bg-gradient-to-r from-emerald-700 to-green-600 dark:from-emerald-300 dark:to-green-200 bg-clip-text text-transparent font-bold">
                      Edit Profile
                    </span>
                  </CardTitle>
                  <CardDescription className="relative ml-8">Update your personal information</CardDescription>
                </CardHeader>
                
                {/* Enhanced form content */}
                <CardContent className="relative z-10">
                  <div className="absolute -top-10 -right-10 w-40 h-40 text-green-600/10 dark:text-green-400/5 transform rotate-12">
                    <Leaf size={160} className="animate-leaf-sway" />
                  </div>
                  
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5 relative">
                      {/* Subtle divider line with embellishment */}
                      <div className="absolute left-6 top-4 bottom-16 w-[1px] border-l border-green-200 dark:border-green-700/50 z-0">
                        <div className="absolute -left-1 top-12 h-2 w-2 rounded-full bg-green-200 dark:bg-green-700"></div>
                        <div className="absolute -left-1 top-32 h-2 w-2 rounded-full bg-green-200 dark:bg-green-700"></div>
                        <div className="absolute -left-1 bottom-12 h-2 w-2 rounded-full bg-green-200 dark:bg-green-700"></div>
                      </div>
                    
                      <FormField
                        control={profileForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem className="group/field pl-12 transition-all duration-300 hover:translate-x-1">
                            <FormLabel className="text-green-700 dark:text-green-300 font-medium">Display Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your display name" 
                                {...field} 
                                className="border-green-200 dark:border-green-700/50 focus:border-green-400 bg-white/70 dark:bg-green-950/40 shadow-sm backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-green-300/50 dark:focus:ring-green-700/50"
                              />
                            </FormControl>
                            <FormDescription className="text-green-600/70 dark:text-green-400/70">
                              This is how you'll appear to others in the platform.
                            </FormDescription>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4 pl-12">
                        <FormField
                          control={profileForm.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem className="group/field transition-all duration-300 hover:translate-x-1">
                              <FormLabel className="text-green-700 dark:text-green-300 font-medium">Age</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your age" 
                                  type="number" 
                                  {...field} 
                                  className="border-green-200 dark:border-green-700/50 focus:border-green-400 bg-white/70 dark:bg-green-950/40 shadow-sm backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-green-300/50 dark:focus:ring-green-700/50"
                                />
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="grade"
                          render={({ field }) => (
                            <FormItem className="group/field transition-all duration-300 hover:translate-x-1">
                              <FormLabel className="text-green-700 dark:text-green-300 font-medium">Grade</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your grade" 
                                  type="number" 
                                  {...field} 
                                  className="border-green-200 dark:border-green-700/50 focus:border-green-400 bg-white/70 dark:bg-green-950/40 shadow-sm backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-green-300/50 dark:focus:ring-green-700/50"
                                />
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="pt-4 pl-12">
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 relative overflow-hidden group/button transition-all duration-300 border border-green-400/20 shadow-md"
                          disabled={isUpdating}
                        >
                          {/* Button shine effect */}
                          <div className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover/button:translate-x-[200%] transition-all duration-1000"></div>
                          <span className="relative z-10 font-medium text-white flex items-center gap-2">
                            {isUpdating ? (
                              <>
                                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <Leaf className="h-4 w-4 animate-pulse-slow" />
                                <span>Update Profile</span>
                              </>
                            )}
                          </span>
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                
                {/* Enhanced decorative elements */}
                <div className="absolute bottom-6 right-6 w-24 h-24 text-green-400 opacity-5 dark:opacity-10 transform rotate-45">
                  <TreePine size={96} className="animate-float-slow-reverse" />
                </div>
              </Card>
            </div>
          </TabsContent>
          
          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {/* Overall Progress Card - Enhanced with interactive elements */}
            <Card className="relative overflow-hidden border border-green-200/70 dark:border-green-700/30 shadow-md backdrop-blur-sm group animate-grow-fade">
              {/* Dynamic backdrop with gradient and pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-emerald-50/80 to-green-100/90 dark:from-green-950/90 dark:via-emerald-950/80 dark:to-green-900/80 bg-size-300% animate-gradient-slow"></div>
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2322c55e' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
              ></div>
              
              <CardHeader className="pb-2 relative">
                <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-green-400/10 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-400/10 to-transparent rounded-full blur-2xl"></div>
                
                <CardTitle className="flex items-center gap-3 relative">
                  <div className="p-2 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-800 dark:to-emerald-700 shadow-sm">
                    <Award className="h-5 w-5 text-green-700 dark:text-green-200 animate-pulse-slow" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 dark:from-green-300 dark:to-emerald-200 bg-clip-text text-transparent">
                    Writing Journey Progress
                  </span>
                </CardTitle>
                <CardDescription className="ml-12 text-green-700/70 dark:text-green-300/70">
                  Your growth and achievements as a writer
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-8">
                  {/* Main progress section with enhanced visuals */}
                  <div className="relative">
                    <div className="flex justify-between mb-2 items-end">
                      <div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-300 uppercase tracking-wider">Overall Mastery</span>
                        <div className="flex items-center gap-1 text-xs text-green-600/80 dark:text-green-400/80">
                          <Leaf className="h-3 w-3" />
                          <span>Growing steadily</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-green-700 dark:text-green-300">{Math.round(totalMastery)}%</span>
                        <span className="text-xs text-green-600/70 dark:text-green-400/70">Mastery level</span>
                      </div>
                    </div>
                    
                    {/* Stylized progress bar with gradient fill and animation */}
                    <div className="h-4 bg-green-100/50 dark:bg-green-900/30 rounded-full overflow-hidden p-1 shadow-inner border border-green-200/50 dark:border-green-800/30">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden group-hover:shadow-md"
                        style={{ width: `${totalMastery}%` }}
                      >
                        {/* Animated shimmer effect on hover */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                      </div>
                    </div>
                    
                    {/* Subtle leaf decorations around the progress bar */}
                    <div className="absolute -top-1 right-[15%] w-5 h-5 text-green-500/20 dark:text-green-400/10 transform rotate-45">
                      <Leaf size={20} className="animate-float-slow" />
                    </div>
                    <div className="absolute -bottom-1 left-[40%] w-4 h-4 text-emerald-500/20 dark:text-emerald-400/10 transform -rotate-12">
                      <Leaf size={16} className="animate-float-slow-reverse" />
                    </div>
                  </div>
                  
                  {/* Individual skills section with interactive hover effects */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2 group/skill relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-100/0 via-green-100/0 to-green-100/0 dark:from-green-900/0 dark:via-green-900/0 dark:to-green-900/0 group-hover/skill:from-green-100/50 group-hover/skill:via-green-100/30 group-hover/skill:to-green-100/0 dark:group-hover/skill:from-green-900/50 dark:group-hover/skill:via-green-900/30 dark:group-hover/skill:to-green-900/0 rounded-lg transition-all duration-500"></div>
                      
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full bg-green-300 dark:bg-green-700"></span>
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">Mechanics</span>
                        </div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">{progress.skillMastery.mechanics}%</span>
                      </div>
                      
                      <div className="h-3 bg-green-100/50 dark:bg-green-900/30 rounded-full overflow-hidden shadow-inner border border-green-200/50 dark:border-green-800/30">
                        <div 
                          className="h-full bg-green-400 dark:bg-green-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${progress.skillMastery.mechanics}%` }}
                        >
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/skill:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 group/skill relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/0 via-emerald-100/0 to-emerald-100/0 dark:from-emerald-900/0 dark:via-emerald-900/0 dark:to-emerald-900/0 group-hover/skill:from-emerald-100/50 group-hover/skill:via-emerald-100/30 group-hover/skill:to-emerald-100/0 dark:group-hover/skill:from-emerald-900/50 dark:group-hover/skill:via-emerald-900/30 dark:group-hover/skill:to-emerald-900/0 rounded-lg transition-all duration-500"></div>
                      
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full bg-emerald-300 dark:bg-emerald-700"></span>
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Sequencing</span>
                        </div>
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{progress.skillMastery.sequencing}%</span>
                      </div>
                      
                      <div className="h-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-full overflow-hidden shadow-inner border border-emerald-200/50 dark:border-emerald-800/30">
                        <div 
                          className="h-full bg-emerald-400 dark:bg-emerald-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${progress.skillMastery.sequencing}%` }}
                        >
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/skill:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 group/skill relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-100/0 via-teal-100/0 to-teal-100/0 dark:from-teal-900/0 dark:via-teal-900/0 dark:to-teal-900/0 group-hover/skill:from-teal-100/50 group-hover/skill:via-teal-100/30 group-hover/skill:to-teal-100/0 dark:group-hover/skill:from-teal-900/50 dark:group-hover/skill:via-teal-900/30 dark:group-hover/skill:to-teal-900/0 rounded-lg transition-all duration-500"></div>
                      
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full bg-teal-300 dark:bg-teal-700"></span>
                          <span className="text-sm font-medium text-teal-700 dark:text-teal-300">Voice</span>
                        </div>
                        <span className="text-sm font-medium text-teal-700 dark:text-teal-300">{progress.skillMastery.voice}%</span>
                      </div>
                      
                      <div className="h-3 bg-teal-100/50 dark:bg-teal-900/30 rounded-full overflow-hidden shadow-inner border border-teal-200/50 dark:border-teal-800/30">
                        <div 
                          className="h-full bg-teal-400 dark:bg-teal-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${progress.skillMastery.voice}%` }}
                        >
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/skill:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats section with interactive cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <Card className="group/stat bg-gradient-to-br from-white/70 via-green-50/60 to-green-100/70 dark:from-green-950/70 dark:via-green-900/60 dark:to-green-800/70 border border-green-200/50 dark:border-green-700/30 shadow backdrop-blur-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <CardHeader className="p-4 pb-1 relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full blur-xl"></div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 flex items-center justify-center shadow-sm group-hover/stat:shadow group-hover/stat:scale-110 transition-all duration-300">
                            <FileText size={14} className="group-hover/stat:animate-pulse-slow" />
                          </span>
                          <span className="text-green-700 dark:text-green-300 group-hover/stat:text-green-800 dark:group-hover/stat:text-green-200 transition-colors duration-300">Exercises</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-1 relative">
                        <p className="text-3xl font-bold text-green-800 dark:text-green-100 transition-all duration-300 group-hover/stat:scale-110 origin-left">{progress.completedExercises.length}</p>
                        <p className="text-sm text-green-600/80 dark:text-green-400/80">Completed</p>
                        
                        {/* Subtle decorative element */}
                        <div className="absolute bottom-1 right-2 w-12 h-12 text-green-400/10 dark:text-green-300/10 transform rotate-12 group-hover/stat:rotate-45 transition-transform duration-700">
                          <Leaf size={48} />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="group/stat bg-gradient-to-br from-white/70 via-emerald-50/60 to-emerald-100/70 dark:from-emerald-950/70 dark:via-emerald-900/60 dark:to-emerald-800/70 border border-emerald-200/50 dark:border-emerald-700/30 shadow backdrop-blur-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <CardHeader className="p-4 pb-1 relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-xl"></div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200 flex items-center justify-center shadow-sm group-hover/stat:shadow group-hover/stat:scale-110 transition-all duration-300">
                            <FileText size={14} className="group-hover/stat:animate-pulse-slow" />
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-300 group-hover/stat:text-emerald-800 dark:group-hover/stat:text-emerald-200 transition-colors duration-300">Quests</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-1 relative">
                        <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-100 transition-all duration-300 group-hover/stat:scale-110 origin-left">{progress.completedQuests.length}</p>
                        <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Completed</p>
                        
                        {/* Subtle decorative element */}
                        <div className="absolute bottom-1 right-2 w-12 h-12 text-emerald-400/10 dark:text-emerald-300/10 transform rotate-12 group-hover/stat:rotate-45 transition-transform duration-700">
                          <TreePine size={48} />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="group/stat bg-gradient-to-br from-white/70 via-teal-50/60 to-teal-100/70 dark:from-teal-950/70 dark:via-teal-900/60 dark:to-teal-800/70 border border-teal-200/50 dark:border-teal-700/30 shadow backdrop-blur-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <CardHeader className="p-4 pb-1 relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-full blur-xl"></div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-200 flex items-center justify-center shadow-sm group-hover/stat:shadow group-hover/stat:scale-110 transition-all duration-300">
                            <Award size={14} className="group-hover/stat:animate-pulse-slow" />
                          </span>
                          <span className="text-teal-700 dark:text-teal-300 group-hover/stat:text-teal-800 dark:group-hover/stat:text-teal-200 transition-colors duration-300">Achievements</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-1 relative">
                        <p className="text-3xl font-bold text-teal-800 dark:text-teal-100 transition-all duration-300 group-hover/stat:scale-110 origin-left">{progress.achievements.length}</p>
                        <p className="text-sm text-teal-600/80 dark:text-teal-400/80">Unlocked</p>
                        
                        {/* Subtle decorative element */}
                        <div className="absolute bottom-1 right-2 w-12 h-12 text-teal-400/10 dark:text-teal-300/10 transform rotate-12 group-hover/stat:rotate-45 transition-transform duration-700">
                          <Award size={48} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
              
              {/* Enhanced botanical decorative elements with animations */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 text-green-500/10 dark:text-green-400/5 transform rotate-45 group-hover:scale-110 transition-transform duration-1000">
                <TreePine size={192} className="animate-float-slow" />
              </div>
              <div className="absolute top-10 right-10 w-8 h-8 text-emerald-500/10 dark:text-emerald-400/5 group-hover:text-emerald-500/20 dark:group-hover:text-emerald-400/10 transition-colors duration-700">
                <Leaf size={32} className="animate-leaf-sway" />
              </div>
              <div className="absolute bottom-16 left-16 w-10 h-10 text-teal-500/10 dark:text-teal-400/5 transform -rotate-12 group-hover:rotate-12 transition-transform duration-1000">
                <Leaf size={40} className="animate-float-slow-reverse" />
              </div>
              <div className="absolute top-1/3 left-10 w-4 h-4 text-green-500/10 dark:text-green-400/5">
                <TreePine size={16} className="animate-pulse-slow" />
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