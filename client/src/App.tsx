import { Route, Switch, Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { RoleBasedRoute } from "@/lib/role-based-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

// Using proper auth forms from components/auth folder
// Import schemas for type definitions only
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Register schema for type definitions
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  age: z.number().int().min(5).max(18).optional(),
  grade: z.number().int().min(0).max(12).optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// Import proper auth components
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

// Auth page component that uses proper auth components
const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Show loading while checking auth
  if (user === undefined) {
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

          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
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

// Home component has been moved to its own file in pages/Home.tsx

// Header component with navigation
const Header = () => {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  
  // Force component to recognize auth state
  const isAuthenticated = user !== null;

  // Show different navigation based on user role
  const renderNavigation = () => {
    if (!isAuthenticated || !user) return null;

    if (user.role === 'teacher') {
      return (
        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/teacher" className={`hover:text-white/80 transition-colors ${location === '/teacher' ? 'underline' : ''}`}>
            Dashboard
          </Link>
          <Link href="/profile" className={`hover:text-white/80 transition-colors ${location === '/profile' ? 'underline' : ''}`}>
            Profile
          </Link>
        </nav>
      );
    } else if (user.role === 'parent') {
      return (
        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/parent" className={`hover:text-white/80 transition-colors ${location === '/parent' ? 'underline' : ''}`}>
            Dashboard
          </Link>
          <Link href="/profile" className={`hover:text-white/80 transition-colors ${location === '/profile' ? 'underline' : ''}`}>
            Profile
          </Link>
        </nav>
      );
    } else {
      // Default student navigation
      return (
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
          <Link href="/achievements" className={`hover:text-white/80 transition-colors ${location === '/achievements' ? 'underline' : ''}`}>
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              Achievements
            </div>
          </Link>
          <Link href="/profile" className={`hover:text-white/80 transition-colors ${location === '/profile' ? 'underline' : ''}`}>
            Profile
          </Link>
        </nav>
      );
    }
  };

  return (
    <header className="bg-primary text-white py-4 px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            ScribexX
          </Link>

          {isAuthenticated && renderNavigation()}
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">
              Welcome, {user.displayName || user.username}
              {user.role !== 'student' && (
                <span className="ml-2 px-2 py-1 text-xs bg-primary-foreground text-primary rounded-full">
                  {user.role === 'teacher' ? 'Teacher' : 'Parent'}
                </span>
              )}
            </span>
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
import ProfilePage from "@/pages/Profile";
import AchievementsPage from "@/pages/AchievementsPage";
import DailyWritingChallenge from "@/pages/challenges/DailyChallenge";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import StudentDetails from "@/pages/teacher/StudentDetails";
import TeacherSubmissionDetails from "@/pages/teacher/SubmissionDetails";
import ParentDashboard from "@/pages/parent/ParentDashboard";
import ChildDetails from "@/pages/parent/ChildDetails";
import ParentSubmissionDetails from "@/pages/parent/SubmissionDetails";
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
                  {/* Public route */}
                  <Route path="/auth" component={AuthPage} />
                  
                  {/* Teacher routes */}
                  <RoleBasedRoute 
                    path="/teacher/submission/:submissionId" 
                    component={TeacherSubmissionDetails} 
                    allowedRoles={['teacher']} 
                  />
                  <RoleBasedRoute 
                    path="/teacher/student/:studentId" 
                    component={StudentDetails} 
                    allowedRoles={['teacher']} 
                  />
                  <RoleBasedRoute 
                    path="/teacher" 
                    component={TeacherDashboard} 
                    allowedRoles={['teacher']} 
                  />
                  
                  {/* Parent routes */}
                  <RoleBasedRoute 
                    path="/parent/submission/:submissionId" 
                    component={ParentSubmissionDetails} 
                    allowedRoles={['parent']} 
                  />
                  <RoleBasedRoute 
                    path="/parent/child/:childId" 
                    component={ChildDetails} 
                    allowedRoles={['parent']} 
                  />
                  <RoleBasedRoute 
                    path="/parent" 
                    component={ParentDashboard} 
                    allowedRoles={['parent']} 
                  />
                  
                  {/* Student routes - allowed for students, teachers and parents */}
                  <ProtectedRoute path="/writing/submissions/:id" component={WritingSubmissionDetails} />
                  <ProtectedRoute path="/writing/submissions" component={OWLSubmissionsList} />
                  <RoleBasedRoute 
                    path="/owl/quest/free-write" 
                    component={OWLWritingQuest} 
                    allowedRoles={['student', 'teacher', 'parent']} 
                  />
                  <RoleBasedRoute 
                    path="/owl/quest/:questId" 
                    component={OWLWritingQuest} 
                    allowedRoles={['student', 'teacher', 'parent']} 
                  />
                  <RoleBasedRoute 
                    path="/owl/location/:locationId" 
                    component={OWLLocationDetail} 
                    allowedRoles={['student', 'teacher', 'parent']} 
                  />
                  <RoleBasedRoute 
                    path="/owl" 
                    component={OWLTown} 
                    allowedRoles={['student', 'teacher', 'parent']} 
                  />
                  <RoleBasedRoute 
                    path="/redi/exercise/:exerciseId" 
                    component={REDIExercise} 
                    allowedRoles={['student', 'teacher', 'parent']} 
                  />
                  <RoleBasedRoute 
                    path="/redi" 
                    component={REDIMap} 
                    allowedRoles={['student', 'teacher', 'parent']} 
                  />
                  <RoleBasedRoute 
                    path="/challenges/daily/:challengeId" 
                    component={DailyWritingChallenge} 
                    allowedRoles={['student', 'teacher', 'parent']} 
                  />
                  <RoleBasedRoute 
                    path="/achievements" 
                    component={AchievementsPage} 
                    allowedRoles={['student', 'teacher', 'parent']} 
                  />
                  <ProtectedRoute path="/profile" component={ProfilePage} />
                  
                  {/* Home routes (redirects based on role) */}
                  <ProtectedRoute path="/" component={Home} />
                  
                  {/* 404 route */}
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