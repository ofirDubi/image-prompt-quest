
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
  level?: number; // For progress mode
  imageNumber?: number; // For progress mode
  totalImagesInLevel?: number; // For progress mode
}

export interface GuessResult {
  originalPrompt: string;
  similarity: number;
  score: number;
  exactMatches: string[]; // Words that exactly match the prompt
  similarMatches: string[]; // Words that are similar but not exact matches
  success?: boolean; // For progress mode - true if score >= 80%
}

export interface User {
  id: string;
  username: string;
  casualScore: number;
  dailyScore: number;
  progressLevels?: ProgressLevelState[];
  token?: string; // Added for new authentication method
}

export interface ProgressLevelState {
  level: number;
  completed: number; // Number of completed images in level
  total: number; // Total images in level
  guesses: number; // Number of guesses used
  unlocked: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  avgGuesses?: number; // For progress mode
}

// Game modes
export enum GameMode {
  CASUAL = "casual",
  DAILY = "daily",
  PROGRESS = "progress",
}

// Placeholder API URL - replace with your actual API endpoint
const API_URL = "http://localhost:3000/api";

// Shorter timeout for development mode
const FETCH_TIMEOUT = 5000; // 5 seconds in development mode

/**
 * Helper function to add timeout to fetch
 */
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  
  clearTimeout(id);
  return response;
};

/**
 * API: GET /api/images/random or /api/images/daily or /api/images/progress/:level
 * 
 * Request:
 * - No body required for GET request
 * - For progress mode, level is provided in URL path
 * - Authorization header with user token if logged in
 * 
 * Response:
 * {
 *   id: string,          // Unique identifier for the image
 *   imageUrl: string,    // URL to the image
 *   promptLength: number, // Length of the prompt in words
 *   hasSubmittedToday?: boolean // Only for daily mode - whether user has submitted today
 *   level?: number,      // Only for progress mode - current level
 *   imageNumber?: number, // Only for progress mode - image number in level
 *   totalImagesInLevel?: number // Only for progress mode - total images in level
 * }
 */
export const fetchGameImage = async (mode: GameMode = GameMode.CASUAL, level?: number): Promise<GameImage> => {
  try {
    let url = `${API_URL}/images/`;
    
    if (mode === GameMode.DAILY) {
      url += 'daily';
    } else if (mode === GameMode.PROGRESS && level) {
      url += `progress/${level}`;
    } else {
      url += 'random';
    }
    
    // Get user token from localStorage
    const userToken = localStorage.getItem("token");
    const headers: HeadersInit = {};
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
    
    const response = await fetchWithTimeout(url, { headers });
    
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
      level: mode === GameMode.PROGRESS ? level || 1 : undefined,
      imageNumber: mode === GameMode.PROGRESS ? 1 : undefined,
      totalImagesInLevel: mode === GameMode.PROGRESS ? 10 : undefined,
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
 *   mode: string         // Game mode (casual, daily, or progress)
 *   level?: number       // Level number (only for progress mode)
 * }
 * Authorization: Bearer token (if logged in)
 * 
 * Response:
 * {
 *   originalPrompt: string,    // The actual prompt used to generate the image
 *   similarity: number,        // Percentage of similarity (0-100)
 *   score: number,             // Points awarded for the guess
 *   exactMatches: string[],    // Array of words that exactly match the prompt
 *   similarMatches: string[]   // Array of words that are similar but not exact matches
 *   success?: boolean          // Only for progress mode - true if score >= 80%
 * }
 */
export const submitGuess = async (
  imageId: string, 
  guess: string, 
  userId: string | null = null,
  mode: GameMode = GameMode.CASUAL,
  level?: number
): Promise<GuessResult> => {
  try {
    if (!guess.trim()) {
      toast({
        title: "Empty Guess",
        description: "Input your guess before submitting",
        variant: "destructive",
      });
      throw new Error("Empty guess");
    }
    
    // Development mode - special case for "fail" guess
    if (guess.toLowerCase().trim() === "fail") {
      return {
        originalPrompt: "This is a placeholder prompt for the 'fail' guess",
        similarity: 0,
        score: 0,
        exactMatches: [],
        similarMatches: [],
        success: false
      };
    }
    
    // Get user token from localStorage
    const userToken = localStorage.getItem("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };
    
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
    
    const response = await fetchWithTimeout(`${API_URL}/guess`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        imageId,
        guess,
        userId, // Keep for backward compatibility
        mode,
        level,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to submit guess");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error submitting guess:", error);
    
    if ((error as Error).message === "Empty guess") {
      throw error; // Rethrow empty guess error
    }
    
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
      success: mockSimilarity >= 80, // For progress mode
    };
  }
};

/**
 * API: GET /api/progress/levels
 * 
 * Request:
 * - Authorization header with user token
 * 
 * Response:
 * Array of:
 * {
 *   level: number,       // Level number
 *   completed: number,   // Number of completed images in level
 *   total: number,       // Total number of images in level
 *   guesses: number,     // Number of guesses used
 *   unlocked: boolean    // Whether level is unlocked
 * }
 */
export const fetchProgressLevels = async (userId: string | null): Promise<ProgressLevelState[]> => {
  try {
    // Get user token from localStorage
    const userToken = localStorage.getItem("token");
    const headers: HeadersInit = {};
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
    
    const response = await fetchWithTimeout(`${API_URL}/progress/levels`, { headers });
    
    if (!response.ok) {
      throw new Error("Failed to fetch progress levels");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching progress levels:", error);
    toast({
      title: "Error",
      description: "Failed to load progress data. Please try again.",
      variant: "destructive",
    });
    
    // Return placeholder data for development
    return Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      completed: i === 0 ? 3 : i < 3 ? 0 : 0,
      total: 10,
      guesses: i === 0 ? 15 : 0,
      unlocked: i < 3, // First 3 levels unlocked for testing
    }));
  }
};

/**
 * API: POST /api/progress/complete
 * 
 * Request:
 * {
 *   level: number,       // Completed level
 *   guesses: number      // Total guesses used
 * }
 * Authorization: Bearer token
 * 
 * Response:
 * {
 *   success: boolean,    // Whether update was successful
 *   nextLevel: number,   // Next level number
 *   unlocked: boolean    // Whether next level was unlocked
 * }
 */
export const completeLevel = async (
  userId: string | null,
  level: number,
  guesses: number
): Promise<{success: boolean, nextLevel: number, unlocked: boolean}> => {
  try {
    // Get user token from localStorage
    const userToken = localStorage.getItem("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    };
    
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
    
    const response = await fetchWithTimeout(`${API_URL}/progress/complete`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        level,
        guesses,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update progress");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating progress:", error);
    toast({
      title: "Error",
      description: "Failed to update your progress. Please try again.",
      variant: "destructive",
    });
    
    // Return placeholder result
    return {
      success: true,
      nextLevel: level + 1,
      unlocked: level < 10,
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
 *   dailyScore: number,  // Score in daily challenge mode
 *   token: string,       // Authentication token
 *   progressLevels: ProgressLevelState[] // Progress mode levels state
 * }
 */
export const loginUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password, // This is a hashed password
      }),
    });
    
    if (!response.ok) {
      throw new Error("Login failed");
    }
    
    const user = await response.json();
    
    // Store the token in localStorage
    if (user && user.token) {
      localStorage.setItem("token", user.token);
    }
    
    return user;
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
 *   dailyScore: number,  // Initial score in daily challenge mode (0)
 *   token: string,       // Authentication token
 *   progressLevels: ProgressLevelState[] // Initial progress mode levels state
 * }
 */
export const registerUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await fetchWithTimeout(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password, // This is a hashed password
      }),
    });
    
    if (!response.ok) {
      throw new Error("Registration failed");
    }
    
    const user = await response.json();
    
    // Store the token in localStorage
    if (user && user.token) {
      localStorage.setItem("token", user.token);
    }
    
    return user;
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
 * - mode in URL path (casual, daily, or progress)
 * - Authorization header with user token (optional)
 * 
 * Response:
 * Array of:
 * {
 *   rank: number,        // Position in leaderboard
 *   username: string,    // User's username
 *   score: number,       // User's score in the specified mode (casual or daily)
 *   avgGuesses: number   // Average guesses per level (only for progress mode)
 * }
 */
export const fetchLeaderboard = async (mode: GameMode): Promise<LeaderboardEntry[]> => {
  try {
    // Get user token from localStorage
    const userToken = localStorage.getItem("token");
    const headers: HeadersInit = {};
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
    
    const response = await fetchWithTimeout(`${API_URL}/leaderboard/${mode}`, { headers });
    
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
    if (mode === GameMode.PROGRESS) {
      return Array.from({ length: 20 }, (_, i) => ({
        rank: i + 1,
        username: `Player${i + 1}`,
        score: 0,
        avgGuesses: 5 + Math.floor(Math.random() * 20),
      }));
    }
    
    return Array.from({ length: 20 }, (_, i) => ({
      rank: i + 1,
      username: `Player${i + 1}`,
      score: 1000 - i * 50,
    }));
  }
};

/**
 * Logout user by removing the token from localStorage
 */
export const logoutUser = (): void => {
  localStorage.removeItem("token");
};
