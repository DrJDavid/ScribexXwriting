import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { Card } from '@/components/ui/card';
import { getAllAchievements } from '@/data/achievements';

const Achievements: React.FC = () => {
  const { theme } = useTheme();
  const { isAchievementUnlocked } = useProgress();
  
  const isREDI = theme === 'redi';
  
  // Theme-specific classes
  const cardBgClass = isREDI ? 'bg-[#1e1e1e]' : 'bg-[#2d4438]';
  const accentColor = isREDI ? 'text-[#39ff14]' : 'text-[#ffd700]';
  const lockedBgClass = isREDI ? 'bg-gray-800' : 'bg-gray-800';
  const unlockedBgClass = isREDI ? 'bg-[#6320ee]' : 'bg-[#3cb371]';
  const iconClass = isREDI ? 'text-[#39ff14]' : 'text-[#ffd700]';
  
  // Get all achievements
  const achievements = getAllAchievements();

  return (
    <MainLayout 
      title="Achievements" 
      subtitle="Your learning milestones"
    >
      <div className="space-y-4">
        {/* Achievement Stats */}
        <Card className={`${cardBgClass} shadow-lg border-none`}>
          <div className="p-4">
            <h3 className="text-white text-md font-medium mb-3">Achievement Progress</h3>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm">
                Unlocked {achievements.filter(a => isAchievementUnlocked(a.id)).length} of {achievements.length}
              </span>
              <span className={`${accentColor}`}>
                {Math.round((achievements.filter(a => isAchievementUnlocked(a.id)).length / achievements.length) * 100)}%
              </span>
            </div>
            
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isREDI ? 'redi-accent-gradient' : 'owl-accent-gradient'}`} 
                style={{ 
                  width: `${Math.round((achievements.filter(a => isAchievementUnlocked(a.id)).length / achievements.length) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </Card>
        
        {/* Achievements List */}
        <div className="grid gap-3">
          {achievements.map((achievement) => {
            const isUnlocked = isAchievementUnlocked(achievement.id);
            
            return (
              <Card 
                key={achievement.id} 
                className={`${cardBgClass} shadow-lg border-none ${isUnlocked ? 'opacity-100' : 'opacity-70'}`}
              >
                <div className="p-4 flex items-center">
                  <div className={`mr-4 w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? unlockedBgClass : lockedBgClass}`}>
                    <span className={`text-xl ${isUnlocked ? iconClass : 'text-gray-400'}`}>
                      {achievement.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      {achievement.title}
                      {!isUnlocked && <span className="text-gray-400 text-xs ml-2">(Locked)</span>}
                    </h4>
                    <p className="text-gray-300 text-sm">{achievement.description}</p>
                    {isUnlocked && (
                      <p className={`text-xs ${accentColor} mt-1`}>+10 stars earned</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Achievements;
