
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  Share2, 
  ArrowRight, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Link as LinkIcon
} from "lucide-react";
import { 
  fetchGameImage, 
  submitGuess, 
  GameImage, 
  GuessResult, 
  GameMode 
} from "@/services/gameService";
import { useAuth } from "@/contexts/AuthContext";
import GameModeSelector from "./GameModeSelector";
import DailyCountdown from "./DailyCountdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

enum GameState {
  LOADING,
  GUESSING,
  RESULT,
}

const ImagePromptGame: React.FC = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [currentImage, setCurrentImage] = useState<GameImage | null>(null);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<GuessResult | null>(null);
  const [roundCount, setRoundCount] = useState(1);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.CASUAL);
  const [hasSubmittedDaily, setHasSubmittedDaily] = useState(false);

  const loadNewRound = async (mode: GameMode = gameMode) => {
    setGameState(GameState.LOADING);
    setGuess("");
    setResult(null);
    
    try {
      const image = await fetchGameImage(mode);
      setCurrentImage(image);
      setGameState(GameState.GUESSING);
      
      if (mode === GameMode.DAILY && image.hasSubmittedToday) {
        setHasSubmittedDaily(true);
      } else {
        setHasSubmittedDaily(false);
      }
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
      const guessResult = await submitGuess(
        currentImage.id, 
        guess, 
        user?.id || null,
        gameMode
      );
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
    if (gameMode === GameMode.CASUAL) {
      setRoundCount(prev => prev + 1);
      loadNewRound();
    } else {
      // For daily mode, stay on the same image but allow them to play another round
      setGameState(GameState.GUESSING);
      setGuess("");
    }
  };

  const handleShareResult = (method: 'facebook' | 'instagram' | 'whatsapp' | 'link') => {
    if (!result) return;
    
    const shareText = `Round ${roundCount}: I scored ${result.score} points (${result.similarity.toFixed(1)}% similarity) in Guess the Image Prompt!`;
    const shareUrl = window.location.href;
    
    switch (method) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'instagram':
        // Instagram doesn't have a direct share URL, so we copy to clipboard
        navigator.clipboard.writeText(shareText + " " + shareUrl);
        toast({
          title: "Copied to clipboard",
          description: "Open Instagram and paste to share!",
        });
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, '_blank');
        break;
      case 'link':
        navigator.clipboard.writeText(shareText + " " + shareUrl);
        toast({
          title: "Copied to clipboard",
          description: "Share link copied to clipboard!",
        });
        break;
    }
  };

  const handleModeChange = (mode: GameMode) => {
    if (mode !== gameMode) {
      setGameMode(mode);
      loadNewRound(mode);
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
    <div className="space-y-6">
      <GameModeSelector activeMode={gameMode} onModeChange={handleModeChange} />
      
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">
            {gameMode === GameMode.CASUAL 
              ? `Round ${roundCount}: Guess The Image Prompt` 
              : "Daily Challenge: Guess The Image Prompt"}
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

              <div className="text-center text-base text-muted-foreground">
                This image was generated with a prompt that is {currentImage.promptLength} words long.
              </div>

              {hasSubmittedDaily && gameMode === GameMode.DAILY && gameState === GameState.GUESSING && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-800">
                  You've already submitted your guess for today's challenge.
                  You can still play, but your score won't be updated.
                </div>
              )}

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

                  {gameMode === GameMode.DAILY && (
                    <DailyCountdown />
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        {gameState === GameState.RESULT && (
          <CardFooter className="flex justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" /> Share Result
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleShareResult('facebook')}>
                  <Facebook className="w-4 h-4 mr-2" /> Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShareResult('instagram')}>
                  <Instagram className="w-4 h-4 mr-2" /> Instagram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShareResult('whatsapp')}>
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShareResult('link')}>
                  <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleNextRound}>
              {gameMode === GameMode.CASUAL ? "Next Round" : "Try Again"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ImagePromptGame;
