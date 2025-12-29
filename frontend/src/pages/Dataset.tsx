import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Dataset = () => {
  const samples = [
    {
      text: "Thầy dạy hơi nhanh nhưng rất nhiệt tình",
      label: "positive",
      difficulty: "medium",
      reason: "Có cả yếu tố tích cực và tiêu cực, cần cân nhắc ngữ cảnh",
      prediction: "positive",
    },
    {
      text: "Bài giảng rất hay và dễ hiểu",
      label: "positive",
      difficulty: "easy",
      reason: "Rõ ràng tích cực, không có yếu tố gây nhiễu",
      prediction: "positive",
    },
    {
      text: "Khóa học này thật sự rất tệ",
      label: "negative",
      difficulty: "easy",
      reason: "Rõ ràng tiêu cực với từ ngữ mạnh",
      prediction: "negative",
    },
    {
      text: "Nội dung bình thường, không có gì đặc biệt",
      label: "neutral",
      difficulty: "medium",
      reason: "Không thể hiện cảm xúc rõ ràng, mang tính trung lập",
      prediction: "neutral",
    },
    {
      text: "Giảng viên đọc slide, không tương tác nhiều",
      label: "neutral",
      difficulty: "easy",
      reason: "Mô tả khách quan, không có đánh giá tích cực hay tiêu cực",
      prediction: "neutral",
    },
    {
      text: "Môn học có cả ưu và nhược điểm",
      label: "neutral",
      difficulty: "hard",
      reason: "Cân bằng giữa hai mặt, khó phân loại cảm xúc",
      prediction: "neutral",
    },
    {
      text: "Nội dung ok nhưng giảng viên không tương tác",
      label: "neutral",
      difficulty: "hard",
      reason: "Cảm xúc lẫn lộn, có cả khía cạnh tích cực và tiêu cực",
      prediction: "negative",
    },
    {
      text: "Môn học bổ ích, giúp em hiểu rõ hơn về lĩnh vực này",
      label: "positive",
      difficulty: "easy",
      reason: "Tích cực với chi tiết cụ thể",
      prediction: "positive",
    },
    {
      text: "Bài tập quá nhiều và quá khó",
      label: "negative",
      difficulty: "medium",
      reason: "Tiêu cực nhưng mang tính phàn nàn chủ quan",
      prediction: "negative",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-positive/20 text-positive";
      case "medium":
        return "bg-neutral/20 text-neutral";
      case "hard":
        return "bg-negative/20 text-negative";
      default:
        return "bg-muted";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-positive/20 text-positive";
      case "negative":
        return "bg-negative/20 text-negative";
      default:
        return "bg-neutral/20 text-neutral";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dataset Explorer</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá tập dữ liệu và so sánh predictions của mô hình
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">1,850</div>
            <div className="text-sm text-muted-foreground">Total Samples</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-positive mb-2">892</div>
            <div className="text-sm text-muted-foreground">Positive Samples</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-neutral mb-2">600</div>
            <div className="text-sm text-muted-foreground">Neutral Samples</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-negative mb-2">358</div>
            <div className="text-sm text-muted-foreground">Negative Samples</div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sample Data</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Text</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Prediction</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.map((sample, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="max-w-xs">
                      <div className="text-sm">{sample.text}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSentimentColor(sample.label)}>
                        {sample.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSentimentColor(sample.prediction)}>
                        {sample.prediction}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(sample.difficulty)}>
                        {sample.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-xs text-muted-foreground">{sample.reason}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="mt-8 p-6 bg-secondary/30 border-primary/20">
          <h3 className="text-lg font-semibold mb-3">Dataset Statistics</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Label Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Positive</span>
                  <span className="font-medium">48.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Neutral</span>
                  <span className="font-medium">32.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Negative</span>
                  <span className="font-medium">19.4%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Difficulty Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Easy</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medium</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hard</span>
                  <span className="font-medium">10%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dataset;
