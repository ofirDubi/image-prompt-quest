
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Share2, ArrowRight } from "lucide-react";
import { fetchGameImage, submitGuess, GameImage, GuessResult } from "@/services/gameService";

enum GameState {
  LOADING,
  GUESSING,
  RESULT,
}

const ImagePromptGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [currentImage, setCurrentImage] = useState<GameImage | null>(null);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<GuessResult | null>(null);
  const [roundCount, setRoundCount] = useState(1);

  const loadNewRound = async () => {
    setGameState(GameState.LOADING);
    setGuess("");
    setResult(null);
    
    try {
      const image = await fetchGameImage();
      setCurrentImage(image);
      setGameState(GameState.GUESSING);
    } catch (error) {
      console.error("Failed to load new round:", error);
      toast({
        title: "Error",
        description: "Failed to load a new round. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitGuess = async () => {
    if (!currentImage || !guess.trim()) return;
    
    try {
      const guessResult = await submitGuess(currentImage.id, guess);
      setResult(guessResult);
      setGameState(GameState.RESULT);
    } catch (error) {
      console.error("Failed to submit guess:", error);
      toast({
        title: "Error",
        description: "Failed to submit your guess. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNextRound = () => {
    setRoundCount(prev => prev + 1);
    loadNewRound();
  };

  const handleShareResult = () => {
    if (!result) return;
    
    const shareText = `Round ${roundCount}: I scored ${result.score} points (${result.similarity.toFixed(1)}% similarity) in Guess the Image Prompt!`;
    
    if (navigator.share) {
      navigator.share({
        title: "My Guess the Image Prompt result",
        text: shareText,
        url: window.location.href,
      }).catch(err => {
        console.error("Share failed:", err);
        // Fallback
        navigator.clipboard.writeText(shareText + " " + window.location.href);
        toast({
          title: "Copied to clipboard",
          description: "Share link copied to clipboard!",
        });
      });
    } else {
      // Fallback for browsers without navigator.share
      navigator.clipboard.writeText(shareText + " " + window.location.href);
      toast({
        title: "Copied to clipboard",
        description: "Share link copied to clipboard!",
      });
    }
  };

  // Load first round when component mounts
  useEffect(() => {
    loadNewRound();
  }, []);

  const getScoreColor = () => {
    if (!result) return "text-gray-500";
    const similarity = result.similarity;
    if (similarity >= 80) return "text-green-500";
    if (similarity >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  if (gameState === GameState.LOADING) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-xl font-medium">Loading next round...</div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">
          Round {roundCount}: Guess The Image Prompt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentImage && (
          <div className="space-y-6">
            <div className="aspect-square relative bg-slate-100 rounded-md overflow-hidden">
              <img 
                src={currentImage.imageUrl} 
                alt="AI generated image"
                className="w-full h-full object-cover transition-opacity duration-300"
                loading="eager"
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              This image was generated with a prompt that is {currentImage.promptLength} words long.
            </div>

            {gameState === GameState.GUESSING ? (
              <div className="space-y-2">
                <div className="font-medium">What prompt do you think generated this image?</div>
                <div className="flex space-x-2">
                  <Input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Enter your guess here..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmitGuess();
                    }}
                  />
                  <Button onClick={handleSubmitGuess}>Submit</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 bg-slate-50 p-4 rounded-md border">
                  <div className="font-medium">Your guess:</div>
                  <div className="text-slate-700">{guess}</div>
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded-md border">
                  <div className="font-medium">Original prompt:</div>
                  <div className="text-slate-700">{result?.originalPrompt}</div>
                </div>

                <div className="text-center space-y-2 p-4">
                  <div className="text-2xl font-bold">
                    Your Score: <span className={getScoreColor()}>{result?.score}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result?.similarity.toFixed(1)}% similarity to the original prompt
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {gameState === GameState.RESULT && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleShareResult}>
            <Share2 className="w-4 h-4 mr-2" /> Share Result
          </Button>
          <Button onClick={handleNextRound}>
            Next Round <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ImagePromptGame;
