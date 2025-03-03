
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressLevelState } from "@/services/gameService";
import { Lock } from "lucide-react";

interface ProgressLevelSelectorProps {
  levels: ProgressLevelState[];
  onSelectLevel: (level: number) => void;
  currentLevel: number;
}

const ProgressLevelSelector: React.FC<ProgressLevelSelectorProps> = ({ 
  levels, 
  onSelectLevel, 
  currentLevel 
}) => {
  return (
    <div className="w-full">
      <h2 className="text-lg font-medium mb-4">Select a Level</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {levels.map((level) => (
          <Card 
            key={level.level} 
            className={`cursor-pointer transition-all ${
              level.unlocked 
                ? "hover:shadow-md" 
                : "opacity-50 cursor-not-allowed"
            } ${
              currentLevel === level.level 
                ? "bg-primary/10 border-primary" 
                : ""
            }`}
            onClick={() => level.unlocked && onSelectLevel(level.level)}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="text-lg font-bold text-primary">
                Level {level.level}
              </div>
              
              {level.unlocked ? (
                <div className="mt-2 text-sm">
                  {level.completed}/{level.total} Complete
                </div>
              ) : (
                <Lock className="w-5 h-5 mt-2 text-muted-foreground" />
              )}
              
              {level.guesses > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {level.guesses} guesses
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProgressLevelSelector;
