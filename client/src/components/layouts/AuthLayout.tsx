import React from 'react';
import { Link } from 'wouter';

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  activeTab: 'login' | 'register';
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle = "Writing excellence through exploration",
  activeTab 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-orbitron font-bold relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6320ee] to-[#3cb371]">
              ScribexX
            </span>
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#39ff14] to-[#ffd700]"></span>
          </h1>
          <p className="mt-2 text-gray-600">{subtitle}</p>
        </div>

        {/* Auth Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <Link href="/login" className={`flex-1 py-3 font-medium text-center ${activeTab === 'login' ? 'text-gray-800 bg-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>
                Sign In
            </Link>
            <Link href="/register" className={`flex-1 py-3 font-medium text-center ${activeTab === 'register' ? 'text-gray-800 bg-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>
                Create Account
            </Link>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {children}
          </div>
        </div>

        {/* Teacher/Student Toggle */}
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-500">Are you a teacher?</span>
          <a href="#" className="ml-2 text-sm text-[#6320ee] hover:underline">Teacher Login</a>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
