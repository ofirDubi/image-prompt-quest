
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, GameMode } from "@/services/gameService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  updateUserScore: (mode: GameMode, score: number) => void;
  isGuest: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  updateUserScore: () => {},
  isGuest: true,
  isLoading: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have user data in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        // If there's an error parsing, clear the localStorage
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Update user object in local storage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);
  
  // Add function to update user score
  const updateUserScore = (mode: GameMode, score: number) => {
    if (!user) return;
    
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const updatedUser = { ...prevUser };
      
      if (mode === GameMode.CASUAL) {
        updatedUser.casualScore = Math.max(updatedUser.casualScore || 0, score);
      } else if (mode === GameMode.DAILY) {
        updatedUser.dailyScore = Math.max(updatedUser.dailyScore || 0, score);
      }
      
      return updatedUser;
    });
  };

  // Simulated authentication functions
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, any login attempt succeeds
      // In a real app, you would validate credentials with your backend
      const mockUser: User = {
        id: Date.now().toString(),
        username,
        casualScore: 0,
        dailyScore: 0,
        createdAt: new Date().toISOString()
      };
      
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, registration always succeeds
      // In a real app, you would create a new user in your backend
      const newUser: User = {
        id: Date.now().toString(),
        username,
        casualScore: 0,
        dailyScore: 0,
        createdAt: new Date().toISOString()
      };
      
      setUser(newUser);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    
  };

  const isGuest = !user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      setUser, 
      updateUserScore, 
      isGuest,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
