import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import MainLayout from '@/components/layouts/MainLayout';
import { useTheme } from '@/context/ThemeContext';
import { getLocationById, getQuestsForLocation } from '@/data/quests';
import { Book, Building, Coffee, MapPin, Pencil, Theater, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { WritePromptGenerator, GeneratedPrompt } from '@/components/writing/WritePromptGenerator';
import { useToast } from '@/hooks/use-toast';

const OWLLocationDetail = () => {
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = useParams<{ locationId: string }>();
  const [activeTab, setActiveTab] = useState("quests");
  const [selectedPrompt, setSelectedPrompt] = useState<GeneratedPrompt | null>(null);
  
  // Make sure OWL theme is active
  useEffect(() => {
    setTheme('owl');
  }, [setTheme]);
  
  // Get location data
  const location = getLocationById(params.locationId);
  const quests = location ? getQuestsForLocation(location.id) : [];
  
  if (!location) {
    return (
      <MainLayout title="Location Not Found" subtitle="This location doesn't exist in OWL Town.">
        <div className="h-full flex flex-col items-center justify-center">
          <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-6">We couldn't find this location in OWL Town.</p>
          <Button onClick={() => navigate('/owl')}>Return to OWL Town</Button>
        </div>
      </MainLayout>
    );
  }
  
  // Map icon string to component
  const getLocationIcon = (iconType: string) => {
    const iconProps = { className: "h-12 w-12 text-primary", strokeWidth: 1.5 };
    
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
  
  const handleStartQuestWithPrompt = (questId: string) => {
    if (selectedPrompt) {
      // In a real implementation, we would save the prompt data to be used in the quest
      // Here, we're just navigating to the quest and showing a toast
      toast({
        title: "Prompt Selected",
        description: "Your custom prompt will be used for this writing activity.",
      });
      navigate(`/owl/quest/${questId}`);
    }
  };
  
  const handleQuestStart = (questId: string) => {
    navigate(`/owl/quest/${questId}`);
  };
  
  return (
    <MainLayout 
      title={location.name} 
      subtitle={`${location.type.charAt(0).toUpperCase() + location.type.slice(1)} Writing Venue`}
      showBackButton
      onBackClick={() => navigate('/owl')}
    >
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-shrink-0 flex justify-center">
            <div className="w-24 h-24 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              {getLocationIcon(location.icon)}
            </div>
          </div>
          
          <div className="flex-grow">
            <h1 className="text-2xl font-bold">{location.name}</h1>
            <p className="text-muted-foreground mb-3">{location.description}</p>
            <Badge>{location.type} writing</Badge>
          </div>
        </div>
        
        <Tabs defaultValue="quests" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="quests">Writing Quests</TabsTrigger>
            <TabsTrigger value="prompt-generator">AI Prompt Generator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quests" className="space-y-4">
            {quests.length > 0 ? (
              quests.map(quest => (
                <Card key={quest.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{quest.title}</CardTitle>
                        <CardDescription>
                          {quest.skillFocus.charAt(0).toUpperCase() + quest.skillFocus.slice(1)} · Level {quest.level} · {quest.minWordCount}+ words
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{quest.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {quest.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 flex justify-between">
                    {selectedPrompt ? (
                      <>
                        <Button variant="outline" onClick={() => setSelectedPrompt(null)}>
                          Remove Custom Prompt
                        </Button>
                        <Button onClick={() => handleStartQuestWithPrompt(quest.id)}>
                          Start with Custom Prompt
                        </Button>
                      </>
                    ) : (
                      <Button className="ml-auto" onClick={() => handleQuestStart(quest.id)}>
                        Start Quest
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Pencil className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No quests available</h3>
                <p className="text-muted-foreground">
                  There are no writing quests available at this location yet.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="prompt-generator">
            <WritePromptGenerator 
              location={location}
              onSelectPrompt={(promptData) => {
                setSelectedPrompt(promptData);
                setActiveTab("quests");
                toast({
                  title: "Prompt Generated",
                  description: "Your custom prompt is ready! Select a quest to use it with.",
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default OWLLocationDetail;