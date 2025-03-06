import React, { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WritePromptGenerator, GeneratedPrompt } from '@/components/writing/WritePromptGenerator';
import { getLocationById, getQuestsForLocation } from '@/data/quests';
import { useProgress } from '@/context/ProgressContext';
import { Pencil, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OWLLocationDetail() {
  const [, params] = useRoute('/owl/location/:locationId');
  const [, navigate] = useLocation();
  const locationId = params?.locationId || '';
  const location = getLocationById(locationId);
  const quests = getQuestsForLocation(locationId);
  const { progress } = useProgress();
  const { toast } = useToast();
  
  // Use state for the prompt display
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  
  // This function is called by WritePromptGenerator when a prompt is selected
  const handleSelectPrompt = (prompt: GeneratedPrompt) => {
    console.log("OWLLocationDetail: Received prompt:", prompt);
    
    // Create a deep copy of the prompt to avoid reference issues
    const promptCopy = {
      prompt: prompt.prompt,
      scenario: prompt.scenario,
      guidingQuestions: [...(prompt.guidingQuestions || [])],
      suggestedElements: [...(prompt.suggestedElements || [])],
      challengeElement: prompt.challengeElement || ""
    };
    
    // Update state with the new prompt - use this EXACT object so it's definitely changed
    setGeneratedPrompt(promptCopy);
    
    // Show toast notification
    toast({
      title: "Prompt Generated!",
      description: "Your writing prompt is ready. Scroll down to view it.",
      variant: "default"
    });
    
    // Scroll to the prompt after a short delay to ensure rendering
    setTimeout(() => {
      const promptElement = document.getElementById('generated-prompt-card');
      if (promptElement) {
        console.log("Scrolling to prompt section");
        promptElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.log("Could not find prompt card element to scroll to");
      }
    }, 300);
  };
  
  // Generate a new prompt (clear the current one)
  const handleNewPrompt = () => {
    setGeneratedPrompt(null);
    
    // Scroll back to the generator
    setTimeout(() => {
      const generatorElement = document.getElementById('prompt-generator-card');
      if (generatorElement) {
        generatorElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Start writing with the generated prompt
  const handleStartWriting = () => {
    if (generatedPrompt) {
      // Save prompt to session storage for use in the writing page
      const promptKey = `prompt_${new Date().getTime()}`;
      sessionStorage.setItem(promptKey, JSON.stringify(generatedPrompt));
      
      // Navigate to the writing page with the prompt key
      navigate(`/owl/quest/free-write?locationId=${locationId}&promptType=${location?.type}&mode=generated&promptKey=${promptKey}`);
    }
  };
  
  // Handle back button click
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
          <p className="text-xl mb-4">This location doesn't exist in OWL Town.</p>
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
        {/* Left column - Location info and quests */}
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

        {/* Right column - Prompt generator and free write */}
        <div>
          <Tabs defaultValue="prompt-generator">
            <TabsList className="w-full">
              <TabsTrigger value="prompt-generator" className="flex-1">Prompt Generator</TabsTrigger>
              <TabsTrigger value="free-write" className="flex-1">Free Write</TabsTrigger>
            </TabsList>
            
            {/* Prompt Generator Tab */}
            <TabsContent value="prompt-generator" className="mt-4 space-y-6">
              {/* Prompt Generator Card */}
              <Card id="prompt-generator-card">
                <CardHeader>
                  <CardTitle>Generate a Writing Prompt</CardTitle>
                  <CardDescription>
                    Create a custom {location.type} writing prompt based on this location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WritePromptGenerator 
                    location={location}
                    onSelectPrompt={handleSelectPrompt}
                  />
                </CardContent>
              </Card>
              
              {/* Display the generated prompt if available */}
              {generatedPrompt && (
                <Card 
                  id="generated-prompt-card" 
                  className="border-primary border-2 shadow-lg animate-in fade-in duration-300"
                >
                  <CardHeader className="bg-primary/10">
                    <CardTitle className="flex items-center text-primary">
                      <Pencil className="w-5 h-5 mr-2" />
                      Your Writing Prompt
                    </CardTitle>
                    <CardDescription>
                      Use this prompt to inspire your writing
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 mt-2">
                    {/* Main Prompt */}
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="font-semibold mb-2">Prompt</h3>
                      <p>{generatedPrompt.prompt}</p>
                    </div>
                    
                    {/* Scenario */}
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="font-semibold mb-2">Scenario</h3>
                      <p>{generatedPrompt.scenario}</p>
                    </div>
                    
                    {/* Guiding Questions */}
                    {generatedPrompt.guidingQuestions && generatedPrompt.guidingQuestions.length > 0 && (
                      <div className="bg-muted p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Guiding Questions</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {generatedPrompt.guidingQuestions.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Suggested Elements */}
                    {generatedPrompt.suggestedElements && generatedPrompt.suggestedElements.length > 0 && (
                      <div className="bg-muted p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Suggested Elements</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {generatedPrompt.suggestedElements.map((e, i) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Challenge Element */}
                    {generatedPrompt.challengeElement && (
                      <div className="bg-muted p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Challenge Element</h3>
                        <p>{generatedPrompt.challengeElement}</p>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleNewPrompt}>
                      Generate New Prompt
                    </Button>
                    <Button onClick={handleStartWriting} className="bg-primary text-primary-foreground">
                      <Pencil className="w-4 h-4 mr-2" />
                      Start Writing
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
            
            {/* Free Write Tab */}
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