import React from "react";
import { Route, Switch } from "wouter";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/protected-route";
import { Toaster } from "@/components/ui/toaster";
import AuthPage from "@/pages/auth/AuthPage";

// Basic placeholder components
const PlaceholderComponent = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-2xl font-bold mb-2">{name} Component</h1>
    <p className="text-gray-600">This is a placeholder for the {name} component</p>
  </div>
);

const REDIMap = () => <PlaceholderComponent name="REDI Map" />;
const REDIExercise = () => <PlaceholderComponent name="REDI Exercise" />;
const OWLTown = () => <PlaceholderComponent name="OWL Town" />;
const OWLWritingQuest = () => <PlaceholderComponent name="OWL Writing Quest" />;
const Profile = () => <PlaceholderComponent name="Profile" />;
const Achievements = () => <PlaceholderComponent name="Achievements" />;
const Tools = () => <PlaceholderComponent name="Tools" />;

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/redi" component={REDIMap} />
      <ProtectedRoute path="/redi/exercise/:exerciseId" component={REDIExercise} />
      <ProtectedRoute path="/owl" component={OWLTown} />
      <ProtectedRoute path="/owl/quest/:questId" component={OWLWritingQuest} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/achievements" component={Achievements} />
      <ProtectedRoute path="/tools" component={Tools} />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

// Dashboard Component displaying main app features
const Dashboard = () => {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">ScribexX Writing App</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/redi" className="block p-6 bg-primary/10 rounded-lg shadow hover:bg-primary/20 transition-colors">
          <h2 className="text-xl font-semibold mb-2">REDI System</h2>
          <p>Structured exercises to build writing skills</p>
        </a>
        
        <a href="/owl" className="block p-6 bg-primary/10 rounded-lg shadow hover:bg-primary/20 transition-colors">
          <h2 className="text-xl font-semibold mb-2">OWL Town</h2>
          <p>Creative writing quests in an open world</p>
        </a>
        
        <a href="/profile" className="block p-6 bg-primary/10 rounded-lg shadow hover:bg-primary/20 transition-colors">
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <p>View and update your user profile</p>
        </a>
        
        <a href="/achievements" className="block p-6 bg-primary/10 rounded-lg shadow hover:bg-primary/20 transition-colors">
          <h2 className="text-xl font-semibold mb-2">Achievements</h2>
          <p>Track your writing milestones</p>
        </a>
        
        <a href="/tools" className="block p-6 bg-primary/10 rounded-lg shadow hover:bg-primary/20 transition-colors">
          <h2 className="text-xl font-semibold mb-2">Writing Tools</h2>
          <p>Helpful utilities for writers</p>
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
