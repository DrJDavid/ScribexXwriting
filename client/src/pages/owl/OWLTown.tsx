import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import OWLMapLocation from '@/components/owl/OWLMapLocation';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getTownLocations } from '@/data/quests';
import { 
  Building, Book, Theater, Coffee, TreePine,
  FileText, Pencil, BookOpen, Feather, PenTool
} from 'lucide-react';

const OWLTown: React.FC = () => {
  const { setTheme } = useTheme();
  const [, navigate] = useLocation();
  const { progress, isLoading } = useProgress();
  
  // Make sure OWL theme is active
  useEffect(() => {
    setTheme('owl');
  }, [setTheme]);
  
  // Handle location click
  const handleLocationPress = (locationId: string) => {
    // In a real app, this would navigate to location detail first
    // For simplicity, we'll just pick the first quest at this location
    const locations = getTownLocations();
    const location = locations.find(loc => loc.id === locationId);
    
    if (location && location.quests && location.quests.length > 0) {
      navigate(`/owl/quest/${location.quests[0]}`);
    }
  };
  
  // Map icon strings to icon components
  const getLocationIcon = (iconType: string) => {
    const iconProps = { className: "h-8 w-8 text-white", strokeWidth: 1.5 };
    
    switch(iconType) {
      case 'building':
        return <Building {...iconProps} />;
      case 'book':
        return <Book {...iconProps} />;
      case 'theater':
        return <Theater {...iconProps} />;
      case 'coffee':
        return <Coffee {...iconProps} />;
      case 'tree':
        return <TreePine {...iconProps} />;
      default:
        return <Pencil {...iconProps} />;
    }
  };
  
  // Get locations with proper status based on progress
  const locations = getTownLocations().map(location => ({
    ...location,
    status: progress?.unlockedLocations.includes(location.id) ? 'unlocked' : 'locked',
    icon: getLocationIcon(location.icon)
  }));

  return (
    <MainLayout 
      title="OWL" 
      subtitle="Open World Learning"
    >
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-montserrat text-white text-lg">Writer's Town</h2>
          <div className="bg-[#2d4438] rounded-full px-3 py-1 flex items-center">
            <span className="text-[#ffd700] text-xs mr-1">★</span>
            <span className="text-white text-xs">{progress?.currency || 0}</span>
          </div>
        </div>
        
        {/* Town Map */}
        <div className="relative bg-[#2d4438] rounded-xl p-4 overflow-hidden min-h-[400px]">
          {/* Map background with opacity */}
          <div className="absolute inset-0 bg-[#1a2f23]/60 z-0"></div>
          
          {/* Map locations */}
          <div className="relative z-10">
            {locations.map((location) => (
              <OWLMapLocation
                key={location.id}
                id={location.id}
                name={location.name}
                description={location.description}
                icon={location.icon}
                status={location.status as 'locked' | 'unlocked'}
                position={location.position}
                onPress={handleLocationPress}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OWLTown;
