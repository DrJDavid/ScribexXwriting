import React from 'react';

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
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* Left side - Form */}
        <div className="w-full max-w-md mx-auto">
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
              <button 
                className={`flex-1 py-3 font-medium text-center ${activeTab === 'login' ? 'text-gray-800 bg-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Sign In
              </button>
              <button 
                className={`flex-1 py-3 font-medium text-center ${activeTab === 'register' ? 'text-gray-800 bg-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Create Account
              </button>
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

        {/* Right side - Hero Section */}
        <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-[#6320ee]/10 to-[#3cb371]/10 rounded-xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Elevate Your Writing Skills</h2>
            <p className="text-gray-600 mb-6">
              Join ScribexX and embark on an engaging journey to master writing through interactive exercises and creative quests.
            </p>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-white/80 rounded-lg shadow-sm">
                <div className="p-2 rounded-full bg-[#6320ee]/20 mr-3">
                  <svg className="w-5 h-5 text-[#6320ee]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Structured Exercises</h3>
                  <p className="text-sm text-gray-500">Master mechanics, sequencing, and voice</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-white/80 rounded-lg shadow-sm">
                <div className="p-2 rounded-full bg-[#3cb371]/20 mr-3">
                  <svg className="w-5 h-5 text-[#3cb371]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Creative Quests</h3>
                  <p className="text-sm text-gray-500">Apply skills in immersive writing scenarios</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-white/80 rounded-lg shadow-sm">
                <div className="p-2 rounded-full bg-[#ffd700]/20 mr-3">
                  <svg className="w-5 h-5 text-[#ffd700]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Achievement System</h3>
                  <p className="text-sm text-gray-500">Track progress and unlock rewards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
