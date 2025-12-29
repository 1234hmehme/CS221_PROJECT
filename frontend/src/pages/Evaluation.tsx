import { Card } from "@/components/ui/card";
import { TrendingUp, Target, AlertCircle } from "lucide-react";

const Evaluation = () => {
  const metrics = [
    { name: "Accuracy", value: "97.16%", change: "+5.2%" },
    { name: "F1 Score", value: "0.9307", change: "+4.8%" },
    { name: "Precision", value: "0.9293", change: "+3.1%" },
    { name: "Recall", value: "0.9322", change: "+6.3%" },
  ];

  const labels = ["negative", "neutral", "positive"];

  const confusionMatrix = [
    [1383, 6, 20],
    [12, 140, 17],
    [14, 21, 1553],
  ];

  const misclassifications = [
    {
      text: "Nội dung ok nhưng giảng viên không tương tác",
      true_label: "neutral",
      predicted: "negative",
      reason: "Mô hình tập trung quá nhiều vào phần tiêu cực",
    },
    {
      text: "Thầy dạy hơi khó hiểu nhưng bài tập hay",
      true_label: "neutral",
      predicted: "positive",
      reason: "Attention weight cho 'hay' quá cao",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Model Evaluation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hiệu suất và phân tích chi tiết của mô hình sau fine-tuning
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm text-muted-foreground">{metric.name}</div>
                <TrendingUp className="w-4 h-4 text-positive" />
              </div>
              <div className="text-3xl font-bold mb-1">{metric.value}</div>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-primary" />
          Confusion Matrix
        </h3>

        {/* Header */}
        <div className="grid grid-cols-4 gap-2 text-sm font-medium mb-2">
          <div></div>
          {labels.map((label) => (
            <div key={label} className="text-center capitalize">
              {label}
            </div>
          ))}
        </div>

        {/* Matrix */}
        {confusionMatrix.map((row, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 mb-2">
            {/* True label */}
            <div className="text-sm font-medium capitalize flex items-center">
              {labels[i]}
            </div>

            {row.map((value, j) => {
              const isCorrect = i === j;

              return (
                <div
                  key={`${i}-${j}`}
                  className={`p-4 rounded-lg text-center font-semibold ${
                    isCorrect
                      ? "bg-positive/20 text-positive"
                      : "bg-negative/20 text-negative"
                  }`}
                >
                  {value}
                </div>
              );
            })}
          </div>
        ))}

        <div className="mt-4 text-xs text-muted-foreground">
          Hàng: nhãn thật (True label) · Cột: nhãn dự đoán (Predicted label)
        </div>
      </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Training Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Training Loss</span>
                  <span className="font-medium">0.101400</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary w-[75%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Validation Loss</span>
                  <span className="font-medium">0.158111</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-accent w-[68%]" />
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Epochs</div>
                    <div className="font-semibold">5</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Batch Size</div>
                    <div className="font-semibold">32</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Learning Rate</div>
                    <div className="font-semibold">2e-5</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Steps</div>
                    <div className="font-semibold">300</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-negative" />
            Error Analysis - Misclassifications
          </h3>
          <div className="space-y-4">
            {misclassifications.map((error, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="mb-2 text-sm font-medium">{error.text}</div>
                <div className="flex items-center space-x-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">True: </span>
                    <span className="font-medium text-positive">{error.true_label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Predicted: </span>
                    <span className="font-medium text-negative">{error.predicted}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground italic">
                  Lý do: {error.reason}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Evaluation;
