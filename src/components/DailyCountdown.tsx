
import React, { useState, useEffect } from "react";
import { ClockIcon } from "lucide-react";

const DailyCountdown: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diffMs = tomorrow.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      
      return `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
    };
    
    setTimeRemaining(calculateTimeRemaining());
    
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <p className="text-center text-sm font-medium">Next daily image in:</p>
      <div className="bg-slate-100 px-4 py-2 rounded-lg flex items-center space-x-2">
        <ClockIcon className="w-4 h-4 text-slate-500" />
        <span className="font-mono text-lg font-medium">{timeRemaining}</span>
      </div>
    </div>
  );
};

export default DailyCountdown;
