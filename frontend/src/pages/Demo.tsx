import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EmotionGauge from "@/components/EmotionGauge";
import TokenVisualization from "@/components/TokenVisualization";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

// Định nghĩa kiểu dữ liệu trả về từ API Backend Python
interface BackendResponse {
  label: string;
  confidence: number;
  original_text: string;
  clean_text: string;
}

const Demo = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    sentiment: "positive" | "negative" | "neutral";
    score: number;
    tokens: Array<{ text: string; weight: number; sentiment: "positive" | "negative" | "neutral" }>;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setErrorMsg(null);
    
    try {
      // GỌI API TỚI BACKEND PYTHON
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        throw new Error("Không kết nối được với Server Backend");
      }

      const data: BackendResponse = await response.json();

      // --- XỬ LÝ DỮ LIỆU TRẢ VỀ ---

      // 1. Map nhãn từ Backend (Tiếng Việt) sang Frontend (English keys)
      let sentimentKey: "positive" | "negative" | "neutral" = "neutral";
      if (data.label.includes("Tích cực")) sentimentKey = "positive";
      else if (data.label.includes("Tiêu cực")) sentimentKey = "negative";
      
      // 2. Map điểm tin cậy (0-100) sang (0-1)
      const scoreNormalized = data.confidence / 100;

      // 3. Tạo visualization giả lập cho các tokens 
      // (Vì Naive Bayes là bag-of-words, không có attention score từng từ như BERT,
      // nên ta sẽ chia từ theo khoảng trắng để hiển thị cho đẹp giao diện)
      const words = text.split(/\s+/);
      const tokens = words.map(word => ({
        text: word,
        // Gán trọng số ngẫu nhiên nhẹ để giao diện trông sinh động
        weight: 0.3 + (Math.random() * 0.4), 
        sentiment: sentimentKey, // Tô màu tất cả từ theo màu cảm xúc chung
      }));

      setResult({
        sentiment: sentimentKey,
        score: scoreNormalized,
        tokens: tokens
      });

    } catch (error) {
      console.error("Lỗi:", error);
      setErrorMsg("Lỗi kết nối: Hãy chắc chắn bạn đã chạy 'python main.py' ở folder backend!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exampleTexts = [
    "Thầy dạy hơi nhanh nhưng rất nhiệt tình",
    "Bài giảng rất hay và dễ hiểu",
    "Khóa học này thật sự rất tệ",
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sentiment Analysis Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nhập văn bản bất kỳ và xem mô hình AI phân tích cảm xúc theo thời gian thực
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nhập văn bản của bạn</label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ví dụ: Thầy dạy hơi nhanh nhưng rất nhiệt tình..."
                className="min-h-[200px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Hoặc thử một ví dụ:</p>
              <div className="flex flex-wrap gap-2">
                {exampleTexts.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setText(example)}
                    className="text-xs"
                  >
                    {example.substring(0, 20)}...
                  </Button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errorMsg}
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Phân tích cảm xúc
                </>
              )}
            </Button>
          </Card>

          <Card className="p-6 space-y-6">
            {result ? (
              <>
                <EmotionGauge sentiment={result.sentiment} score={result.score} />
                <div className="border-t pt-6">
                  <TokenVisualization tokens={result.tokens} />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center space-y-4 animate-float">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Sẵn sàng phân tích</h3>
                    <p className="text-sm text-muted-foreground">
                      Nhập văn bản và nhấn nút phân tích để xem kết quả từ Server
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card className="mt-8 p-6 bg-secondary/30 border-primary/20">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            Cách hoạt động (Backend: Naive Bayes)
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">1. Preprocessing</h4>
              <p className="text-muted-foreground">Sử dụng Spacy để tách từ và loại bỏ dấu câu tiếng Việt.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">2. Vectorization</h4>
              <p className="text-muted-foreground">Đếm tần suất xuất hiện của từ (Bag of Words/CountVectorizer).</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">3. Classification</h4>
              <p className="text-muted-foreground">Mô hình Naive Bayes tính toán xác suất để đưa ra nhãn.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Demo;