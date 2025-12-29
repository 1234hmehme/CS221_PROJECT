interface Token {
  text: string;
  weight: number;
  sentiment: "positive" | "negative" | "neutral";
}

interface TokenVisualizationProps {
  tokens: Token[];
}

const TokenVisualization = ({ tokens }: TokenVisualizationProps) => {
  const getTokenColor = (sentiment: string, weight: number) => {
    const opacity = Math.min(weight * 2, 1);
    
    switch (sentiment) {
      case "positive":
        return `rgba(16, 185, 129, ${opacity})`;
      case "negative":
        return `rgba(239, 68, 68, ${opacity})`;
      default:
        return `rgba(100, 116, 139, ${opacity})`;
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Token Attention Weights</h4>
      <div className="flex flex-wrap gap-2">
        {tokens.map((token, index) => (
          <span
            key={index}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all duration-300 hover:scale-110 cursor-default"
            style={{
              backgroundColor: getTokenColor(token.sentiment, token.weight),
              animation: `fade-in 0.3s ease-out ${index * 0.05}s both`,
            }}
            title={`Weight: ${token.weight.toFixed(3)}`}
          >
            {token.text}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(16, 185, 129, 0.8)" }} />
          <span>Positive</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(100, 116, 139, 0.8)" }} />
          <span>Neutral</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(239, 68, 68, 0.8)" }} />
          <span>Negative</span>
        </div>
      </div>
    </div>
  );
};

export default TokenVisualization;
