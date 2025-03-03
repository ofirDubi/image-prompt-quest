
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameMode } from "@/services/gameService";
import { CalendarIcon, Sparkles } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value={GameMode.CASUAL} className="flex flex-col sm:flex-row items-center justify-center p-3">
            <Sparkles className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
            <span>Casual Play</span>
          </TabsTrigger>
          <TabsTrigger value={GameMode.DAILY} className="flex flex-col sm:flex-row items-center justify-center p-3">
            <CalendarIcon className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
            <span>Daily Challenge</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default GameModeSelector;
