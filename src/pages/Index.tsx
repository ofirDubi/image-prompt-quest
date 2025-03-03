
import { Button } from "@/components/ui/button";
import ImagePromptGame from "@/components/ImagePromptGame";
import { Lightbulb } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-center text-primary">Guess The Image Prompt</h1>
          <p className="text-center text-muted-foreground mt-2">
            Can you guess what prompt was used to generate these AI images?
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
          <Lightbulb className="text-amber-500 w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">How to play:</p>
            <p>Look at the AI-generated image and try to guess what prompt was used to create it. You'll score points based on how similar your guess is to the original prompt!</p>
          </div>
        </div>

        <ImagePromptGame />
      </main>

      <footer className="w-full py-6 border-t">
        <div className="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          <p>Guess The Image Prompt &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
