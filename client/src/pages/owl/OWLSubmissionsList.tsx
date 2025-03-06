import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/context/ThemeContext';
import MainLayout from '@/components/layouts/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, AlertCircle, BookOpen, Calendar, Sparkles, Leaf, Clock, Filter, ArrowRight, Eye } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { WritingSubmission } from '@shared/schema';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

// Plant decoration component for botanical aesthetic
const PlantElement = ({
  type = 'leaf',
  size = 20,
  style = {},
  className = '',
  speed = 6,
  delay = 0
}) => {
  const getPlantIcon = () => {
    const iconProps = { size, className: `text-emerald-300/80 ${className}` };
    
    switch (type) {
      case 'leaf': return <Leaf {...iconProps} />;
      case 'sparkle': return <Sparkles {...iconProps} />;
      case 'plant': return <Leaf {...iconProps} />;
      case 'star': return <Sparkles {...iconProps} />;
      default: return <Leaf {...iconProps} />;
    }
  };
  
  return (
    <motion.div
      className="absolute z-10"
      animate={{
        y: [0, -10, 0, 10, 0],
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        delay: delay
      }}
      style={style}
    >
      {getPlantIcon()}
    </motion.div>
  );
};

const OWLSubmissionsList: React.FC = () => {
  const { setTheme } = useTheme();
  const [, navigate] = useLocation();
  const [filterStatus, setFilterStatus] = useState<'all' | 'reviewed' | 'pending'>('all');
  
  // Make sure OWL theme is active
  useEffect(() => {
    setTheme('owl');
  }, [setTheme]);
  
  // Fetch user's writing submissions
  const { data: submissions, isLoading, error } = useQuery<WritingSubmission[]>({
    queryKey: ['/api/writing/submissions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/writing/submissions');
      return await res.json() as WritingSubmission[];
    }
  });
  
  const handleViewSubmission = (id: number) => {
    navigate(`/writing/submissions/${id}`);
  };
  
  const handleBackToTown = () => {
    navigate('/owl');
  };
  
  // Filter submissions based on status
  const filteredSubmissions = submissions?.filter(submission => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'reviewed') return submission.status === 'reviewed';
    if (filterStatus === 'pending') return submission.status === 'pending';
    return true;
  });
  
  // Create plants array for decoration
  const plants = [
    { type: 'leaf', x: '3%', y: '15%', size: 18, speed: 4, delay: 0 },
    { type: 'plant', x: '7%', y: '80%', size: 24, speed: 6, delay: 1 },
    { type: 'sparkle', x: '95%', y: '10%', size: 16, speed: 3, delay: 1.5 },
    { type: 'star', x: '93%', y: '85%', size: 14, speed: 4, delay: 0.7 },
    { type: 'plant', x: '83%', y: '22%', size: 22, speed: 5, delay: 2.2 },
  ];
  
  // Handle loading state
  if (isLoading) {
    return (
      <MainLayout title="Writing Portfolio" showBackButton={true} onBackClick={handleBackToTown}>
        <div className="relative flex justify-center items-center h-64 bg-gradient-to-b from-emerald-900/40 to-emerald-950/40 rounded-lg">
          <div className="absolute inset-0 bg-botanical-pattern opacity-10"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative z-10"
          >
            <Plant className="h-12 w-12 text-emerald-400/70" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute text-emerald-200/80 text-sm mt-16"
          >
            Loading your garden of words...
          </motion.div>
        </div>
      </MainLayout>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <MainLayout title="Writing Portfolio" showBackButton={true} onBackClick={handleBackToTown}>
        <div className="p-4">
          <Card className="bg-gradient-to-br from-red-900/60 to-red-950/60 border border-red-700/50 p-6 shadow-md rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-900/80 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-200" />
              </div>
              <h3 className="text-lg font-bold text-red-100 font-botanical">Error Loading Portfolio</h3>
            </div>
            <p className="text-red-200/90 pl-12">
              There was an error retrieving your writing submissions. Please try again later or return to Writer's Town.
            </p>
            <div className="mt-4 pl-12">
              <Button 
                onClick={handleBackToTown}
                className="bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100"
              >
                Return to Writer's Town
              </Button>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout 
      title="Writing Portfolio" 
      subtitle="Your garden of creative expression"
      showBackButton={true} 
      onBackClick={handleBackToTown}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 relative"
      >
        {/* Decorative plants */}
        {plants.map((plant, index) => (
          <PlantElement
            key={index}
            type={plant.type}
            size={plant.size}
            speed={plant.speed}
            delay={plant.delay}
            style={{ top: plant.y, left: plant.x }}
          />
        ))}
        
        {/* Portfolio header with filter controls */}
        <div className="bg-gradient-to-br from-emerald-900/90 to-emerald-950/90 rounded-xl p-4 mb-6 border border-emerald-700/50 backdrop-blur-sm shadow-glow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-800/80 p-2 rounded-lg shadow-inner">
                <BookOpen className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-xl font-botanical text-emerald-100">Your Writing Collection</h2>
                <p className="text-xs text-emerald-300/80">Explore your creative works and feedback</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="text-xs text-emerald-200 mr-2 hidden sm:block">Filter:</div>
              <div className="flex bg-emerald-950/50 rounded-lg p-1 border border-emerald-800/50">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`text-xs px-3 py-1 h-7 ${filterStatus === 'all' 
                    ? 'bg-emerald-800/90 text-emerald-50' 
                    : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/50'}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`text-xs px-3 py-1 h-7 ${filterStatus === 'reviewed' 
                    ? 'bg-emerald-800/90 text-emerald-50' 
                    : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/50'}`}
                  onClick={() => setFilterStatus('reviewed')}
                >
                  <Sparkles className="h-3 w-3 mr-1" /> 
                  Reviewed
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`text-xs px-3 py-1 h-7 ${filterStatus === 'pending' 
                    ? 'bg-emerald-800/90 text-emerald-50' 
                    : 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/50'}`}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submission cards */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {filteredSubmissions && filteredSubmissions.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredSubmissions.map((submission) => (
                  <motion.div
                    key={submission.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="bg-gradient-to-br from-emerald-900/90 to-emerald-950/90 border border-emerald-700/50 shadow-glow-sm rounded-xl overflow-hidden backdrop-blur-sm">
                      {/* Status indicator */}
                      <div className="absolute top-0 right-0">
                        {submission.status === 'reviewed' ? (
                          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 text-xs uppercase font-medium tracking-wider">
                            <span className="flex items-center">
                              <Sparkles className="h-3 w-3 mr-1 text-emerald-200" />
                              Reviewed
                            </span>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-3 py-1 text-xs uppercase font-medium tracking-wider">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-amber-200" />
                              Pending
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-4">
                            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 p-3 rounded-lg shadow-md">
                              <FileText className="h-6 w-6 text-emerald-300" />
                            </div>
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="text-xl font-botanical text-emerald-100 mb-2">{submission.title}</h3>
                            
                            <div className="flex items-center text-xs text-emerald-300/80 mb-3">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>Submitted on {new Date(submission.submittedAt || Date.now()).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                            </div>
                            
                            <div className="bg-emerald-950/50 rounded-lg p-3 border border-emerald-800/30 mb-4">
                              <p className="text-emerald-100/90 line-clamp-2 italic">
                                "{submission.content.substring(0, 150)}..."
                              </p>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div>
                                {submission.status === 'reviewed' && (
                                  <Badge variant="outline" className="bg-emerald-900/50 text-emerald-300 border-emerald-700/50 px-2">
                                    <Sparkles className="h-3 w-3 mr-1 text-amber-300" />
                                    Feedback Available
                                  </Badge>
                                )}
                              </div>
                              
                              <Button 
                                onClick={() => handleViewSubmission(submission.id)}
                                className="bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-emerald-50 shadow-md"
                                size="sm"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View {submission.status === 'reviewed' ? 'Feedback' : 'Submission'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-emerald-900/90 to-emerald-950/90 border border-emerald-700/50 p-6 shadow-glow-sm text-center rounded-xl">
                  <div className="flex flex-col items-center">
                    <div className="bg-emerald-800/50 p-4 rounded-full mb-4 border border-emerald-700/30">
                      <Plant className="h-12 w-12 text-emerald-400/90" />
                    </div>
                    <h3 className="text-xl font-botanical text-emerald-100 mb-2">Your Garden Awaits</h3>
                    <p className="text-emerald-200/80 mb-6 max-w-md">
                      You haven't planted any writing seeds yet. Visit Writer's Town to begin your creative journey.
                    </p>
                    <Button 
                      onClick={handleBackToTown}
                      className="bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-emerald-50 shadow-md"
                    >
                      <Plant className="h-4 w-4 mr-2" />
                      Explore Writing Quests
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default OWLSubmissionsList;