import React from 'react';
import AuthLayout from '@/components/layouts/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'wouter';

const Register: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Redirect to="/redi" />;
  }
  
  return (
    <AuthLayout 
      title="Create Your ScribexX Account" 
      activeTab="register"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
