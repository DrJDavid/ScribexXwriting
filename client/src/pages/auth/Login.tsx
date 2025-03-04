import React from 'react';
import AuthLayout from '@/components/layouts/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'wouter';

const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Redirect to="/redi" />;
  }
  
  return (
    <AuthLayout 
      title="Login to ScribexX" 
      activeTab="login"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
