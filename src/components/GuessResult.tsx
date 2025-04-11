
import React, { useState, useEffect } from "react";
import { Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameMode, GuessResult as GuessResultType } from "@/services/gameService";
import GuessInput from "./GuessInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GuessResultProps {
  result: GuessResultType | null;
  guess: string;
  gameMode: GameMode;
  onTryAgain: () => void;
  onNextRound: () => void;
  onNewGuess: (guess: string) => void;
  isSubmitting: boolean;
  onRevealPrompt?: () => Promise<void>;
}

const GuessResult: React.FC<GuessResultProps> = ({
  result,
  guess,
  gameMode,
  onTryAgain,
  onNextRound,
  onNewGuess,
  isSubmitting,
  onRevealPrompt
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showRevealWarning, setShowRevealWarning] = useState(false);
  
  // For Progress mode, automatically show prompt if success
  useEffect(() => {
    if (gameMode === GameMode.PROGRESS && result?.success) {
      setShowPrompt(true);
    }
  }, [result, gameMode]);
  
  const getScoreColor = () => {
    if (!result) return "text-gray-500";
    const accuracy = result.accuracy;
    if (accuracy >= 80) return "text-green-500";
    if (accuracy >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const handleRevealPrompt = async () => {
    if (gameMode === GameMode.DAILY) {
      setShowRevealWarning(true);
    } else {
      setShowPrompt(true);
    }
  };

  const confirmRevealPrompt = async () => {
    setShowRevealWarning(false);
    
    if (onRevealPrompt) {
      await onRevealPrompt();
    }
    
    setShowPrompt(true);
  };

  const renderColoredGuess = () => {
    if (!result || !result.exactMatches) {
      return <div className="text-slate-700">{guess}</div>;
    }

    const words = guess.split(" ");
    return (
      <div className="text-slate-700 break-words">
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
      <div className="text-slate-700 break-words">
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
      {!showPrompt && (
        <div className="mt-4">
          <GuessInput 
            onSubmitGuess={onNewGuess}
            isSubmitting={isSubmitting}
            previousGuess={guess}
          />
        </div>
      )}

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
            ) : gameMode === GameMode.PROGRESS ? (
              <div className="text-sm text-muted-foreground mt-2">
                {result.success 
                  ? "Prompt revealed automatically upon 80%+ accuracy."
                  : "Get 80% or higher accuracy to reveal the prompt."}
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleRevealPrompt}
                className="w-full mt-2 flex-wrap whitespace-normal h-auto py-2"
              >
                <Eye className="w-4 h-4 mr-2 flex-shrink-0" /> 
                <span>Reveal Original Prompt and Try Another Image</span>
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

      <Dialog open={showRevealWarning} onOpenChange={setShowRevealWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warning</DialogTitle>
            <DialogDescription>
              After revealing the prompt, any further guesses will not be counted in your score for today's challenge.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowRevealWarning(false)}>
              Return without revealing
            </Button>
            <Button onClick={confirmRevealPrompt}>
              Reveal prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuessResult;
