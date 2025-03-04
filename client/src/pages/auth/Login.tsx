import React, { useState } from 'react';
import AuthLayout from '@/components/layouts/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';

const Login: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Redirect if already authenticated
  if (user) {
    return <Redirect to="/redi" />;
  }
  
  return (
    <AuthLayout 
      title="Welcome to ScribexX" 
      activeTab={activeTab}
    >
      {activeTab === 'login' ? (
        <div>
          <LoginForm />
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">Don't have an account?</span>
            <button 
              className="ml-2 text-sm text-primary hover:underline"
              onClick={() => setActiveTab('register')}
            >
              Create an account
            </button>
          </div>
        </div>
      ) : (
        <div>
          <RegisterForm />
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">Already have an account?</span>
            <button 
              className="ml-2 text-sm text-primary hover:underline"
              onClick={() => setActiveTab('login')}
            >
              Sign in
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default Login;
