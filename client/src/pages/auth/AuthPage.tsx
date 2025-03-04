import { lazy, Suspense, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PenLineIcon, SparklesIcon, Loader2 } from "lucide-react";

// Lazy load the forms for better performance
const LoginForm = lazy(() => import("@/pages/auth/LoginForm"));
const RegisterForm = lazy(() => import("@/pages/auth/RegisterForm"));

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user } = useAuth();
  const [location] = useLocation();

  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

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
            <Suspense fallback={
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
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
            </Suspense>
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