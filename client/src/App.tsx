import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import REDIMap from "@/pages/redi/REDIMap";
import REDIExercise from "@/pages/redi/REDIExercise";
import OWLTown from "@/pages/owl/OWLTown";
import OWLWritingQuest from "@/pages/owl/OWLWritingQuest";
import Profile from "@/pages/Profile";
import Achievements from "@/pages/Achievements";
import Tools from "@/pages/Tools";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { useLocation } from "wouter";

function AuthenticatedRouter() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to login if not authenticated and trying to access a protected route
  useEffect(() => {
    const publicRoutes = ["/login", "/register"];
    if (!isAuthenticated && !publicRoutes.includes(location)) {
      setLocation("/login");
    }
  }, [isAuthenticated, location, setLocation]);

  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Main App Routes */}
      <Route path="/" component={REDIMap} />
      <Route path="/redi" component={REDIMap} />
      <Route path="/redi/exercise/:exerciseId" component={REDIExercise} />
      <Route path="/owl" component={OWLTown} />
      <Route path="/owl/quest/:questId" component={OWLWritingQuest} />
      <Route path="/profile" component={Profile} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/tools" component={Tools} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/:rest*" component={AuthenticatedRouter} />
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
