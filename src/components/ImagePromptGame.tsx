import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  Share2, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Link as LinkIcon,
  Loader
} from "lucide-react";
import { 
  fetchGameImage, 
  submitGuess, 
  GameImage, 
  GuessResult, 
  GameMode,
  fetchProgressLevels,
  ProgressLevelState,
  completeLevel,
  revealPrompt
} from "@/services/gameService";
import { useAuth } from "@/contexts/AuthContext";
import GameModeSelector from "./GameModeSelector";
import DailyCountdown from "./DailyCountdown";
import ProgressLevelSelector from "./ProgressLevelSelector";
import LevelCompleteDialog from "./LevelCompleteDialog";
import ImageDisplay from "./ImageDisplay";
import GuessInput from "./GuessInput";
import GuessResultComponent from "./GuessResult";

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

enum GameState {
  LOADING,
  GUESSING,
  RESULT,
  LEVEL_SELECTION,
}

const ImagePromptGame: React.FC = () => {
  const { user, updateUserScore } = useAuth();
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [currentImage, setCurrentImage] = useState<GameImage | null>(null);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<GuessResult | null>(null);
  const [roundCount, setRoundCount] = useState(1);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.CASUAL);
  const [hasSubmittedDaily, setHasSubmittedDaily] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showProgressLoginPrompt, setShowProgressLoginPrompt] = useState(false);
  
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

  const handleSubmitGuess = async (guessText: string) => {
    if (!currentImage || !guessText.trim()) {
      toast({
        title: "Empty Guess",
        description: "Input your guess before submitting",
        variant: "destructive",
      });
      return;
    }
    
    if (gameMode === GameMode.DAILY && !user) {
      setShowLoginPrompt(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const guessResult = await submitGuess(
        currentImage.id, 
        guessText, 
        user?.id || null,
        gameMode,
        gameMode === GameMode.PROGRESS ? currentLevel : undefined
      );
      setGuess(guessText);
      setResult(guessResult);
      setGameState(GameState.RESULT);
      
      if (user && updateUserScore && (gameMode === GameMode.CASUAL || gameMode === GameMode.DAILY)) {
        updateUserScore(gameMode, guessResult.score);
      }
      
      if (gameMode === GameMode.PROGRESS) {
        setCurrentGuessCount(prev => prev + 1);
        if (guessResult.success) {
          if (currentImage.imageNumber === currentImage.totalImagesInLevel) {
            const totalGuesses = guessesForLevel + currentGuessCount + 1;
            setGuessesForLevel(totalGuesses);
            setLevelComplete(true);
            await completeLevel(user?.id || null, currentLevel, totalGuesses);
            await loadProgressLevels();
          }
        }
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevealPrompt = async () => {
    if (!currentImage) return;
    
    try {
      await revealPrompt(currentImage.id, user?.id || null);
      setHasSubmittedDaily(true);
      
      toast({
        title: "Prompt Revealed",
        description: "Your score for today will not be updated with future guesses.",
      });
    } catch (error) {
      console.error("Failed to notify server about prompt reveal:", error);
    }
  };

  const handleTryAgain = () => {
    setGameState(GameState.GUESSING);
    setGuess("");
    setResult(null);
  };

  const handleNextRound = () => {
    if (gameMode === GameMode.CASUAL) {
      setRoundCount(prev => prev + 1);
      loadNewRound();
    } else if (gameMode === GameMode.DAILY) {
      setGameState(GameState.GUESSING);
      setGuess("");
    } else if (gameMode === GameMode.PROGRESS) {
      if (result?.success) {
        if (currentImage?.imageNumber === currentImage?.totalImagesInLevel) {
          setGameState(GameState.LEVEL_SELECTION);
        } else {
          setGuess("");
          loadNewRound(GameMode.PROGRESS, currentLevel);
        }
      } else {
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
      shareText = `Round ${roundCount}: I scored ${result.score} points (${result.accuracy.toFixed(1)}% accuracy) in Guess the Image Prompt!`;
    }
    
    const shareUrl = window.location.href;
    
    switch (method) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'instagram':
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
        if (!user) {
          setShowProgressLoginPrompt(true);
          setGameMode(GameMode.CASUAL);
          loadNewRound(GameMode.CASUAL);
        } else {
          loadProgressLevels().then(() => {
            setGameState(GameState.LEVEL_SELECTION);
          });
        }
      } else {
        loadNewRound(mode);
      }
    }
  };

  useEffect(() => {
    if (gameMode === GameMode.PROGRESS) {
      if (!user) {
        setShowProgressLoginPrompt(true);
        setGameMode(GameMode.CASUAL);
        loadNewRound(GameMode.CASUAL);
      } else {
        loadProgressLevels().then(() => {
          setGameState(GameState.LEVEL_SELECTION);
        });
      }
    } else {
      loadNewRound(gameMode);
    }
  }, []);

  const getGameModeDescription = () => {
    if (gameMode === GameMode.CASUAL) {
      return "Look at the AI-generated image and try to guess what prompt was used to create it. Play as many rounds as you want in casual mode!";
    } else if (gameMode === GameMode.DAILY) {
      return "Every day we provide a new, hand-picked challenging image with a longer prompt. You have one chance per day to submit your guess and climb the daily leaderboard!";
    } else {
      return "Progress through 10 levels with 10 images each. You need to score at least 80% on each image to progress. The fewer guesses you use, the higher your ranking!";
    }
  };

  const getCardTitle = () => {
    if (gameMode === GameMode.CASUAL) {
      return `Round ${roundCount}: Guess The Image Prompt`;
    } else if (gameMode === GameMode.DAILY) {
      return "Daily Challenge: Guess The Image Prompt";
    } else {
      if (user) {
        return `Level ${currentLevel}: Image ${currentImage?.imageNumber} of ${currentImage?.totalImagesInLevel}`;
      } else {
        return "Guess The Image Prompt";
      }
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
            {getCardTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentImage && (
            <div className="space-y-6">
              <ImageDisplay image={currentImage} />

              {hasSubmittedDaily && gameMode === GameMode.DAILY && gameState === GameState.GUESSING && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-800">
                  You've already submitted your guess for today's challenge.
                  You can still play, but your score won't be updated.
                </div>
              )}

              {gameState === GameState.GUESSING ? (
                <GuessInput 
                  onSubmitGuess={handleSubmitGuess}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <GuessResultComponent 
                  result={result}
                  guess={guess}
                  gameMode={gameMode}
                  onTryAgain={handleTryAgain}
                  onNextRound={handleNextRound}
                  onNewGuess={handleSubmitGuess}
                  isSubmitting={isSubmitting}
                  onRevealPrompt={handleRevealPrompt}
                />
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
          </CardFooter>
        )}
      </Card>

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

      <Dialog open={showProgressLoginPrompt} onOpenChange={setShowProgressLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to register or sign in before playing in Progress Mode.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowProgressLoginPrompt(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
