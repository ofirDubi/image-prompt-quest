
import { useState, useEffect, useCallback } from 'react';
import { fetchGameImage, submitGuess, GameImage, GuessResult } from '@/services/gameService';
import { toast } from '@/hooks/use-toast';

export enum GameState {
  LOADING,
  GUESSING,
  RESULT,
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [currentImage, setCurrentImage] = useState<GameImage | null>(null);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<GuessResult | null>(null);
  const [roundCount, setRoundCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadNewRound = useCallback(async () => {
    setGameState(GameState.LOADING);
    setGuess("");
    setResult(null);
    setIsLoading(true);
    
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmitGuess = useCallback(async () => {
    if (!currentImage || !guess.trim() || isLoading) return;
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, guess, isLoading]);

  const handleNextRound = useCallback(() => {
    setRoundCount(prev => prev + 1);
    loadNewRound();
  }, [loadNewRound]);

  // Load first round when component mounts
  useEffect(() => {
    loadNewRound();
  }, [loadNewRound]);

  return {
    gameState,
    currentImage,
    guess,
    setGuess,
    result,
    roundCount,
    isLoading,
    handleSubmitGuess,
    handleNextRound,
  };
}
