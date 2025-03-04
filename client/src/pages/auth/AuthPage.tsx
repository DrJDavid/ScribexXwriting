import { useState } from "react";
import { useLocation, Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PenLineIcon, SparklesIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Login Schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Register Schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  displayName: z.string().min(1, "Display name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  age: z.coerce.number().int().min(8, "Age must be at least 8").max(18, "Age must be at most 18"),
  grade: z.coerce.number().int().min(3, "Grade must be at least 3").max(12, "Grade must be at most 12"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [location] = useLocation();

  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

  // Login Form Component
  const LoginForm = () => {
    const form = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        username: "",
        password: "",
      },
    });

    const onSubmit = async (values: LoginFormValues) => {
      loginMutation.mutate(values);
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
                  <Input placeholder="Enter your username" {...field} />
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
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
          
          <div className="text-sm text-center text-muted-foreground">
            <p>Demo account: username: "demo", password: "password"</p>
          </div>
        </form>
      </Form>
    );
  };

  // Register Form Component
  const RegisterForm = () => {
    const form = useForm<RegisterFormValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        username: "",
        displayName: "",
        password: "",
        age: 13,
        grade: 7,
      },
    });

    const onSubmit = async (values: RegisterFormValues) => {
      registerMutation.mutate(values);
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
                  <Input placeholder="Choose a username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your display name" {...field} />
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
                  <Input type="password" placeholder="Choose a password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" min={8} max={18} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input type="number" min={3} max={12} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating Account..." : "Register"}
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Welcome to ScribexX</CardTitle>
            <CardDescription className="text-center">
              Your journey to becoming a confident writer starts here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            {activeTab === "login" ? (
              <p>Don't have an account? <button onClick={() => setActiveTab("register")} className="underline text-primary">Register</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setActiveTab("login")} className="underline text-primary">Login</button></p>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Hero Section */}
      <div className="w-full md:w-1/2 bg-primary/10 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold">
            Embark on a Writing Adventure
          </h1>
          <p className="text-lg">
            ScribexX offers two unique learning environments:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <PenLineIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">REDI System</h3>
                <p>Structured exercises with direct feedback to build core writing skills.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">OWL Town</h3>
                <p>Creative writing quests in an open world to apply and expand your skills.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-background/80 p-4 rounded-lg text-center">
            <p className="font-medium">Track your progress, earn achievements, and become a confident writer!</p>
          </div>
        </div>
      </div>
    </div>
  );
}