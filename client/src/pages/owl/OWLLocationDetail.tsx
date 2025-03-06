import { useState, useEffect } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WritePromptGenerator, GeneratedPrompt } from '@/components/writing/WritePromptGenerator';
import { PromptModal } from '@/components/writing/PromptModal';
import { getLocationById, getQuestsForLocation } from '@/data/quests';
import { useProgress } from '@/context/ProgressContext';
import { Pencil, ArrowLeft, MapPin } from 'lucide-react';

export default function OWLLocationDetail() {
  const [, params] = useRoute('/owl/location/:locationId');
  const [, navigate] = useLocation();
  const locationId = params?.locationId || '';
  const location = getLocationById(locationId);
  const quests = getQuestsForLocation(locationId);
  const { progress } = useProgress();
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  
  // Debug logging only - no state changes in useEffect to avoid loops
  useEffect(() => {
    console.log("generatedPrompt state changed:", generatedPrompt);
    console.log("Modal open state:", promptModalOpen);
    // Do not set state here to avoid loops - the modal is controlled explicitly by the parent
  }, [generatedPrompt, promptModalOpen]);
  
  // Prevent any unwanted state resets
  useEffect(() => {
    // This ensures the component doesn't reset state unexpectedly on re-renders
    return () => {
      // Intentionally empty cleanup to prevent state reset on unmount
    };
  }, []);
  
  // Handle back button click properly - use navigate instead of window.history
  const handleBackClick = () => {
    navigate('/owl');
  };
  
  if (!location) {
    return (
      <MainLayout 
        title="Location Not Found" 
        subtitle="The requested location doesn't exist"
        showBackButton
        onBackClick={handleBackClick}
      >
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-xl mb-4">This location doesn't seem to exist in OWL Town.</p>
          <Link href="/owl">
            <Button>Return to OWL Town</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={location.name}
      subtitle={`${location.type.charAt(0).toUpperCase() + location.type.slice(1)} Writing Venue`}
      showBackButton
      onBackClick={handleBackClick}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Details
              </CardTitle>
              <CardDescription>Learn about this location and its writing focus</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{location.description}</p>
              <div className="bg-muted p-4 rounded-md mb-4">
                <h3 className="font-semibold mb-2">Writing Type: {location.type.charAt(0).toUpperCase() + location.type.slice(1)}</h3>
                <p className="text-sm">
                  {location.type === 'narrative' && 'Focus on telling stories with characters, plot, and setting.'}
                  {location.type === 'descriptive' && 'Paint vivid pictures with words, focusing on sensory details.'}
                  {location.type === 'argumentative' && 'Convince readers of your position with evidence and reasoning.'}
                  {location.type === 'informative' && 'Share knowledge and explain concepts clearly.'}
                  {location.type === 'reflective' && 'Express personal thoughts and insights about experiences.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Quests</CardTitle>
              <CardDescription>Writing challenges at this location</CardDescription>
            </CardHeader>
            <CardContent>
              {quests.length > 0 ? (
                <div className="space-y-4">
                  {quests.map(quest => {
                    const isCompleted = progress?.completedQuests.includes(quest.id);
                    const isUnlocked = progress && progress.owlSkillMastery ? (
                      (progress.owlSkillMastery.mechanics ?? 0) >= quest.unlockRequirements.skillMastery.mechanics &&
                      (progress.owlSkillMastery.sequencing ?? 0) >= quest.unlockRequirements.skillMastery.sequencing &&
                      (progress.owlSkillMastery.voice ?? 0) >= quest.unlockRequirements.skillMastery.voice
                    ) : false;
                    
                    return (
                      <Card key={quest.id} className={`border ${isCompleted ? 'border-green-500' : ''}`}>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base flex justify-between">
                            <span>{quest.title}</span>
                            {isCompleted && <span className="text-green-500">✓ Completed</span>}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <p className="text-sm">{quest.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {quest.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-muted text-xs rounded-full">{tag}</span>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="py-2">
                          {isUnlocked ? (
                            <Link href={`/owl/quest/${quest.id}`}>
                              <Button size="sm" className="w-full">
                                <Pencil className="w-4 h-4 mr-2" />
                                {isCompleted ? 'Revisit Quest' : 'Start Quest'}
                              </Button>
                            </Link>
                          ) : (
                            <Button size="sm" className="w-full" variant="outline" disabled>
                              Locked - Improve your skills first
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p>No quests are available at this location yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Modal for prompt display */}
          <PromptModal 
            open={promptModalOpen}
            onOpenChange={setPromptModalOpen}
            prompt={generatedPrompt}
            onNewPrompt={() => {
              setGeneratedPrompt(null);
              setPromptModalOpen(false);
            }}
            onStartWriting={() => {
              // Store the generated prompt in sessionStorage
              if (generatedPrompt) {
                const promptKey = `prompt_${new Date().getTime()}`;
                const promptData = {
                  prompt: generatedPrompt.prompt,
                  scenario: generatedPrompt.scenario,
                  guidingQuestions: generatedPrompt.guidingQuestions || [],
                  suggestedElements: generatedPrompt.suggestedElements || [],
                  challengeElement: generatedPrompt.challengeElement || ""
                };
                
                // Store the data in sessionStorage
                sessionStorage.setItem(promptKey, JSON.stringify(promptData));
                console.log("Stored prompt data in sessionStorage with key:", promptKey);
                
                // Navigate to the writing page
                navigate(`/owl/quest/free-write?locationId=${locationId}&promptType=${location.type}&mode=generated&promptKey=${promptKey}`);
              }
            }}
          />

          <Tabs defaultValue="prompt-generator">
            <TabsList className="w-full">
              <TabsTrigger value="prompt-generator" className="flex-1">Prompt Generator</TabsTrigger>
              <TabsTrigger value="free-write" className="flex-1">Free Write</TabsTrigger>
            </TabsList>
            
            <TabsContent value="prompt-generator" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generate a Writing Prompt</CardTitle>
                  <CardDescription>
                    Create a custom {location.type} writing prompt based on this location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WritePromptGenerator 
                    location={location}
                    initialPrompt={generatedPrompt}
                    onSelectPrompt={(prompt) => {
                      console.log("Prompt selected in OWLLocationDetail:", prompt);
                      if (prompt) {
                        // Deep clone the prompt to prevent reference issues
                        const updatedPrompt = {
                          prompt: prompt.prompt,
                          scenario: prompt.scenario,
                          guidingQuestions: [...(prompt.guidingQuestions || [])],
                          suggestedElements: [...(prompt.suggestedElements || [])],
                          challengeElement: prompt.challengeElement || ""
                        };
                        console.log("Setting generatedPrompt to:", updatedPrompt);
                        
                        // First set the prompt
                        setGeneratedPrompt(updatedPrompt);
                        
                        // Manually trigger the modal open with a slight delay to ensure state is updated
                        setTimeout(() => {
                          console.log("Delayed opening of modal");
                          setPromptModalOpen(true);
                        }, 10);
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="free-write" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Free Writing</CardTitle>
                  <CardDescription>
                    Express yourself freely without a specific prompt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Sometimes the best writing comes from complete freedom. Use this space to write 
                    about anything that comes to mind related to {location.name}.
                  </p>
                  <p className="mb-4">
                    This is a great way to practice your {location.type} writing skills without 
                    the structure of a specific prompt or quest.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/owl/quest/free-write?locationId=${locationId}&promptType=${location.type}&mode=free`}>
                    <Button className="w-full">
                      <Pencil className="w-4 h-4 mr-2" />
                      Start Free Writing
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}