
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, GameMode } from "@/services/gameService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  updateUserScore: (mode: GameMode, score: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  updateUserScore: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <AuthContext.Provider value={{ user, loading, setUser, updateUserScore }}>
      {children}
    </AuthContext.Provider>
  );
};
