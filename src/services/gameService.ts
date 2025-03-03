
import { toast } from "@/hooks/use-toast";

/**
 * API Documentation
 * This file contains types and functions for interacting with the backend API
 */

// Types for our game data
export interface GameImage {
  id: string;
  imageUrl: string;
  promptLength: number;
  hasSubmittedToday?: boolean; // For daily challenge mode
}

export interface GuessResult {
  originalPrompt: string;
  similarity: number;
  score: number;
  exactMatches: string[]; // Words that exactly match the prompt
  similarMatches: string[]; // Words that are similar but not exact matches
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

/**
 * API: GET /api/images/random or /api/images/daily
 * 
 * Request:
 * - No body required for GET request
 * 
 * Response:
 * {
 *   id: string,          // Unique identifier for the image
 *   imageUrl: string,    // URL to the image
 *   promptLength: number, // Length of the prompt in words
 *   hasSubmittedToday?: boolean // Only for daily mode - whether user has submitted today
 * }
 */
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

/**
 * API: POST /api/guess
 * 
 * Request:
 * {
 *   imageId: string,     // ID of the image being guessed
 *   guess: string,       // The user's guess text
 *   userId: string|null, // User ID if logged in, null if guest
 *   mode: string         // Game mode (casual or daily)
 * }
 * 
 * Response:
 * {
 *   originalPrompt: string,    // The actual prompt used to generate the image
 *   similarity: number,        // Percentage of similarity (0-100)
 *   score: number,             // Points awarded for the guess
 *   exactMatches: string[],    // Array of words that exactly match the prompt
 *   similarMatches: string[]   // Array of words that are similar but not exact matches
 * }
 */
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
    const words = guess.toLowerCase().split(" ");
    
    // Mock exact and similar matches for development
    const exactMatches = words.filter((_, i) => i % 3 === 0); // Every third word
    const similarMatches = words.filter((_, i) => i % 3 === 1); // Every third word starting from second
    
    return {
      originalPrompt: "a beautiful landscape with mountains and a lake",
      similarity: mockSimilarity,
      score: Math.floor(mockSimilarity * 10),
      exactMatches,
      similarMatches,
    };
  }
};

/**
 * API: POST /api/auth/login
 * 
 * Request:
 * {
 *   username: string,    // User's username
 *   password: string,    // User's password hash
 * }
 * 
 * Response:
 * {
 *   id: string,          // User ID
 *   username: string,    // Username
 *   casualScore: number, // Score in casual mode
 *   dailyScore: number   // Score in daily challenge mode
 * }
 */
export const loginUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password, // This is now a hashed password
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

/**
 * API: POST /api/auth/register
 * 
 * Request:
 * {
 *   username: string,    // Desired username
 *   password: string,    // Password hash
 * }
 * 
 * Response:
 * {
 *   id: string,          // User ID
 *   username: string,    // Username
 *   casualScore: number, // Initial score in casual mode (0)
 *   dailyScore: number   // Initial score in daily challenge mode (0)
 * }
 */
export const registerUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password, // This is now a hashed password
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

/**
 * API: GET /api/leaderboard/{mode}
 * 
 * Request:
 * - No body required for GET request
 * - mode in URL path (casual or daily)
 * 
 * Response:
 * Array of:
 * {
 *   rank: number,        // Position in leaderboard
 *   username: string,    // User's username
 *   score: number        // User's score in the specified mode
 * }
 */
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
