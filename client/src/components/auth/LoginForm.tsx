import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { loginMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    loginMutation.mutate(
      { 
        username: values.username, 
        password: values.password 
      },
      {
        onSuccess: () => {
          // Wait a small delay to ensure React Query updates are processed
          setTimeout(() => {
            // Navigate to the dashboard
            setLocation('/redi');
          }, 50);
        },
        onError: (error) => {
          // Toast is already handled by the mutation error handler in useAuth
          console.error("Login error:", error);
        }
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your username" 
                  {...field} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6320ee]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your password" 
                  {...field} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6320ee]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit"
          className="w-full py-2 px-4 font-medium text-white bg-gradient-to-r from-[#6320ee] to-[#3cb371] rounded-md shadow hover:opacity-90 transition"
          disabled={loginMutation.isPending || form.formState.isSubmitting}
        >
          {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
        </Button>
        
        <div className="mt-2 text-center text-sm text-gray-500">
          <a href="#" className="text-[#6320ee] hover:underline">Forgot password?</a>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
