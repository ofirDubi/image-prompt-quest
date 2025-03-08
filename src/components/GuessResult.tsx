
import React, { useState, useEffect } from "react";
import { Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameMode, GuessResult as GuessResultType } from "@/services/gameService";
import GuessInput from "./GuessInput";

interface GuessResultProps {
  result: GuessResultType | null;
  guess: string;
  gameMode: GameMode;
  onTryAgain: () => void;
  onNextRound: () => void;
  onNewGuess: (guess: string) => void;
  isSubmitting: boolean;
}

const GuessResult: React.FC<GuessResultProps> = ({
  result,
  guess,
  gameMode,
  onTryAgain,
  onNextRound,
  onNewGuess,
  isSubmitting
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  
  const getScoreColor = () => {
    if (!result) return "text-gray-500";
    const accuracy = result.accuracy;
    if (accuracy >= 80) return "text-green-500";
    if (accuracy >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const renderColoredGuess = () => {
    if (!result || !result.exactMatches) {
      return <div className="text-slate-700">{guess}</div>;
    }

    const words = guess.split(" ");
    return (
      <div className="text-slate-700">
        {words.map((word, index) => {
          // Check if word is an exact match
          if (result.exactMatches.includes(word.toLowerCase())) {
            return <span key={index} className="bg-green-200 rounded px-1 mx-0.5">{word}</span>;
          } 
          // Check if word is a similar match
          else if (result.similarMatches && 
                   result.similarMatches.some(match => match[0].toLowerCase() === word.toLowerCase())) {
            return <span key={index} className="bg-yellow-200 rounded px-1 mx-0.5">{word}</span>;
          } 
          else {
            return <span key={index} className="mx-0.5">{word}</span>;
          }
        })}
      </div>
    );
  };

  const renderColoredPrompt = () => {
    if (!result || !result.originalPrompt) return null;
    
    const words = result.originalPrompt.split(" ");
    return (
      <div className="text-slate-700">
        {words.map((word, index) => {
          // Check if word is an exact match
          if (result.exactMatches.includes(word.toLowerCase())) {
            return <span key={index} className="bg-green-200 rounded px-1 mx-0.5">{word}</span>;
          } 
          // Check if word is a similar match
          else if (result.similarMatches && 
                   result.similarMatches.some(match => match[1].toLowerCase() === word.toLowerCase())) {
            return <span key={index} className="bg-yellow-200 rounded px-1 mx-0.5">{word}</span>;
          } 
          else {
            return <span key={index} className="mx-0.5">{word}</span>;
          }
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 bg-slate-50 p-4 rounded-md border">
        <div className="font-medium">Your guess:</div>
        {renderColoredGuess()}
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="inline-block bg-green-200 rounded px-1 mr-1">Green</span> = Exact match
          <span className="inline-block bg-yellow-200 rounded px-1 mx-1 ml-3">Yellow</span> = Similar match
        </div>
      </div>

      {result && (
        <>
          <div className="space-y-2 bg-slate-50 p-4 rounded-md border">
            <div className="font-medium">Original prompt:</div>
            {showPrompt ? (
              renderColoredPrompt()
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setShowPrompt(true)}
                className="w-full mt-2"
              >
                <Eye className="w-4 h-4 mr-2" /> Reveal Original Prompt and Try Another Image
              </Button>
            )}
          </div>

          <div className="text-center space-y-2 p-4">
            <div className="text-2xl font-bold">
              Your Score: <span className={getScoreColor()}>{result.score}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {result.accuracy.toFixed(1)}% accuracy compared to the original prompt
            </div>
            
            {gameMode === GameMode.PROGRESS && (
              <div className="mt-2 text-sm">
                {result.success 
                  ? <span className="text-green-500">Success! You can continue to the next image.</span>
                  : <span className="text-amber-500">You need at least 80% accuracy to progress. Try again!</span>
                }
              </div>
            )}
          </div>
        </>
      )}

      {!showPrompt && (
        <div className="mt-4">
          <GuessInput 
            onSubmitGuess={onNewGuess}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-2">
        {showPrompt && (
          <Button onClick={onNextRound} className="w-full">
            {gameMode === GameMode.CASUAL 
              ? "Next Round" 
              : gameMode === GameMode.DAILY 
                ? "Try Again" 
                : result?.success 
                  ? "Next Image" 
                  : "Try Again"
            } 
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default GuessResult;
