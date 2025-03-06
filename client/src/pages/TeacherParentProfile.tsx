import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, FileText } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal('')),
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

export default function TeacherParentProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout title={`${user.role === 'teacher' ? 'Teacher' : 'Parent'} Profile`} subtitle="Manage your account information">
      <div className="container mx-auto py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              <span>Profile</span>
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
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>About You</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </CardHeader>
                <CardContent>
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
                      <div className="text-sm font-medium text-muted-foreground">Email</div>
                      <div className="text-lg font-semibold">{user.email || 'Not provided'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Role</div>
                      <div className="text-lg font-semibold capitalize">{user.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Profile Form */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your email address for account notifications.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
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
                            <Input type="password" placeholder="••••••••" {...field} />
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
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Last password change</h4>
                      <p className="text-sm text-muted-foreground">Not available</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Account created</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
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