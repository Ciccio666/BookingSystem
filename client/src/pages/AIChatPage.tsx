import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import PersonaList from "@/components/ai/PersonaList";
import AIChatWindow from "@/components/ai/AIChatWindow";
import { AIPersona, AIMessage } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Settings, Play, Pause, RotateCcw, RefreshCw, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const AIChatPage = () => {
  const [activePersonaId, setActivePersonaId] = useState<number | null>(null);
  const [trainingMode, setTrainingMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch AI personas
  const { data: personas, isLoading: personasLoading } = useQuery({
    queryKey: ['/api/ai/personas'],
  });

  // Fetch AI settings
  const { data: aiSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/ai/settings'],
  });

  // Get training mode setting
  useEffect(() => {
    if (aiSettings) {
      const trainingSetting = aiSettings.find((setting: any) => setting.key === 'training_mode');
      if (trainingSetting) {
        setTrainingMode(trainingSetting.value);
      }
    }
  }, [aiSettings]);

  // Get active persona conversation messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/ai/messages', activePersonaId],
    queryFn: async () => {
      if (!activePersonaId) return [];

      try {
        // In a real app, this would be an API call to get messages for the active persona
        // Mock data since the API endpoint isn't implemented as expected
        if (activePersonaId === 2) { // Professional Escort
          const now = Date.now();
          return [
            {
              id: "system-1",
              conversationId: 1,
              role: "system",
              content: "You are a professional escort providing information about premium experiences. Be informative, professional, and discrete.",
              timestamp: new Date(now - 1000 * 60 * 60).toISOString(),
            },
            {
              id: "user-1",
              conversationId: 1,
              role: "user",
              content: "Hello, I'm interested in booking the 1-hour Pornstar Girlfriend Experience. Can you tell me more about what it includes?",
              timestamp: new Date(now - 1000 * 60 * 10).toISOString(),
            },
            {
              id: "assistant-1",
              conversationId: 1,
              role: "assistant",
              content: "Hello there! Thank you for your interest in our 1-hour Pornstar Girlfriend Experience. This premium service is designed to provide you with an unforgettable and tailored experience in a professional and discreet environment.\n\nThe experience includes personalized attention and companionship for the full hour. The service is priced at AU$600.00 and can be booked at your preferred available time slot.\n\nWould you like me to help you check availability or answer any other questions you might have?",
              timestamp: new Date(now - 1000 * 60 * 9).toISOString(),
            },
            {
              id: "user-2",
              conversationId: 1,
              role: "user",
              content: "That sounds great. Is tomorrow afternoon available?",
              timestamp: new Date(now - 1000 * 60 * 5).toISOString(),
            },
            {
              id: "assistant-2",
              conversationId: 1,
              role: "assistant",
              content: "Let me check the availability for tomorrow afternoon. Looking at the calendar, I see several open slots between 1:00 PM and 6:00 PM. Would you prefer early afternoon or later in the day?\n\nOnce we confirm a time, I'll need your name and contact number to secure the booking.",
              timestamp: new Date(now - 1000 * 60 * 4).toISOString(),
            },
          ] as AIMessage[];
        }
        
        // Default empty conversation
        return [] as AIMessage[];
      } catch (error) {
        console.error("Error fetching AI messages:", error);
        toast({
          title: "Failed to load messages",
          description: "Could not retrieve messages for this AI persona.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!activePersonaId,
  });

  // Set initial active persona
  useEffect(() => {
    if (!activePersonaId && personas && personas.length > 0) {
      setActivePersonaId(personas[0].id);
    }
  }, [personas, activePersonaId]);

  // Handle persona selection
  const handlePersonaSelect = (persona: AIPersona) => {
    setActivePersonaId(persona.id);
  };

  // Handle training mode toggle
  const handleTrainingModeToggle = async (enabled: boolean) => {
    try {
      await apiRequest("PATCH", `/api/ai/settings/training_mode`, { value: enabled });
      setTrainingMode(enabled);
      
      toast({
        title: `Training mode ${enabled ? 'enabled' : 'disabled'}`,
        description: enabled 
          ? "AI system will now learn from interactions" 
          : "AI system will no longer learn from interactions"
      });
      
      // Invalidate AI settings query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/ai/settings'] });
    } catch (error) {
      console.error("Failed to toggle training mode:", error);
      toast({
        title: "Failed to update setting",
        description: "Could not toggle training mode. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle creating new persona
  const handleCreatePersona = () => {
    toast({
      title: "Create new persona",
      description: "This feature is not yet implemented.",
    });
  };

  // Handle AI settings click
  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  // Handle sending a message
  const handleSendMessage = (message: AIMessage) => {
    // In a real app, this would send the message to the AI and get a response
    // For now, we'll just add it to the messages array
    queryClient.invalidateQueries({ queryKey: ['/api/ai/messages', activePersonaId] });
  };

  // Get the current active persona
  const activePersona = personas?.find((p: AIPersona) => p.id === activePersonaId) || null;

  // Training control form
  const trainingForm = useForm({
    defaultValues: {
      maxTurns: 20,
      messageDelayMin: 1,
      messageDelayMax: 3,
    }
  });

  const handleTrainingControl = (operation: string) => {
    toast({
      title: `Training ${operation.toLowerCase()}`,
      description: `Training system has been ${operation.toLowerCase()}.`,
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-6">AI Chat</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Persona List */}
        {personasLoading ? (
          <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-1">
            <div className="border-b border-neutral-200 p-4">
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-10" />
              </div>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
              <Skeleton className="h-10 w-full mt-6" />
            </div>
          </div>
        ) : (
          <PersonaList
            personas={personas || []}
            activePersonaId={activePersonaId}
            trainingMode={trainingMode}
            onPersonaSelect={handlePersonaSelect}
            onTrainingModeToggle={handleTrainingModeToggle}
            onCreatePersona={handleCreatePersona}
          />
        )}
        
        {/* AI Chat Window */}
        {activePersona ? (
          <AIChatWindow
            persona={activePersona}
            messages={messages || []}
            onMessageSend={handleSendMessage}
            onSettingsClick={handleSettingsClick}
          />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-2 flex items-center justify-center">
            <p className="text-neutral-500">Select an AI persona to start chatting</p>
          </div>
        )}
      </div>
      
      {/* AI Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>AI System Settings</SheetTitle>
            <SheetDescription>
              Configure AI chat system and training parameters
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {/* AI Mode Toggle */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">AI Mode</h3>
                <p className="text-sm text-neutral-500">Enable or disable the AI chat system</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {
                toast({
                  title: "AI Mode cannot be disabled",
                  description: "AI system is required for this application."
                });
              }} />
            </div>
            
            {/* Training Mode Toggle */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-medium">Training Mode</h3>
                <p className="text-sm text-neutral-500">AI will learn from conversations when enabled</p>
              </div>
              <Switch checked={trainingMode} onCheckedChange={handleTrainingModeToggle} />
            </div>
            
            {/* Training Controls */}
            <div className="space-y-4">
              <h3 className="text-base font-medium border-b pb-2">Training Controls</h3>
              
              <Form {...trainingForm}>
                <form className="space-y-4">
                  <FormField
                    control={trainingForm.control}
                    name="maxTurns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Turns</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Maximum conversation turns for training
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={trainingForm.control}
                      name="messageDelayMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Delay (seconds)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={trainingForm.control}
                      name="messageDelayMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Delay (seconds)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      type="button" 
                      onClick={() => handleTrainingControl("START")}
                      className="flex items-center"
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Start
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handleTrainingControl("PAUSE")}
                      className="flex items-center"
                    >
                      <Pause className="mr-1 h-4 w-4" />
                      Pause
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handleTrainingControl("RESET")}
                      className="flex items-center"
                    >
                      <RotateCcw className="mr-1 h-4 w-4" />
                      Reset
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handleTrainingControl("START_OVER")}
                      className="flex items-center"
                    >
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Start Over
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
            
            {/* Active Personas */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium border-b pb-2">Active Training Personas</h3>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {!personasLoading && personas && personas.slice(0, 2).map((persona: AIPersona) => (
                  <div key={persona.id} className="flex items-center justify-between p-2 bg-neutral-100 rounded">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-${persona.iconColor}-500 bg-${persona.iconColor}-100 mr-2`}>
                        <i className={`fas fa-${persona.icon}`}></i>
                      </div>
                      <span className="text-sm">{persona.name}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-neutral-500">
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Advanced Settings Button */}
            <Button variant="outline" className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Advanced AI System Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AIChatPage;
