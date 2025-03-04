import React from 'react';
import { AIFeedback, SkillMastery } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/context/ThemeContext';
import { Badge } from '@/components/ui/badge';

interface WritingFeedbackProps {
  feedback: AIFeedback;
  skillsAssessed: SkillMastery;
  suggestedExercises?: string[];
}

const WritingFeedback: React.FC<WritingFeedbackProps> = ({
  feedback,
  skillsAssessed,
  suggestedExercises = []
}) => {
  const { theme } = useTheme();
  const isREDI = theme === 'redi';
  
  // Theme-based styling
  const primaryColor = isREDI ? 'text-[#39ff14]' : 'text-[#ffd700]';
  const secondaryColor = isREDI ? 'text-[#6320ee]' : 'text-[#3cb371]';
  const cardBgClass = isREDI ? 'bg-[#1e1e1e]' : 'bg-[#2d4438]';
  const cardBorderClass = isREDI ? 'border-[#39ff14]' : 'border-[#ffd700]';
  const accentBgClass = isREDI ? 'bg-[#6320ee] bg-opacity-20' : 'bg-[#3cb371] bg-opacity-20';
  
  // Progress bar colors
  const getProgressColor = (score: number) => {
    if (score < 50) return isREDI ? 'bg-red-600' : 'bg-red-800';
    if (score < 75) return isREDI ? 'bg-yellow-500' : 'bg-yellow-700';
    return isREDI ? 'bg-[#39ff14]' : 'bg-[#ffd700]';
  };
  
  return (
    <div className="space-y-6 pb-6">
      {/* Overall Feedback */}
      <Card className={`${cardBgClass} border ${cardBorderClass} p-4 shadow-md`}>
        <h3 className={`text-lg font-bold ${primaryColor} mb-2`}>Overall Assessment</h3>
        <p className="text-white">{feedback.overallFeedback}</p>
      </Card>
      
      {/* Skill Assessment */}
      <Card className={`${cardBgClass} border ${cardBorderClass} p-4 shadow-md`}>
        <h3 className={`text-lg font-bold ${primaryColor} mb-4`}>Skill Assessment</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-white">Mechanics</span>
              <span className={primaryColor}>{skillsAssessed.mechanics}%</span>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full ${getProgressColor(skillsAssessed.mechanics)}`} style={{ width: `${skillsAssessed.mechanics}%` }} />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-white">Sequencing</span>
              <span className={primaryColor}>{skillsAssessed.sequencing}%</span>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full ${getProgressColor(skillsAssessed.sequencing)}`} style={{ width: `${skillsAssessed.sequencing}%` }} />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-white">Voice</span>
              <span className={primaryColor}>{skillsAssessed.voice}%</span>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full ${getProgressColor(skillsAssessed.voice)}`} style={{ width: `${skillsAssessed.voice}%` }} />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`${cardBgClass} border ${cardBorderClass} p-4 shadow-md`}>
          <h3 className={`text-lg font-bold ${primaryColor} mb-2`}>Strengths</h3>
          <p className="text-white">{feedback.strengthsAnalysis}</p>
        </Card>
        
        <Card className={`${cardBgClass} border ${cardBorderClass} p-4 shadow-md`}>
          <h3 className={`text-lg font-bold ${primaryColor} mb-2`}>Areas to Improve</h3>
          <p className="text-white">{feedback.areasToImprove}</p>
        </Card>
      </div>
      
      {/* Detailed Suggestions */}
      <Card className={`${cardBgClass} border ${cardBorderClass} p-4 shadow-md`}>
        <h3 className={`text-lg font-bold ${primaryColor} mb-4`}>Suggestions</h3>
        
        <div className="space-y-4">
          {feedback.suggestions.mechanics && feedback.suggestions.mechanics.length > 0 && (
            <div>
              <h4 className={`text-md font-semibold ${secondaryColor} mb-2`}>Mechanics</h4>
              <ul className="list-disc list-inside text-white pl-2 space-y-1">
                {feedback.suggestions.mechanics.map((suggestion, index) => (
                  <li key={`mechanics-${index}`}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          {feedback.suggestions.sequencing && feedback.suggestions.sequencing.length > 0 && (
            <div>
              <h4 className={`text-md font-semibold ${secondaryColor} mb-2`}>Sequencing</h4>
              <ul className="list-disc list-inside text-white pl-2 space-y-1">
                {feedback.suggestions.sequencing.map((suggestion, index) => (
                  <li key={`sequencing-${index}`}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          {feedback.suggestions.voice && feedback.suggestions.voice.length > 0 && (
            <div>
              <h4 className={`text-md font-semibold ${secondaryColor} mb-2`}>Voice</h4>
              <ul className="list-disc list-inside text-white pl-2 space-y-1">
                {feedback.suggestions.voice.map((suggestion, index) => (
                  <li key={`voice-${index}`}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
      
      {/* Next Steps */}
      <Card className={`${cardBgClass} border ${cardBorderClass} p-4 shadow-md`}>
        <h3 className={`text-lg font-bold ${primaryColor} mb-2`}>Next Steps</h3>
        <p className="text-white mb-4">{feedback.nextSteps}</p>
        
        {suggestedExercises.length > 0 && (
          <div>
            <h4 className={`text-md font-semibold ${secondaryColor} mb-2`}>Recommended Exercises</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedExercises.map((exercise, index) => (
                <Badge key={`exercise-${index}`} className={`${accentBgClass} ${primaryColor}`}>
                  {exercise}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WritingFeedback;