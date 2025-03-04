import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

interface UserAvatarProps {
  theme: 'redi' | 'owl';
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ theme, size = 'md' }) => {
  const { currentUser } = useAuth();
  
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };
  
  // Theme-specific classes
  const themeClasses = {
    redi: 'bg-[#1e1e1e] border-2 border-[#39ff14]',
    owl: 'bg-[#2d4438] border-2 border-[#ffd700]',
  };
  
  // Get the user's initials for the fallback
  const getInitials = () => {
    if (!currentUser?.displayName) return 'U';
    return currentUser.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${themeClasses[theme]} overflow-hidden`}>
      {currentUser?.avatarUrl && (
        <AvatarImage 
          src={currentUser.avatarUrl} 
          alt={`${currentUser.displayName}'s avatar`} 
          className="object-cover"
        />
      )}
      <AvatarFallback className={`font-medium text-white ${theme === 'redi' ? 'bg-[#6320ee]' : 'bg-[#3cb371]'}`}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
