import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PenLineIcon, SparklesIcon } from "lucide-react";

// Simplified AuthPage that doesn't use any auth hooks
export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");

  // Simplified versions of the forms that don't use auth hooks
  const SimpleLoginForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="username">Username</label>
        <input 
          className="w-full p-2 border rounded-md"
          type="text" 
          id="username" 
          placeholder="Enter your username" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
        <input 
          className="w-full p-2 border rounded-md"
          type="password" 
          id="password" 
          placeholder="Enter your password" 
        />
      </div>
      <button 
        className="w-full bg-primary text-white p-2 rounded-md hover:bg-primary/90 transition"
        onClick={() => alert("Login functionality will be implemented soon!")}
      >
        Login
      </button>
    </div>
  );

  const SimpleRegisterForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="username">Username</label>
        <input 
          className="w-full p-2 border rounded-md"
          type="text" 
          id="username" 
          placeholder="Choose a username" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="display-name">Display Name</label>
        <input 
          className="w-full p-2 border rounded-md"
          type="text" 
          id="display-name" 
          placeholder="Enter your display name" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
        <input 
          className="w-full p-2 border rounded-md"
          type="password" 
          id="password" 
          placeholder="Choose a password" 
        />
      </div>
      <button 
        className="w-full bg-primary text-white p-2 rounded-md hover:bg-primary/90 transition"
        onClick={() => alert("Registration functionality will be implemented soon!")}
      >
        Register
      </button>
    </div>
  );

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
                <SimpleLoginForm />
              </TabsContent>
              <TabsContent value="register">
                <SimpleRegisterForm />
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