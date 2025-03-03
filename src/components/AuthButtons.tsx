
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, UserPlus, User, LogOut, Loader } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AuthButtons: React.FC = () => {
  const { user, login, register, logout, isLoading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(username, password)) {
      setIsLoginOpen(false);
      setUsername("");
      setPassword("");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError(true);
      return;
    }
    setPasswordError(false);
    
    if (await register(username, password)) {
      setIsRegisterOpen(false);
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="font-medium">{user.username}</span>
          <div className="text-xs text-muted-foreground">
            Casual: {user.casualScore} | Daily: {user.dailyScore}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoading}>
          {isLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : "Login"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Sign Up
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create an Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="reg-username">Username</Label>
              <Input
                id="reg-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                This username will be displayed on the leaderboard.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Passwords do not match. Please try again.
                </AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : "Sign Up"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="text-xs text-muted-foreground">
        Playing as guest
      </div>
    </div>
  );
};

export default AuthButtons;
