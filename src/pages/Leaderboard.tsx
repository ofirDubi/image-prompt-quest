
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, ArrowLeft, CalendarIcon, Sparkles, Loader } from "lucide-react";
import { fetchLeaderboard, GameMode, LeaderboardEntry } from "@/services/gameService";
import { Link } from "react-router-dom";

const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameMode>(GameMode.CASUAL);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLeaderboard(activeTab);
        setLeaderboard(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-center text-primary">Leaderboard</h1>
          <p className="text-center text-muted-foreground mt-2">
            See who's leading in Guess The Image Prompt
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <Tabs 
          defaultValue={GameMode.CASUAL} 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as GameMode)}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value={GameMode.CASUAL} className="flex flex-col sm:flex-row items-center justify-center p-3">
              <Sparkles className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
              <span>Casual Mode</span>
            </TabsTrigger>
            <TabsTrigger value={GameMode.DAILY} className="flex flex-col sm:flex-row items-center justify-center p-3">
              <CalendarIcon className="w-4 h-4 mb-1 sm:mb-0 sm:mr-2" />
              <span>Daily Challenge</span>
            </TabsTrigger>
          </TabsList>

          {[GameMode.CASUAL, GameMode.DAILY].map((mode) => (
            <TabsContent key={mode} value={mode} className="mt-0">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rank</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Player</th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center">
                            <div className="flex items-center justify-center">
                              <Loader className="h-6 w-6 animate-spin text-primary mr-2" />
                              <span className="text-sm text-slate-500">Loading leaderboard...</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        leaderboard.map((entry) => (
                          <tr key={entry.rank} className={entry.rank <= 3 ? "bg-amber-50" : ""}>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                {entry.rank <= 3 && (
                                  <Trophy className={`w-4 h-4 mr-2 ${
                                    entry.rank === 1 ? "text-yellow-500" : 
                                    entry.rank === 2 ? "text-slate-400" : "text-amber-700"
                                  }`} />
                                )}
                                <span className={entry.rank <= 3 ? "font-medium" : ""}>
                                  {entry.rank}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                              {entry.username}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                              {entry.score.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="w-full py-6 border-t">
        <div className="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          <p>Guess The Image Prompt &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Leaderboard;
