import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AIPersona } from "@/lib/types";
import { getPersonaIcon } from "@/lib/utils/ai";

interface PersonaListProps {
  personas: AIPersona[];
  activePersonaId: number | null;
  trainingMode: boolean;
  onPersonaSelect: (persona: AIPersona) => void;
  onTrainingModeToggle: (enabled: boolean) => void;
  onCreatePersona: () => void;
}

const PersonaList = ({
  personas,
  activePersonaId,
  trainingMode,
  onPersonaSelect,
  onTrainingModeToggle,
  onCreatePersona,
}: PersonaListProps) => {
  const handleTrainingModeChange = (checked: boolean) => {
    onTrainingModeToggle(checked);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-1 flex flex-col h-full">
      <div className="border-b border-neutral-200 p-4">
        <h2 className="font-medium text-neutral-800">AI Personas</h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-neutral-600">Training Mode:</span>
          <Switch
            checked={trainingMode}
            onCheckedChange={handleTrainingModeChange}
          />
        </div>

        <div className="space-y-3">
          {personas.length === 0 ? (
            <div className="text-center text-neutral-500 py-4">
              No personas available
            </div>
          ) : (
            personas.map((persona) => (
              <div
                key={persona.id}
                className={`border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 cursor-pointer ${
                  activePersonaId === persona.id ? "bg-neutral-100" : ""
                }`}
                onClick={() => onPersonaSelect(persona)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-${persona.iconColor}-100 text-${persona.iconColor}-500`}
                  >
                    <i className={`fas ${getPersonaIcon(persona.icon)}`}></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800">
                      {persona.name}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {persona.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6">
          <Button
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center"
            onClick={onCreatePersona}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New Persona
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonaList;
