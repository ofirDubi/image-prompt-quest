
import React from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GameImage, API_URL } from "@/services/gameService";
interface ImageDisplayProps {
  image: GameImage;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ image }) => {
  const getPromptLengthColor = (length: number) => {
    if (length <= 4) return "text-green-500";
    if (length <= 8) return "text-yellow-500";
    return "text-red-500";
  };
  let imageUrl = API_URL + image.imageUrl;
  return (
    <div className="space-y-6">
      <div className="aspect-square relative bg-slate-100 rounded-md overflow-hidden">
        <img
          src={imageUrl}
          alt="AI generated image"
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="eager"
        />
      </div>

      <div className="text-center text-lg text-slate-700 flex justify-center items-center">
        This image was generated with a prompt that is{" "}
        <span
          className={`font-bold mx-1 ${getPromptLengthColor(image.promptLength)}`}
        >
          {image.promptLength}
        </span>{" "}
        words long.
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="p-0 h-auto w-auto ml-1"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                The prompt length indicates how many words were used to create
                this image. Shorter prompts (green) are generally easier to
                guess, while longer prompts (red) are more difficult.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ImageDisplay;
