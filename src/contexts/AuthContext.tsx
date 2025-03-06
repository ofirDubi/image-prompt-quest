
import React, { createContext, useState, useContext, useEffect } from "react";
import { User, loginUser, registerUser, logoutUser } from "@/services/gameService";
import { toast } from "@/hooks/use-toast";

// Simple password hashing function (in production, use a proper library)
const hashPassword = (password: string): string => {
  // This is a simple hash function for demonstration
  // In a real application, use a proper hashing library like bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36); // Convert to base 36 string
};

// Default guest user
const guestUser: User = {
  id: "guest",
  username: "guest",
  casualScore: 0,
  dailyScore: 0,
  token: "guest"
};

interface AuthContextType {
  user: User;
  isLoading: boolean;
  isGuest: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(guestUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsGuest(false);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(guestUser);
        setIsGuest(true);
      }
    } else {
      setUser(guestUser);
      setIsGuest(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Hash the password before sending to server
      const hashedPassword = hashPassword(password);
      const loggedInUser = await loginUser(username, hashedPassword);
      if (loggedInUser) {
        setUser(loggedInUser);
        setIsGuest(false);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        // Note: token is now stored in localStorage by the loginUser function
        toast({
          title: "Login Successful",
          description: `Welcome back, ${loggedInUser.username}!`,
        });
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Hash the password before sending to server
      const hashedPassword = hashPassword(password);
      const newUser = await registerUser(username, hashedPassword);
      if (newUser) {
        setUser(newUser);
        setIsGuest(false);
        localStorage.setItem("user", JSON.stringify(newUser));
        // Note: token is now stored in localStorage by the registerUser function
        toast({
          title: "Registration Successful",
          description: `Welcome, ${newUser.username}!`,
        });
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(guestUser);
    setIsGuest(true);
    localStorage.removeItem("user");
    logoutUser(); // This now handles removing the token
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isGuest, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
