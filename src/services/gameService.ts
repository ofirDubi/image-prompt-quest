
import { toast } from "@/hooks/use-toast";

// Types for our game data
export interface GameImage {
  id: string;
  imageUrl: string;
  prompt: string;
  promptLength: number;
}

export interface GuessResult {
  originalPrompt: string;
  similarity: number;
  score: number;
}

// Placeholder API URL - replace with your actual API endpoint
const API_URL = "http://localhost:3000/api";

// Fetch a new round image
export const fetchGameImage = async (): Promise<GameImage> => {
  try {
    const response = await fetch(`${API_URL}/images/random`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching game image:", error);
    toast({
      title: "Error",
      description: "Failed to load a new image. Please try again.",
      variant: "destructive",
    });
    
    // Return a placeholder while in development
    return {
      id: "placeholder",
      imageUrl: "/placeholder.svg",
      prompt: "a beautiful landscape with mountains and a lake",
      promptLength: 8,
    };
  }
};

// Submit a guess and get back results
export const submitGuess = async (imageId: string, guess: string): Promise<GuessResult> => {
  try {
    const response = await fetch(`${API_URL}/guess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageId,
        guess,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to submit guess");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error submitting guess:", error);
    toast({
      title: "Error",
      description: "Failed to submit your guess. Please try again.",
      variant: "destructive",
    });
    
    // Return a placeholder result while in development
    const mockSimilarity = Math.random() * 100;
    return {
      originalPrompt: "a beautiful landscape with mountains and a lake",
      similarity: mockSimilarity,
      score: Math.floor(mockSimilarity * 10),
    };
  }
};
