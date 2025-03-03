
import { Button } from "@/components/ui/button";
import ImagePromptGame from "@/components/ImagePromptGame";
import { Lightbulb, Trophy } from "lucide-react";
import AuthButtons from "@/components/AuthButtons";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <Button variant="default" asChild className="w-full sm:w-auto">
              <Link to="/leaderboard" className="flex items-center">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Link>
            </Button>
            <AuthButtons />
          </div>
          <h1 className="text-3xl font-bold text-center text-primary mt-4">Guess The Image Prompt</h1>
          <p className="text-center text-muted-foreground mt-2">
            Can you guess what prompt was used to generate these AI images?
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-6">
        <ImagePromptGame />
      </main>

      <footer className="w-full py-6 border-t mt-8">
        <div className="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          <p>Guess The Image Prompt &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
