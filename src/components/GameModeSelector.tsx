
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameMode } from "@/services/gameService";
import { CalendarIcon, Layers, Sparkles } from "lucide-react";

interface GameModeSelectorProps {
  activeMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ activeMode, onModeChange }) => {
  return (
    <div className="w-full flex justify-center mb-6">
      <Tabs 
        defaultValue={activeMode} 
        value={activeMode}
        onValueChange={(value) => onModeChange(value as GameMode)}
        className="w-full max-w-md"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value={GameMode.CASUAL} 
            className="flex flex-col sm:flex-row items-center justify-center p-2 transition-colors hover:bg-primary/10"
          >
            <Sparkles className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="text-xs sm:text-sm">Casual</span>
          </TabsTrigger>
          <TabsTrigger 
            value={GameMode.DAILY} 
            className="flex flex-col sm:flex-row items-center justify-center p-2 transition-colors hover:bg-primary/10"
          >
            <CalendarIcon className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="text-xs sm:text-sm">Daily</span>
          </TabsTrigger>
          <TabsTrigger 
            value={GameMode.PROGRESS} 
            className="flex flex-col sm:flex-row items-center justify-center p-2 transition-colors hover:bg-primary/10"
          >
            <Layers className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
            <span className="text-xs sm:text-sm">Progress</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default GameModeSelector;
