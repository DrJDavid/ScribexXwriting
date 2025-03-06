import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, PenLine, Flame, Award, Star } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  prompt: string;
  wordMinimum: number;
  skillFocus: 'mechanics' | 'sequencing' | 'voice';
  difficulty: number;
}

interface DailyWritingStreakProps {
  currentStreak: number;
  longestStreak: number;
  isChallengeCompleted: boolean;
  lastWritingDate: string | null;
}

export function DailyWritingStreak({
  currentStreak,
  longestStreak,
  isChallengeCompleted,
  lastWritingDate,
}: DailyWritingStreakProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Check if the last writing activity was today
  const hasWrittenToday = lastWritingDate && lastWritingDate.includes(today);
  
  useEffect(() => {
    // Fetch current daily challenge on component mount
    fetchDailyChallenge();
  }, []);
  
  const fetchDailyChallenge = async () => {
    try {
      setLoading(true);
      // Create correct API request using the URL as the first argument and method as the second
      const response = await apiRequest('GET', '/api/daily-challenge');
      // Parse the JSON response
      const result = await response.json();
      if (result) {
        setChallenge(result as DailyChallenge);
      }
    } catch (error) {
      console.error('Error fetching daily challenge', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateNewChallenge = async () => {
    try {
      setGenerating(true);
      // Create correct API request using the URL as the first argument and method as the second
      const response = await apiRequest('POST', '/api/daily-challenge/generate');
      // Parse the JSON response
      const result = await response.json();
      if (result) {
        setChallenge(result as DailyChallenge);
        toast({
          title: "New Challenge Generated!",
          description: "Your daily writing challenge has been refreshed.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate a new challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };
  
  const startChallenge = () => {
    if (challenge) {
      navigate(`/owl/writing/challenge/${challenge.id}`);
    }
  };
  
  // Calculate streak flame size based on current streak
  const getStreakFlameSize = () => {
    if (currentStreak >= 30) return 'w-10 h-10 text-orange-500';
    if (currentStreak >= 14) return 'w-8 h-8 text-orange-400';
    if (currentStreak >= 7) return 'w-7 h-7 text-orange-300';
    return 'w-6 h-6 text-orange-200';
  };
  
  return (
    <Card className="w-full bg-gradient-to-br from-indigo-950 to-violet-900 border-violet-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Writing Challenge
          </CardTitle>
          {currentStreak > 0 && (
            <div className="flex items-center gap-1">
              <Flame className={getStreakFlameSize()} />
              <span className="font-bold">{currentStreak}</span>
              <span className="text-sm text-gray-300">day{currentStreak !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <CardDescription className="text-gray-300">
          {isChallengeCompleted 
            ? "Today's challenge completed! Great job!" 
            : hasWrittenToday 
              ? "Keep up the good work, you've written today!" 
              : "Maintain your writing streak by completing today's challenge"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ) : challenge ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{challenge.title}</h3>
              <p className="text-sm text-gray-300">{challenge.description}</p>
              {challenge.wordMinimum && (
                <Badge variant="outline" className="text-xs border-violet-500">
                  {challenge.wordMinimum}+ words
                </Badge>
              )}
              {challenge.skillFocus && (
                <Badge variant="outline" className="text-xs ml-2 border-violet-500">
                  Focus: {challenge.skillFocus}
                </Badge>
              )}
              {challenge.difficulty && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300 mb-1">
                    <span>Difficulty:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < challenge.difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-gray-300">No challenge available</p>
            <Button 
              variant="outline" 
              className="text-violet-300 border-violet-700 hover:bg-violet-800"
              onClick={generateNewChallenge}
              disabled={generating}
            >
              Generate Challenge
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4">
        {challenge && (
          <div className="w-full">
            <Button 
              className="w-full bg-violet-600 hover:bg-violet-500 flex items-center gap-2"
              onClick={startChallenge}
              disabled={isChallengeCompleted}
            >
              {isChallengeCompleted ? 'Challenge Completed!' : 'Start Challenge'}
              <PenLine className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <div className="flex w-full gap-4 items-center text-sm">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Current: {currentStreak}</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>Best: {longestStreak}</span>
          </div>
          {!isChallengeCompleted && (
            <div className="ml-auto">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs h-7 text-gray-300 hover:text-white hover:bg-violet-800"
                onClick={generateNewChallenge}
                disabled={generating}
              >
                New Challenge
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}