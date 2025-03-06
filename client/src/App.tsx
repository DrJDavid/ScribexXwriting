import { Route, Switch, Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { LogOut, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Simplified Login Form that doesn't use Auth context directly
const LoginFormSimple = () => {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      // Successfully logged in, refresh user data and redirect to home
      // Small timeout to ensure state updates before navigation
      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
      // Show error message
      form.setError("root", {
        message: "Invalid username or password",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                <Input placeholder="johndoe" {...field} />
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
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.formState.errors.root && (
          <div className="text-red-500 text-sm">{form.formState.errors.root.message}</div>
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
};

// Register component
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  age: z.number().int().min(5).max(18).optional(),
  grade: z.number().int().min(0).max(12).optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// Simplified Register Form that doesn't use Auth context directly
const RegisterFormSimple = () => {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
      age: 10,
      grade: 5,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      // Successfully registered, redirect to home
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      // Show error message
      form.setError("root", {
        message: "Registration failed. Username may already be taken.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                <Input placeholder="johndoe" {...field} />
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
                <Input type="password" placeholder="••••••" {...field} />
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
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="10" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
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
                <Input 
                  type="number" 
                  placeholder="5" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.formState.errors.root && (
          <div className="text-red-500 text-sm">{form.formState.errors.root.message}</div>
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </Button>
      </form>
    </Form>
  );
};

// Auth page component - simplified version that doesn't depend on useAuth
const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [, navigate] = useLocation();
  
  // We'll check for authentication status using fetch instead of useAuth
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          // User is logged in, redirect to home
          navigate("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuthStatus();
  }, [navigate]);
  
  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">ScribexX Writing Platform</h1>
          
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 ${activeTab === 'login' ? 'border-b-2 border-primary font-semibold' : 'text-gray-500'}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'register' ? 'border-b-2 border-primary font-semibold' : 'text-gray-500'}`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>
          
          {activeTab === 'login' ? <LoginFormSimple /> : <RegisterFormSimple />}
        </div>
      </div>
      <div className="hidden md:block md:w-1/2 bg-primary/10">
        <div className="flex flex-col justify-center h-full p-8">
          <h2 className="text-3xl font-bold mb-4">Improve Your Writing Skills</h2>
          <p className="text-lg mb-6">
            ScribexX is an educational platform designed to enhance student writing through
            structured exercises and creative writing quests.
          </p>
        </div>
      </div>
    </div>
  );
};

// Home component - simplified version that doesn't depend on useAuth
const Home = () => {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user data on mount and when auth state might change
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Not authenticated, redirect to login
        navigate("/auth");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch on mount
  useEffect(() => {
    fetchUserData();
    
    // Set up event listener for auth state changes
    window.addEventListener('auth-state-changed', fetchUserData);
    
    return () => {
      window.removeEventListener('auth-state-changed', fetchUserData);
    };
  }, [navigate]);
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setUser(null); // Clear user data first
        // Dispatch event to notify about auth state change
        window.dispatchEvent(new Event('auth-state-changed'));
        navigate("/auth");
      } else {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.displayName || 'User'}</h1>
      </div>
      
      <div className="bg-primary/10 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Writing Journey</h2>
        <p className="mb-4">Explore the ScribexX platform to improve your writing skills through interactive exercises and creative writing quests.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button 
            className="bg-[#6320ee] hover:bg-[#6320ee]/80 text-white flex-1 h-16 flex flex-col items-center justify-center"
            onClick={() => navigate('/redi')}
          >
            <span className="text-lg font-bold">REDI System</span>
            <span className="text-xs">Structured Writing Exercises</span>
          </Button>
          
          <Button 
            className="bg-[#3cb371] hover:bg-[#3cb371]/80 text-white flex-1 h-16 flex flex-col items-center justify-center"
            onClick={() => navigate('/owl')}
          >
            <span className="text-lg font-bold">OWL Town</span>
            <span className="text-xs">Creative Writing Quests</span>
          </Button>
        </div>
      </div>
      
      <div className="bg-primary/10 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Portfolio</h2>
        <p className="mb-4">View your writing submissions and AI feedback.</p>
        
        <Button 
          className="bg-primary hover:bg-primary/80 w-full sm:w-auto"
          onClick={() => navigate('/writing/submissions')}
        >
          <FileText className="h-4 w-4 mr-2" />
          View Writing Portfolio
        </Button>
      </div>
    </div>
  );
};

// Header component with navigation
const Header = () => {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();

  return (
    <header className="bg-primary text-white py-4 px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            ScribexX
          </Link>
          
          {user !== null && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/" className={`hover:text-white/80 transition-colors ${location === '/' ? 'underline' : ''}`}>
                Home
              </Link>
              <Link href="/redi" className={`hover:text-white/80 transition-colors ${location === '/redi' ? 'underline' : ''}`}>
                REDI
              </Link>
              <Link href="/owl" className={`hover:text-white/80 transition-colors ${location === '/owl' ? 'underline' : ''}`}>
                OWL
              </Link>
              <Link href="/writing/submissions" className={`hover:text-white/80 transition-colors ${location.startsWith('/writing') ? 'underline' : ''}`}>
                Submissions
              </Link>
            </nav>
          )}
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">Welcome, {user.displayName || user.username}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logoutMutation.mutate(undefined, {
                  onSuccess: () => {
                    navigate("/auth");
                  },
                });
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-black">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

// Import the components
import WritingSubmissionDetails from "@/pages/owl/WritingSubmissionDetails";
import OWLSubmissionsList from "@/pages/owl/OWLSubmissionsList";
import OWLTown from "@/pages/owl/OWLTown";
import OWLLocationDetail from "@/pages/owl/OWLLocationDetail";
import OWLWritingQuest from "@/pages/owl/OWLWritingQuest";
import REDIMap from "@/pages/redi/REDIMap";
import REDIExercise from "@/pages/redi/REDIExercise";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

// Import ProgressProvider
import { ProgressProvider } from "@/context/ProgressContext";

// App component with routes
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ProgressProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pb-4">
                <Switch>
                  <Route path="/auth" component={AuthPage} />
                  <ProtectedRoute path="/writing/submissions/:id" component={WritingSubmissionDetails} />
                  <ProtectedRoute path="/writing/submissions" component={OWLSubmissionsList} />
                  <ProtectedRoute path="/owl/quest/free-write" component={OWLWritingQuest} />
                  <ProtectedRoute path="/owl/quest/:questId" component={OWLWritingQuest} />
                  <ProtectedRoute path="/owl/location/:locationId" component={OWLLocationDetail} />
                  <ProtectedRoute path="/owl" component={OWLTown} />
                  <ProtectedRoute path="/redi/exercise/:exerciseId" component={REDIExercise} />
                  <ProtectedRoute path="/redi" component={REDIMap} />
                  <ProtectedRoute path="/" component={Home} />
                  <Route component={NotFound} />
                </Switch>
              </main>
              <Toaster />
            </div>
          </ProgressProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;