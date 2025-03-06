import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/layouts/MainLayout';
import OWLMapLocation from '@/components/owl/OWLMapLocation';
import { useTheme } from '@/context/ThemeContext';
import useProgress from '@/hooks/useProgress';
import { getTownLocations } from '@/data/quests';
import { 
  Building, Book, Theater, Coffee, TreePine,
  FileText, Pencil, BookOpen, Feather, PenTool, 
  Leaf, Wind, Sparkles, Compass,
  MapPin, ArrowRight, Flower, Star
} from 'lucide-react';
import { Button } from "@/components/ui/button";

// Animated plant elements for the map
const PlantElement = ({ className, speed = 6, delay = 0, type = 'leaf', size = 20, style }: 
  { className: string, speed?: number, delay?: number, type?: string, size?: number, style?: React.CSSProperties }) => {
  
  const iconMap = {
    'leaf': <Leaf className="text-emerald-200/80" size={size} />,
    'plant': <Leaf className="text-emerald-300/80" size={size} />,
    'flower': <Flower className="text-teal-200/80" size={size} />,
    'sparkle': <Sparkles className="text-amber-100/80" size={size} />,
    'star': <Star className="text-yellow-200/80" size={size} />,
    'wind': <Wind className="text-cyan-200/80" size={size} />,
  };
  
  return (
    <motion.div 
      className={`absolute z-0 ${className}`}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: [0.3, 0.8, 0.3], 
        y: [0, -5, 0],
        rotate: type === 'wind' ? [-5, 5, -5] : [0, 0, 0],
        scale: type === 'sparkle' ? [0.8, 1.1, 0.8] : [1, 1, 1],
      }}
      transition={{ 
        duration: speed, 
        repeat: Infinity, 
        delay,
        ease: "easeInOut" 
      }}
    >
      {iconMap[type as keyof typeof iconMap] || iconMap.leaf}
    </motion.div>
  );
};

const OWLTown: React.FC = () => {
  const { setTheme } = useTheme();
  const [, navigate] = useLocation();
  const { progress, isLoading } = useProgress();
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'guide'>('explore');
  const [showAnimation, setShowAnimation] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Make sure OWL theme is active
  useEffect(() => {
    setTheme('owl');
    
    // Don't show animation - immediately set to false for quick navigation
    setShowAnimation(false);
  }, [setTheme]);
  
  // Handle location click
  const handleLocationPress = (locationId: string) => {
    // Add a gentle transition effect
    if (mapContainerRef.current) {
      mapContainerRef.current.classList.add('owl-transition-out');
      setTimeout(() => {
        navigate(`/owl/location/${locationId}`);
      }, 600);
    } else {
      navigate(`/owl/location/${locationId}`);
    }
  };
  
  // Map icon strings to icon components
  const getLocationIcon = (iconType: string) => {
    const iconProps = { className: "h-10 w-10 text-white drop-shadow-glow", strokeWidth: 1.5 };
    
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
  
  // Create plants array for decoration
  const plants = [
    { type: 'leaf', x: '5%', y: '15%', size: 22, speed: 4, delay: 0 },
    { type: 'plant', x: '8%', y: '75%', size: 24, speed: 6, delay: 1 },
    { type: 'leaf', x: '15%', y: '25%', size: 18, speed: 5, delay: 2 },
    { type: 'flower', x: '25%', y: '8%', size: 20, speed: 7, delay: 0.5 },
    { type: 'sparkle', x: '35%', y: '12%', size: 16, speed: 3, delay: 1.5 },
    { type: 'star', x: '65%', y: '5%', size: 14, speed: 4, delay: 0.7 },
    { type: 'wind', x: '75%', y: '20%', size: 26, speed: 8, delay: 1 },
    { type: 'leaf', x: '85%', y: '25%', size: 20, speed: 5, delay: 1.8 },
    { type: 'flower', x: '95%', y: '65%', size: 22, speed: 6, delay: 2.2 },
    { type: 'plant', x: '80%', y: '85%', size: 28, speed: 7, delay: 0.3 },
    { type: 'sparkle', x: '60%', y: '90%', size: 16, speed: 4, delay: 1.2 },
    { type: 'star', x: '45%', y: '80%', size: 14, speed: 3, delay: 0.9 },
    { type: 'leaf', x: '20%', y: '95%', size: 18, speed: 5, delay: 2.5 },
  ];
  
  // Get locations with proper status based on progress
  const locations = getTownLocations().map(location => ({
    ...location,
    status: progress?.unlockedLocations.includes(location.id) ? 'unlocked' : 'locked',
    icon: getLocationIcon(location.icon)
  }));
  
  // Find hovered location details
  const hoveredLocationData = locations.find(loc => loc.id === hoveredLocation);

  return (
    <MainLayout 
      title="OWL" 
      subtitle="Open World Learning"
    >
      {/* Loading animation removed for instant page transitions */}
      
      <div className="mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 2.3 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-botanical text-3xl font-bold mb-1 text-emerald-50 drop-shadow-md flex items-center">
                <Leaf className="inline-block mr-2 text-emerald-400" size={28} />
                Writer's Town
              </h2>
              <p className="text-emerald-200/80 text-sm italic">Explore the garden of creative possibilities</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-emerald-900/80 to-emerald-800/80 backdrop-blur-md rounded-full px-4 py-2 flex items-center border border-emerald-700/50">
                <Sparkles className="h-4 w-4 text-amber-300 mr-2 animate-pulse-slow" />
                <span className="text-amber-200 text-sm font-medium">{progress?.currency || 0} Seeds</span>
              </div>
            </div>
          </div>
          
          <div className="flex mb-4 space-x-2">
            <Button
              variant="ghost"
              className={`rounded-full px-6 py-2 text-sm transition-all duration-300 ${
                activeTab === 'explore' 
                  ? 'bg-gradient-to-r from-emerald-800/90 to-teal-800/90 text-emerald-50 shadow-md border border-emerald-700/50' 
                  : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/40'
              }`}
              onClick={() => setActiveTab('explore')}
            >
              <Compass className="mr-2 h-4 w-4" />
              Explore Locations
            </Button>
            
            <Button
              variant="ghost"
              className={`rounded-full px-6 py-2 text-sm transition-all duration-300 ${
                activeTab === 'guide' 
                  ? 'bg-gradient-to-r from-emerald-800/90 to-teal-800/90 text-emerald-50 shadow-md border border-emerald-700/50' 
                  : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/40'
              }`}
              onClick={() => setActiveTab('guide')}
            >
              <Book className="mr-2 h-4 w-4" />
              Journey Guide
            </Button>
          </div>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {activeTab === 'explore' ? (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Town Map */}
              <div 
                ref={mapContainerRef}
                className="relative rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Beautiful organic gradient background */}
                <div className="absolute inset-0 bg-gradient-radial from-emerald-800/90 via-emerald-900/90 to-emerald-950/90 z-0"></div>
                
                {/* Animated patterned background */}
                <div className="absolute inset-0 bg-botanical-pattern opacity-20 z-0 owl-pattern-float"></div>
                
                {/* Light rays effect */}
                <div className="absolute inset-0 owl-light-rays z-0 opacity-20"></div>
                
                {/* Decorative plants floating around */}
                {plants.map((plant, index) => (
                  <PlantElement
                    key={index}
                    className={`opacity-60`}
                    type={plant.type}
                    size={plant.size}
                    speed={plant.speed}
                    delay={plant.delay}
                    style={{ top: plant.y, left: plant.x }}
                  />
                ))}
                
                {/* Glowing orbs of light */}
                <div className="absolute top-[20%] left-[15%] w-20 h-20 rounded-full bg-gradient-to-r from-emerald-400/10 to-teal-300/10 blur-2xl"></div>
                <div className="absolute bottom-[25%] right-[20%] w-32 h-32 rounded-full bg-gradient-to-r from-amber-300/10 to-yellow-200/10 blur-3xl"></div>
                <div className="absolute top-[60%] left-[40%] w-16 h-16 rounded-full bg-gradient-to-r from-cyan-300/10 to-blue-200/10 blur-xl"></div>
                
                {/* Top gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-emerald-900/80 to-transparent z-10"></div>
                
                {/* Map container */}
                <div className="relative z-10 min-h-[600px] p-6 owl-map-container">
                  {/* Map locations */}
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
                      onHover={setHoveredLocation}
                    />
                  ))}
                </div>
                
                {/* Location detail panel */}
                <AnimatePresence>
                  {hoveredLocation && hoveredLocationData && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-6 right-6 max-w-xs bg-gradient-to-br from-emerald-900/90 to-emerald-950/90 backdrop-blur-md rounded-lg p-4 border border-emerald-700/50 z-20 shadow-glow-sm"
                    >
                      <div className="flex items-start mb-2">
                        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 p-2 rounded-lg mr-3 shadow-md">
                          {hoveredLocationData.icon}
                        </div>
                        <div>
                          <h3 className="text-emerald-100 font-bold text-lg font-botanical">{hoveredLocationData.name}</h3>
                          <div className="flex items-center text-xs text-emerald-300 mb-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="uppercase tracking-wider">Writer's Town</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-emerald-200/80 mb-3">{hoveredLocationData.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full ${hoveredLocationData.status === 'unlocked' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'} mr-2`}></span>
                          <span className={`text-xs ${hoveredLocationData.status === 'unlocked' ? 'text-emerald-300' : 'text-gray-400'}`}>
                            {hoveredLocationData.status === 'unlocked' ? 'Available' : 'Locked'}
                          </span>
                        </div>
                        
                        {hoveredLocationData.status === 'unlocked' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs bg-emerald-800/50 hover:bg-emerald-700/50 text-emerald-100 px-2 py-1 h-auto"
                            onClick={() => handleLocationPress(hoveredLocationData.id)}
                          >
                            Visit <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Map legend - moved to top left */}
                <div className="absolute top-24 left-6 bg-gradient-to-br from-emerald-900/90 to-emerald-950/90 backdrop-blur-md rounded-lg p-3 border border-emerald-700/50 shadow-glow-sm z-20">
                  <h3 className="text-xs font-medium text-emerald-200 mb-1.5 flex items-center">
                    <Compass className="h-3.5 w-3.5 mr-1 text-emerald-300" />
                    Map Legend
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-1.5"></div>
                      <span className="text-emerald-100">Unlocked Location</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-500 mr-1.5"></div>
                      <span className="text-gray-400">Locked Location</span>
                    </div>
                    <div className="flex items-center">
                      <Sparkles className="h-2.5 w-2.5 text-amber-300 mr-1.5" />
                      <span className="text-amber-100">Creative Energy</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-emerald-900/90 to-emerald-950/90 backdrop-blur-md rounded-2xl p-6 border border-emerald-700/50"
            >
              <h3 className="text-xl font-botanical text-emerald-100 mb-4 flex items-center">
                <Book className="mr-2 h-6 w-6 text-emerald-300" />
                Your Writing Journey
              </h3>
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 w-10 flex justify-center">
                    <div className="w-1 bg-gradient-to-b from-transparent via-emerald-500/50 to-emerald-700/50 h-full rounded-full"></div>
                  </div>
                  <div className="flex-grow ml-4 mb-8">
                    <div className="flex items-center mb-2">
                      <div className="bg-emerald-800 rounded-full p-2 mr-3">
                        <MapPin className="h-4 w-4 text-emerald-300" />
                      </div>
                      <h4 className="text-emerald-100 font-medium">Explore Writer's Town</h4>
                    </div>
                    <p className="text-sm text-emerald-200/80 pl-10">
                      Visit different locations to find writing quests, creative challenges, and inspiration.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-10 flex justify-center">
                    <div className="w-1 bg-gradient-to-b from-emerald-700/50 via-emerald-500/50 to-emerald-700/50 h-full rounded-full"></div>
                  </div>
                  <div className="flex-grow ml-4 mb-8">
                    <div className="flex items-center mb-2">
                      <div className="bg-emerald-800 rounded-full p-2 mr-3">
                        <PenTool className="h-4 w-4 text-emerald-300" />
                      </div>
                      <h4 className="text-emerald-100 font-medium">Complete Writing Quests</h4>
                    </div>
                    <p className="text-sm text-emerald-200/80 pl-10">
                      Express your creativity through various writing styles and genres.
                      Each quest helps you develop different aspects of your writing.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-10 flex justify-center">
                    <div className="w-1 bg-gradient-to-b from-emerald-700/50 to-transparent h-full rounded-full"></div>
                  </div>
                  <div className="flex-grow ml-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-emerald-800 rounded-full p-2 mr-3">
                        <Sparkles className="h-4 w-4 text-emerald-300" />
                      </div>
                      <h4 className="text-emerald-100 font-medium">Grow Your Skills</h4>
                    </div>
                    <p className="text-sm text-emerald-200/80 pl-10">
                      Earn creative energy and unlock new locations as you complete quests and receive feedback.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default OWLTown;
