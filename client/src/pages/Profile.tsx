import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { useTheme } from '@/context/ThemeContext';
import useCurrentUser from '@/hooks/useCurrentUser';
import useProgress from '@/hooks/useProgress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const Profile: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useCurrentUser();
  const { progress, totalMastery, level } = useProgress();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const isREDI = theme === 'redi';
  
  // Theme-specific classes
  const cardBgClass = isREDI ? 'bg-[#1e1e1e]' : 'bg-[#2d4438]';
  const accentColor = isREDI ? 'text-[#39ff14]' : 'text-[#ffd700]';
  const accentBgClass = isREDI 
    ? 'bg-gradient-to-r from-[#6320ee] to-[#1c77c3]' 
    : 'bg-gradient-to-r from-[#3cb371] to-[#588157]';
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <MainLayout 
      title="Profile" 
      subtitle="Your account and progress"
    >
      <div className="space-y-4">
        {/* User Info */}
        <Card className={`${cardBgClass} shadow-lg border-none`}>
          <div className="p-4">
            <div className="flex items-center">
              <div className="mr-4">
                <div className={`w-16 h-16 rounded-full ${isREDI ? 'bg-[#6320ee]' : 'bg-[#3cb371]'} flex items-center justify-center text-white text-xl font-bold`}>
                  {user?.displayName?.[0] || 'U'}
                </div>
              </div>
              <div>
                <h2 className="text-white text-lg font-medium">{user?.displayName}</h2>
                <p className="text-gray-300 text-sm">Username: {user?.username}</p>
                <p className="text-gray-300 text-sm">Grade: {user?.grade || 'Not set'}</p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Progress Summary */}
        <Card className={`${cardBgClass} shadow-lg border-none`}>
          <div className="p-4">
            <h3 className="text-white text-md font-medium mb-3">Writing Progress</h3>
            
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-300 text-sm">Overall Mastery</span>
                <span className={`${accentColor} text-sm`}>{totalMastery}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isREDI ? 'redi-accent-gradient' : 'owl-accent-gradient'}`} 
                  style={{ width: `${totalMastery}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-white text-sm">Writer Level</p>
                <p className={`${accentColor} text-lg font-bold`}>{level}</p>
              </div>
              <div>
                <p className="text-white text-sm">Exercises</p>
                <p className={`${accentColor} text-lg font-bold`}>
                  {progress?.completedExercises.length || 0}
                </p>
              </div>
              <div>
                <p className="text-white text-sm">Quests</p>
                <p className={`${accentColor} text-lg font-bold`}>
                  {progress?.completedQuests.length || 0}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Writing Portfolio */}
        <Card className={`${cardBgClass} shadow-lg border-none`}>
          <div className="p-4">
            <h3 className="text-white text-md font-medium mb-3">Writing Portfolio</h3>
            
            <p className="text-gray-300 text-sm mb-3">
              View and share your completed writing quests.
            </p>
            
            <Button className={`w-full ${accentBgClass} text-white`}>
              View Portfolio
            </Button>
          </div>
        </Card>
        
        {/* Account Actions */}
        <Card className={`${cardBgClass} shadow-lg border-none`}>
          <div className="p-4">
            <h3 className="text-white text-md font-medium mb-3">Account</h3>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full text-white border-gray-600">
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-red-400 border-red-800 hover:bg-red-900/20"
                onClick={handleLogout}
              >
                Log Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;
