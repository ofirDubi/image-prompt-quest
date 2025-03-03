
import { toast } from "@/hooks/use-toast";

// Types for our game data
export interface GameImage {
  id: string;
  imageUrl: string;
  prompt?: string; // Optional now as it won't always be returned
  promptLength: number;
  hasSubmittedToday?: boolean; // For daily challenge mode
}

export interface GuessResult {
  originalPrompt: string;
  similarity: number;
  score: number;
}

export interface User {
  id: string;
  username: string;
  casualScore: number;
  dailyScore: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

// Game modes
export enum GameMode {
  CASUAL = "casual",
  DAILY = "daily",
}

// Placeholder API URL - replace with your actual API endpoint
const API_URL = "http://localhost:3000/api";

// Fetch a new round image
export const fetchGameImage = async (mode: GameMode = GameMode.CASUAL): Promise<GameImage> => {
  try {
    const response = await fetch(`${API_URL}/images/${mode === GameMode.DAILY ? 'daily' : 'random'}`);
    
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
      promptLength: 8,
      hasSubmittedToday: mode === GameMode.DAILY ? false : undefined,
    };
  }
};

// Submit a guess and get back results
export const submitGuess = async (
  imageId: string, 
  guess: string, 
  userId: string | null = null,
  mode: GameMode = GameMode.CASUAL
): Promise<GuessResult> => {
  try {
    const response = await fetch(`${API_URL}/guess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageId,
        guess,
        userId,
        mode,
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

// User authentication
export const loginUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Login failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error logging in:", error);
    toast({
      title: "Login Failed",
      description: "Invalid username or password.",
      variant: "destructive",
    });
    return null;
  }
};

export const registerUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Registration failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error registering:", error);
    toast({
      title: "Registration Failed",
      description: "Username may already be taken.",
      variant: "destructive",
    });
    return null;
  }
};

// Fetch leaderboard data
export const fetchLeaderboard = async (mode: GameMode): Promise<LeaderboardEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/leaderboard/${mode}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    toast({
      title: "Error",
      description: "Failed to load leaderboard data.",
      variant: "destructive",
    });
    
    // Return placeholder data while in development
    return Array.from({ length: 20 }, (_, i) => ({
      rank: i + 1,
      username: `Player${i + 1}`,
      score: 1000 - i * 50,
    }));
  }
};

