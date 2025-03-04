import { Route, Switch, Link } from "wouter";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import AuthPage from "@/pages/auth/AuthPage";

// Basic placeholder components
const PlaceholderComponent = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8">
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
// Dashboard Component displaying main app features
const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Welcome to ScribexX Writing App</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/redi" className="block p-6 bg-primary/10 rounded-lg shadow hover:bg-primary/20 transition-colors">
          <h2 className="text-xl font-semibold mb-2">REDI System</h2>
          <p>Structured exercises to build writing skills</p>
        </Link>
        
        <Link href="/owl" className="block p-6 bg-primary/10 rounded-lg shadow hover:bg-primary/20 transition-colors">
          <h2 className="text-xl font-semibold mb-2">OWL Town</h2>
          <p>Creative writing quests in an open world</p>
        </Link>
        
        <Link href="/profile" className="block p-6 bg-primary/10 rounded-lg shadow hover:bg-primary/20 transition-colors">
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <p>View and update your user profile</p>
        </Link>
        
        <Link href="/achievements" className="block p-6 bg-primary/10 rounded-lg shadow hover:bg-primary/20 transition-colors">
          <h2 className="text-xl font-semibold mb-2">Achievements</h2>
          <p>Track your writing milestones</p>
        </Link>
        
        <Link href="/tools" className="block p-6 bg-primary/10 rounded-lg shadow hover:bg-primary/20 transition-colors">
          <h2 className="text-xl font-semibold mb-2">Writing Tools</h2>
          <p>Helpful utilities for writers</p>
        </Link>
      </div>
    </div>
  );
};

// Super simple navigation that doesn't rely on auth
const SimpleNavBar = () => (
  <header className="bg-primary text-white py-4 px-6">
    <div className="flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        ScribexX
      </Link>
      <Link href="/auth" className="px-3 py-2 rounded bg-white text-primary hover:bg-gray-100">
        Login / Register
      </Link>
    </div>
  </header>
);

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      <Route path="/">
        <Dashboard />
      </Route>
      <Route path="/redi">
        <REDIMap />
      </Route>
      <Route path="/redi/exercise/:exerciseId">
        <REDIExercise />
      </Route>
      <Route path="/owl">
        <OWLTown />
      </Route>
      <Route path="/owl/quest/:questId">
        <OWLWritingQuest />
      </Route>
      <Route path="/profile">
        <Profile />
      </Route>
      <Route path="/achievements">
        <Achievements />
      </Route>
      <Route path="/tools">
        <Tools />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SimpleNavBar />
      <main className="flex-1">
        <Router />
      </main>
      <Toaster />
    </div>
  );
}

export default App;
