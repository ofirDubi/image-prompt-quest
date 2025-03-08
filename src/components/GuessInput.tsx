
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";

interface GuessInputProps {
  onSubmitGuess: (guess: string) => void;
  disabled?: boolean;
  isSubmitting: boolean;
  previousGuess?: string;
}

const GuessInput: React.FC<GuessInputProps> = ({ 
  onSubmitGuess, 
  disabled = false,
  isSubmitting,
  previousGuess = ""
}) => {
  const [guess, setGuess] = useState(previousGuess);
  
  // Update the guess state when previousGuess prop changes
  useEffect(() => {
    setGuess(previousGuess);
  }, [previousGuess]);

  const handleSubmit = () => {
    if (guess.trim()) {
      onSubmitGuess(guess);
    }
  };

  return (
    <div className="space-y-2">
      <div className="font-medium">What prompt do you think generated this image?</div>
      <div className="flex space-x-2">
        <Input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Enter your guess here..."
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
        <Button onClick={handleSubmit} disabled={disabled || isSubmitting}>
          {isSubmitting ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </div>
  );
};

export default GuessInput;
