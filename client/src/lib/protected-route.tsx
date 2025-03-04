import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useState, useEffect } from "react";

// Simplified ProtectedRoute that doesn't depend on AuthProvider
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  return (
    <Route path={path}>
      {(params: any) => <ProtectedRouteContent component={Component} params={params} />}
    </Route>
  );
}

// Internal component that handles authentication checking
function ProtectedRouteContent({
  component: Component,
  params,
}: {
  component: React.ComponentType<any>;
  params: Record<string, string | undefined>;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        setIsAuthenticated(response.ok);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Still checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  // Authenticated, render protected component
  return <Component {...params} />;
}