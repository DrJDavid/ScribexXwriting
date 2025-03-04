import { useAuth } from '@/context/AuthContext';

// A convenience hook to get the current user
const useCurrentUser = () => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  
  return {
    user: currentUser,
    isAuthenticated,
    isLoading,
  };
};

export default useCurrentUser;
