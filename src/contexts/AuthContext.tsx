
import React, { createContext, useState, useContext, useEffect } from "react";
import { User, loginUser, registerUser } from "@/services/gameService";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedInUser = await loginUser(username, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
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
      const newUser = await registerUser(username, password);
      if (newUser) {
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
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
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
