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
      <ProtectedRoute path="/" component={REDIMap} />
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

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
