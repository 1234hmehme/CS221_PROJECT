import { useState, useEffect } from "react";
import { Smile, Frown, Meh } from "lucide-react";

interface EmotionGaugeProps {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
}

const EmotionGauge = ({ sentiment, score }: EmotionGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getGaugeColor = () => {
    switch (sentiment) {
      case "positive":
        return "bg-gradient-positive";
      case "negative":
        return "bg-gradient-negative";
      default:
        return "bg-gradient-neutral";
    }
  };

  const getIcon = () => {
    switch (sentiment) {
      case "positive":
        return <Smile className="w-8 h-8" />;
      case "negative":
        return <Frown className="w-8 h-8" />;
      default:
        return <Meh className="w-8 h-8" />;
    }
  };

  const getTextColor = () => {
    switch (sentiment) {
      case "positive":
        return "text-positive";
      case "negative":
        return "text-negative";
      default:
        return "text-neutral";
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-3 ${getTextColor()}`}>
          {getIcon()}
          <div>
            <h3 className="text-2xl font-bold capitalize">{sentiment}</h3>
            <p className="text-sm opacity-70">Confidence: {(animatedScore * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${getGaugeColor()} rounded-full transition-all duration-1000 ease-out animate-gauge-fill`}
          style={{ width: `${animatedScore * 100}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Very Negative</span>
        <span>Neutral</span>
        <span>Very Positive</span>
      </div>
    </div>
  );
};

export default EmotionGauge;
