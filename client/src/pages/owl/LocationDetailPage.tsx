import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WritePromptGenerator, GeneratedPrompt } from '@/components/writing/WritePromptGenerator';
import { getLocationById, getQuestsForLocation } from '@/data/quests';
import { useProgress } from '@/context/ProgressContext';
import { Pencil, MapPin, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LocationDetailPage() {
  // Log to confirm component is being rendered
  console.log("LocationDetailPage component is rendering");
  
  // Route params and navigation
  const [, params] = useRoute('/owl/location/:locationId');
  const [, navigate] = useLocation();
  const locationId = params?.locationId || '';
  const location = getLocationById(locationId);
  const quests = getQuestsForLocation(locationId);
  const { progress } = useProgress();
  const { toast } = useToast();
  
  // State for prompt generator
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Debug log the current state values on every render
  console.log("Current state values:", {
    generatedPrompt: generatedPrompt ? "exists" : "null",
    showPrompt,
    locationId
  });
  
  // Handle prompt selection
  const handleSelectPrompt = (prompt: GeneratedPrompt) => {
    console.log("Received prompt in LocationDetailPage:", prompt);
    
    const promptCopy = {
      prompt: prompt.prompt,
      scenario: prompt.scenario,
      guidingQuestions: [...(prompt.guidingQuestions || [])],
      suggestedElements: [...(prompt.suggestedElements || [])],
      challengeElement: prompt.challengeElement || ""
    };
    
    // Set the generated prompt and show it
    setGeneratedPrompt(promptCopy);
    setShowPrompt(true);
    
    // Show a toast notification
    toast({
      title: "Prompt Generated!",
      description: "Your writing prompt is now visible below.",
    });
    
    // Log the state updates to verify
    console.log("Updated state:", {
      generatedPrompt: promptCopy,
      showPrompt: true
    });
    
    // Scroll to the prompt after a short delay to ensure rendering
    setTimeout(() => {
      const promptSection = document.getElementById('generated-prompt-section');
      if (promptSection) {
        promptSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };
  
  // Handle generating a new prompt
  const handleNewPrompt = () => {
    console.log("Clearing prompt state");
    setGeneratedPrompt(null);
    setShowPrompt(false);
  };
  
  // Effect to ensure showPrompt is true when generatedPrompt is not null
  useEffect(() => {
    if (generatedPrompt && !showPrompt) {
      console.log("Setting showPrompt to true because generatedPrompt exists");
      setShowPrompt(true);
    }
  }, [generatedPrompt, showPrompt]);
  
  // Handle starting the writing process
  const handleStartWriting = () => {
    if (generatedPrompt && location) {
      // Store prompt in session storage
      const promptKey = `prompt_${Date.now()}`;
      sessionStorage.setItem(promptKey, JSON.stringify(generatedPrompt));
      
      // Navigate to writing page
      navigate(`/owl/quest/free-write?locationId=${locationId}&promptType=${location.type}&mode=generated&promptKey=${promptKey}`);
    }
  };
  
  // Show a not-found page if location doesn't exist
  if (!location) {
    return (
      <MainLayout title="Location Not Found">
        <div className="text-center py-10">
          <p className="text-xl mb-4">This location does not exist.</p>
          <Button onClick={() => navigate('/owl')}>Return to OWL Town</Button>
        </div>
      </MainLayout>
    );
  }
  
  // Find quests that the user has completed
  const completedQuestsForLocation = progress?.completedQuests.filter(
    questId => quests.some(quest => quest.id === questId)
  ) || [];
  
  return (
    <MainLayout
      title={location.name}
      subtitle={`${location.type.charAt(0).toUpperCase() + location.type.slice(1)} Writing Location`}
      showBackButton
      onBackClick={() => navigate('/owl')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Location Info and Quests */}
        <div className="space-y-6">
          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Location Details
              </CardTitle>
              <CardDescription>
                Learn about this location and its writing focus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Perfect for {location.type} writing
              </p>
              <div className="p-4 bg-muted rounded-md mb-4">
                <h3 className="font-semibold mb-2">Writing Type: {location.type.charAt(0).toUpperCase() + location.type.slice(1)}</h3>
                {location.type === 'argumentative' && (
                  <p>Convince readers of your position with evidence and reasoning.</p>
                )}
                {location.type === 'narrative' && (
                  <p>Tell a compelling story with characters, plot, and setting.</p>
                )}
                {location.type === 'descriptive' && (
                  <p>Paint a vivid picture with detailed observations and sensory language.</p>
                )}
                {location.type === 'informative' && (
                  <p>Educate readers about a topic using facts, examples, and explanations.</p>
                )}
                {location.type === 'reflective' && (
                  <p>Examine your experiences and share insights about personal growth.</p>
                )}
              </div>
              <p>{location.description}</p>
            </CardContent>
          </Card>

          {/* Quests */}
          <Card>
            <CardHeader>
              <CardTitle>Available Quests</CardTitle>
              <CardDescription>
                Writing challenges at this location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {quests.length === 0 ? (
                  <p>No quests available at this location yet.</p>
                ) : (
                  quests.map((quest) => {
                    const isCompleted = completedQuestsForLocation.includes(quest.id);
                    return (
                      <div key={quest.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{quest.title}</h3>
                          {isCompleted && (
                            <span className="text-green-500 flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" /> Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm mb-3">{quest.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {quest.tags.map((tag, index) => (
                            <span key={index} className="bg-muted text-xs px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button 
                          variant={isCompleted ? "outline" : "default"}
                          size="sm"
                          onClick={() => navigate(`/owl/quest/${quest.id}`)}
                          className={isCompleted ? "w-full" : "w-full bg-primary text-primary-foreground"}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          {isCompleted ? "Revisit Quest" : "Start Quest"}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Prompt Generator & Display */}
        <div className="space-y-6">
          <Tabs defaultValue="prompt-generator" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="prompt-generator">Prompt Generator</TabsTrigger>
              <TabsTrigger value="free-write">Free Write</TabsTrigger>
            </TabsList>
            
            {/* Prompt Generator Tab */}
            <TabsContent value="prompt-generator" className="mt-4 space-y-6">
              {/* Prompt Generator Card */}
              <Card id="prompt-generator-section">
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
              
              {/* Generated Prompt Display - only shown when a prompt exists and should be shown */}
              {showPrompt && generatedPrompt && (
                <Card 
                  id="generated-prompt-section"
                  className="border-primary border-2 shadow-lg animate-in fade-in-0 duration-200 mt-4"
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
                  
                  <CardContent className="space-y-4 py-4">
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
                          {generatedPrompt.guidingQuestions.map((question, index) => (
                            <li key={index}>{question}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Suggested Elements */}
                    {generatedPrompt.suggestedElements && generatedPrompt.suggestedElements.length > 0 && (
                      <div className="bg-muted p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Suggested Elements</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {generatedPrompt.suggestedElements.map((element, index) => (
                            <li key={index}>{element}</li>
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
                  
                  <CardFooter className="flex justify-between py-4">
                    <Button variant="outline" onClick={handleNewPrompt}>
                      Generate New Prompt
                    </Button>
                    <Button 
                      onClick={handleStartWriting} 
                      className="bg-primary text-primary-foreground"
                    >
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
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/owl/quest/free-write?locationId=${locationId}&promptType=${location.type}&mode=free`)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Start Free Writing
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}