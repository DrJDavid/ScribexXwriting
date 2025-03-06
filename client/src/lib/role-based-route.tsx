import React from 'react';
import { Route, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface RoleBasedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleBasedRoute({ 
  path, 
  component: Component, 
  allowedRoles,
  redirectTo = '/auth' 
}: RoleBasedRouteProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <Route
      path={path}
      component={(props) => {
        // Check if user exists and has an allowed role
        const hasAccess = user && allowedRoles.includes(user.role);

        React.useEffect(() => {
          if (!hasAccess) {
            // If not authenticated or incorrect role, redirect to login or home
            setLocation(redirectTo);
          }
        }, [hasAccess]);

        // If loading, render loading indicator
        if (user === undefined) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          );
        }

        // If authenticated and has proper role, render the component
        return hasAccess ? <Component {...props} /> : null;
      }}
    />
  );
}