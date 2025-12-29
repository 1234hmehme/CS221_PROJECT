import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Layers, Play, Loader2 } from "lucide-react";

// --- 1. CẬP NHẬT INTERFACE ---
interface ApiResult {
  label: string;
  confidence: number;
  original_text: string;
  tokens: string[];
  embeddings?: number[][];
  attentions?: number[]; // <--- Thêm mảng chứa điểm attention thật
  probs: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

interface ProcessedData {
  original: string;
  tokens: string[];
  embeddings: string[][];
  attentionWeights: { token: string; weight: string }[];
  clsVector: string[];
  probabilities: { positive: string; negative: string; neutral: string };
  sentiment: string;
  confidence: number;
}

// --- 2. HÀM XỬ LÝ DỮ LIỆU ---
const generateVisuals = (data: ApiResult): ProcessedData => {
  let realEmbeddings: string[][];
  let realAttentions: { token: string; weight: string }[];

  // A. Xử lý Embedding (Giữ nguyên logic cũ)
  if (data.embeddings && Array.isArray(data.embeddings) && data.embeddings.length > 0) {
    realEmbeddings = data.embeddings.map((vector) => 
      vector.slice(0, 8).map(num => num.toFixed(4))
    );
  } else {
    console.warn("⚠️ Backend chưa trả về Embeddings. Dùng Mock.");
    realEmbeddings = data.tokens.map(() => 
      Array.from({ length: 8 }, () => (Math.random() * 2 - 1).toFixed(4))
    );
  }

  // B. Xử lý Attention (HÀNG THẬT)
  if (data.attentions && data.attentions.length > 0) {
    // Nếu có data thật từ backend
    realAttentions = data.tokens.map((token, index) => ({
      token,
      // Lấy điểm thật, nếu không có thì mặc định 0.
      weight: (data.attentions![index] || 0).toFixed(3), 
    }));
  } else {
    // Fallback nếu backend lỗi
    console.warn("⚠️ Backend chưa trả về Attentions. Dùng Mock.");
    realAttentions = data.tokens.map((token) => ({
      token,
      weight: (Math.random() * 0.8 + 0.1).toFixed(3), 
    }));
  }

  return {
    original: data.original_text || "",
    tokens: data.tokens,
    embeddings: realEmbeddings,
    attentionWeights: realAttentions, // <--- Dùng biến này
    clsVector: realEmbeddings[0] || [],
    probabilities: {
      positive: data.probs.positive.toFixed(4),
      negative: data.probs.negative.toFixed(4),
      neutral: data.probs.neutral.toFixed(4),
    },
    sentiment: data.label,
    confidence: data.confidence,
  };
};

const Architecture = () => {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(-1);
  const [results, setResults] = useState<ProcessedData | null>(null);

  const layers = [
    { 
      name: "Input Text", 
      description: "Văn bản gốc từ người dùng",
      getResult: (r: ProcessedData) => (
        <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
          <p className="text-sm font-mono">&quot;{r.original}&quot;</p>
        </div>
      )
    },
    { 
      name: "Tokenizer", 
      description: "Tách từ (Word Segmentation & BPE)",
      getResult: (r: ProcessedData) => (
        
        <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {r.tokens.map((token, idx) => (
              <span key={idx} className="px-2 py-1 bg-primary/20 text-xs rounded border border-primary/30">
                {token}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total tokens: {r.tokens.length}</p>
        </div>
      )
    },
    { 
      name: "Embedding Layer", 
      description: "Chuyển tokens thành vectors 768 chiều",
      getResult: (r:ProcessedData) => (
        <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
          <div className="space-y-1">
            {r.embeddings.slice(0, 3).map((emb, idx) => (
              <div key={idx} className="text-xs font-mono">
                <span className="text-muted-foreground">{r.tokens[idx]}:</span> [{emb.join(", ")}...]
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Shape: [{r.tokens.length}, 768]
          </p>
        </div>
      )
    },
    { 
      name: "Transformer Layers", 
      description: "12 layers với multi-head attention",
      getResult: (r: ProcessedData) => (
        <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
          <div className="space-y-2">
            {r.attentionWeights.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="font-mono">{item.token}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-primary"
                      style={{ width: `${parseFloat(item.weight) * 100}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-12">{item.weight}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Attention weights normalized</p>
        </div>
      )
    },
    { 
      name: "Pooling", 
      description: "[CLS] token representation",
      getResult: (r:ProcessedData) => (
        <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
          <div className="text-xs font-mono">
            <span className="text-muted-foreground">[CLS] vector:</span> [{r.clsVector.slice(0, 6).join(", ")}...]
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Extracted sentence representation (768-dim)
          </p>
        </div>
      )
    },
    { 
      name: "Classification Head", 
      description: "Linear layer → Softmax",
      getResult: (r:ProcessedData) => (
        <div className="mt-3 p-3 bg-secondary/30 rounded-lg space-y-2">
          {Object.entries(r.probabilities).map(([label, prob]) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="capitalize font-medium">{label}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      label === "positive" ? "bg-positive" : 
                      label === "negative" ? "bg-negative" : "bg-neutral"
                    }`}
                    style={{ width: `${parseFloat(prob) * 100}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-12">{prob}</span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    { 
      name: "Output", 
      description: "Positive / Negative / Neutral + Confidence",
      getResult: (r: ProcessedData) => (
        <div className="mt-3 p-4 bg-gradient-primary rounded-lg text-center">
          <p className="text-2xl font-bold capitalize text-primary-foreground mb-1">
            {r.sentiment}
          </p>
          <p className="text-sm text-primary-foreground/80">
            Confidence: {(parseFloat(r.confidence.toString())).toFixed(1)}%
          </p>
        </div>
      )
    },
  ];

const handleProcess = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setCurrentLayer(0);
    setResults(null);
    
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      
      if (!response.ok) throw new Error("API Error");
      const data: ApiResult = await response.json();

      const processed = generateVisuals(data);

      for (let i = 0; i < layers.length; i++) {
        setCurrentLayer(i);
        await new Promise(resolve => setTimeout(resolve, 800)); 
      }
      
      setResults(processed);

    } catch (error) {
      console.error("Error:", error);
      alert("Lỗi kết nối Backend. Hãy chắc chắn bạn đã chạy python main.py");
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Model Architecture</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kiến trúc chi tiết của mô hình sentiment classification
          </p>
        </div>

        {/* Input Section */}
        <Card className="p-6 mb-8 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Nhập văn bản để xem flow xử lý</h3>
          <div className="flex gap-3">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ví dụ: Thầy dạy hơi nhanh nhưng rất nhiệt tình..."
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleProcess()}
            />
            <Button 
              onClick={handleProcess} 
              disabled={!inputText.trim() || isProcessing}
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Process
            </Button>
          </div>
        </Card>

        {/* Architecture Flow */}
        <div className="space-y-6">
          {layers.map((layer, index) => {
            const isActive = currentLayer >= index;
            const isProcessingThisLayer = currentLayer === index && isProcessing;
            const hasResult = results && currentLayer >= index;
            
            return (
              <div 
                key={index} 
                className={`transition-all duration-500 ${
                  isActive ? "animate-fade-in" : "opacity-50"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className={`p-6 transition-all duration-500 ${
                  isProcessingThisLayer 
                    ? "border-primary shadow-lg shadow-primary/20 animate-pulse-glow" 
                    : isActive 
                    ? "border-primary/50" 
                    : ""
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground font-bold transition-all duration-300 ${
                        isActive ? "bg-gradient-primary" : "bg-muted"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{layer.name}</h3>
                        <p className="text-sm text-muted-foreground">{layer.description}</p>
                        
                        {/* Show result for this layer */}
                        {hasResult && layer.getResult && (
                          <div className="animate-fade-in">
                            {layer.getResult(results)}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < layers.length - 1 && (
                      <ArrowRight className={`w-6 h-6 transition-colors duration-300 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`} />
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-primary" />
              Model Specifications
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Model</span>
                <span className="font-medium">Zonecb/my-phobert-sentiment-v2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hidden Size</span>
                <span className="font-medium">768</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Attention Heads</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transformer Layers</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Sequence Length</span>
                <span className="font-medium">128 tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parameters</span>
                <span className="font-medium">~135M</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-accent" />
              Training Configuration
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Learning Rate</span>
                <span className="font-medium">2e-5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batch Size</span>
                <span className="font-medium">32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Epochs</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Optimizer</span>
                <span className="font-medium">adamw_bnb_8bit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight Decay</span>
                <span className="font-medium">0.00</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Architecture;
