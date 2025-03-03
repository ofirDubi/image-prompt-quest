
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
  Link as LinkIcon,
  Loader,
  HelpCircle
} from "lucide-react";
import { 
  fetchGameImage, 
  submitGuess, 
  GameImage, 
  GuessResult, 
  GameMode,
  fetchProgressLevels,
  ProgressLevelState,
  completeLevel 
} from "@/services/gameService";
import { useAuth } from "@/contexts/AuthContext";
import GameModeSelector from "./GameModeSelector";
import DailyCountdown from "./DailyCountdown";
import ProgressLevelSelector from "./ProgressLevelSelector";
import LevelCompleteDialog from "./LevelCompleteDialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

enum GameState {
  LOADING,
  GUESSING,
  RESULT,
  LEVEL_SELECTION, // New state for progress mode
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Progress mode states
  const [progressLevels, setProgressLevels] = useState<ProgressLevelState[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentGuessCount, setCurrentGuessCount] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [guessesForLevel, setGuessesForLevel] = useState(0);

  const loadNewRound = async (mode: GameMode = gameMode, level?: number) => {
    setGameState(GameState.LOADING);
    setGuess("");
    setResult(null);
    
    try {
      const image = await fetchGameImage(mode, level);
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

  const loadProgressLevels = async () => {
    try {
      const levels = await fetchProgressLevels(user?.id || null);
      setProgressLevels(levels);
      
      // Find the first level with incomplete images or the highest unlocked level
      const nextLevel = levels.find(level => level.unlocked && level.completed < level.total)?.level || 
                        levels.filter(level => level.unlocked).pop()?.level || 1;
                        
      setCurrentLevel(nextLevel);
    } catch (error) {
      console.error("Failed to load progress levels:", error);
      toast({
        title: "Error",
        description: "Failed to load progress data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitGuess = async () => {
    if (!currentImage || !guess.trim()) {
      toast({
        title: "Empty Guess",
        description: "Input your guess before submitting",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user is guest and trying to submit to daily challenge
    if (gameMode === GameMode.DAILY && !user) {
      setShowLoginPrompt(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const guessResult = await submitGuess(
        currentImage.id, 
        guess, 
        user?.id || null,
        gameMode,
        gameMode === GameMode.PROGRESS ? currentLevel : undefined
      );
      setResult(guessResult);
      setGameState(GameState.RESULT);
      
      // For progress mode, increment guess count
      if (gameMode === GameMode.PROGRESS) {
        setCurrentGuessCount(prev => prev + 1);
        if (guessResult.success) {
          // Check if this completes the level
          if (currentImage.imageNumber === currentImage.totalImagesInLevel) {
            const totalGuesses = guessesForLevel + currentGuessCount + 1;
            setGuessesForLevel(totalGuesses);
            setLevelComplete(true);
            // Update user's level completion state
            await completeLevel(user?.id || null, currentLevel, totalGuesses);
            // Refresh levels data
            await loadProgressLevels();
          }
        }
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
      // Error handling is already in submitGuess function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextRound = () => {
    if (gameMode === GameMode.CASUAL) {
      setRoundCount(prev => prev + 1);
      loadNewRound();
    } else if (gameMode === GameMode.DAILY) {
      // For daily mode, stay on the same image but allow them to play another round
      setGameState(GameState.GUESSING);
      setGuess("");
    } else if (gameMode === GameMode.PROGRESS) {
      // For progress mode, load the next image in the level if available
      if (result?.success) {
        if (currentImage?.imageNumber === currentImage?.totalImagesInLevel) {
          // Level completed
          setGameState(GameState.LEVEL_SELECTION);
        } else {
          // Next image in current level
          setGuess("");
          loadNewRound(GameMode.PROGRESS, currentLevel);
        }
      } else {
        // If guess was not successful, allow retrying
        setGameState(GameState.GUESSING);
        setGuess("");
      }
    }
  };

  const handleSelectLevel = (level: number) => {
    setCurrentLevel(level);
    setCurrentGuessCount(0);
    setGuessesForLevel(0);
    loadNewRound(GameMode.PROGRESS, level);
  };

  const handleShareResult = (method: 'facebook' | 'instagram' | 'whatsapp' | 'link') => {
    if (!result) return;
    
    let shareText = '';
    
    if (gameMode === GameMode.PROGRESS && levelComplete) {
      shareText = `I completed Level ${currentLevel} with ${guessesForLevel} guesses in "Guess the Image Prompt" game!`;
    } else {
      shareText = `Round ${roundCount}: I scored ${result.score} points (${result.similarity.toFixed(1)}% similarity) in Guess the Image Prompt!`;
    }
    
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
      
      if (mode === GameMode.PROGRESS) {
        loadProgressLevels().then(() => {
          setGameState(GameState.LEVEL_SELECTION);
        });
      } else {
        loadNewRound(mode);
      }
    }
  };

  const getPromptLengthColor = (length: number) => {
    if (length <= 4) return "text-green-500";
    if (length <= 8) return "text-yellow-500";
    return "text-red-500";
  };

  // Render colored guess with exact and similar matches
  const renderColoredGuess = () => {
    if (!result || !result.exactMatches || !result.similarMatches) {
      return <div className="text-slate-700">{guess}</div>;
    }

    const words = guess.split(" ");
    return (
      <div className="text-slate-700">
        {words.map((word, index) => {
          if (result.exactMatches.includes(word.toLowerCase())) {
            return <span key={index} className="bg-green-200 rounded px-1 mx-0.5">{word}</span>;
          } else if (result.similarMatches.includes(word.toLowerCase())) {
            return <span key={index} className="bg-yellow-200 rounded px-1 mx-0.5">{word}</span>;
          } else {
            return <span key={index} className="mx-0.5">{word}</span>;
          }
        })}
      </div>
    );
  };

  // Load first round when component mounts
  useEffect(() => {
    if (gameMode === GameMode.PROGRESS) {
      loadProgressLevels().then(() => {
        setGameState(GameState.LEVEL_SELECTION);
      });
    } else {
      loadNewRound(gameMode);
    }
  }, []);

  const getScoreColor = () => {
    if (!result) return "text-gray-500";
    const similarity = result.similarity;
    if (similarity >= 80) return "text-green-500";
    if (similarity >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getGameModeDescription = () => {
    if (gameMode === GameMode.CASUAL) {
      return "Look at the AI-generated image and try to guess what prompt was used to create it. Play as many rounds as you want in casual mode!";
    } else if (gameMode === GameMode.DAILY) {
      return "Every day we provide a new, hand-picked challenging image with a longer prompt. You have one chance per day to submit your guess and climb the daily leaderboard!";
    } else {
      return "Progress through 10 levels with 10 images each. You need to score at least 80% on each image to progress. The fewer guesses you use, the higher your ranking!";
    }
  };

  if (gameState === GameState.LOADING) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-xl font-medium">Loading next round...</div>
      </div>
    );
  }

  if (gameMode === GameMode.PROGRESS && gameState === GameState.LEVEL_SELECTION) {
    return (
      <div className="space-y-6">
        <GameModeSelector activeMode={gameMode} onModeChange={handleModeChange} />
        
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-base text-amber-800">
            <p className="font-medium">How to play:</p>
            <p>{getGameModeDescription()}</p>
          </div>
        </div>
        
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Progress Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressLevelSelector 
              levels={progressLevels} 
              onSelectLevel={handleSelectLevel}
              currentLevel={currentLevel}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GameModeSelector activeMode={gameMode} onModeChange={handleModeChange} />
      
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="text-base text-amber-800">
          <p className="font-medium">How to play:</p>
          <p>{getGameModeDescription()}</p>
        </div>
      </div>
      
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">
            {gameMode === GameMode.CASUAL 
              ? `Round ${roundCount}: Guess The Image Prompt` 
              : gameMode === GameMode.DAILY
                ? "Daily Challenge: Guess The Image Prompt"
                : `Level ${currentLevel}: Image ${currentImage?.imageNumber} of ${currentImage?.totalImagesInLevel}`
            }
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

              <div className="text-center text-base text-slate-700 flex justify-center items-center">
                This image was generated with a prompt that is{" "}
                <span className={`font-bold mx-1 ${getPromptLengthColor(currentImage.promptLength)}`}>
                  {currentImage.promptLength}
                </span>{" "}
                words long.
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-slate-400 ml-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        The prompt length indicates how many words were used to create this image. 
                        Shorter prompts (green) are generally easier to guess, while longer prompts (red) 
                        are more difficult.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                    <Button onClick={handleSubmitGuess} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2 bg-slate-50 p-4 rounded-md border">
                    <div className="font-medium">Your guess:</div>
                    {renderColoredGuess()}
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="inline-block bg-green-200 rounded px-1 mr-1">Green</span> = Exact match
                      <span className="inline-block bg-yellow-200 rounded px-1 mx-1 ml-3">Yellow</span> = Similar match
                    </div>
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
                    
                    {gameMode === GameMode.PROGRESS && (
                      <div className="mt-2 text-sm">
                        {result?.success 
                          ? <span className="text-green-500">Success! You can continue to the next image.</span>
                          : <span className="text-amber-500">You need at least 80% similarity to progress. Try again!</span>
                        }
                      </div>
                    )}
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
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
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
          </CardFooter>
        )}
      </Card>

      {/* Login prompt dialog for guests trying to submit to daily challenge */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to be signed in to submit guesses for the Daily Challenge.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowLoginPrompt(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Level completion dialog */}
      <LevelCompleteDialog
        open={levelComplete}
        onOpenChange={setLevelComplete}
        level={currentLevel}
        guesses={guessesForLevel}
        onNextLevel={() => {
          setLevelComplete(false);
          setGameState(GameState.LEVEL_SELECTION);
        }}
        onShare={handleShareResult}
      />
    </div>
  );
};

export default ImagePromptGame;
