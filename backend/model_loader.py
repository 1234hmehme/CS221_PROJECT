import torch
import numpy as np
import regex as re
import string
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_PATH = "./model" 

# Định nghĩa nhãn (Khớp với uitnlp dataset)
LABELS = {
    0: "Tiêu cực 😡",
    1: "Trung tính 😐",
    2: "Tích cực 😃"
}

emoji_pattern = re.compile("["
                u"\U0001F600-\U0001F64F"
                u"\U0001F300-\U0001F5FF"
                u"\U0001F680-\U0001F6FF"
                u"\U0001F1E0-\U0001F1FF"
                u"\U00002702-\U000027B0"
                u"\U000024C2-\U0001F251"
                u"\U0001f926-\U0001f937"
                u'\U00010000-\U0010ffff'
                u"\u200d"
                u"\u2640-\u2642"
                u"\u2600-\u2B55"
                u"\u23cf"
                u"\u23e9"
                u"\u231a"
                u"\u3030"
                u"\ufe0f"
    "]+", flags=re.UNICODE)
class SentimentModel:
    def __init__(self):
        print("--- KHỞI TẠO PHOBERT ENGINE ---")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Đang chạy trên thiết bị: {self.device}")

        try:
            self.tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
            self.model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
            self.model.to(self.device)
            self.model.eval()
            print("✅ Đã load PhoBERT thành công!")
        except Exception as e:
            print(f"❌ LỖI LOAD MODEL: {e}")
            print("Hãy chắc chắn bạn đã copy TOÀN BỘ file trong folder output vào backend/model/")

    def clean_text(self,text):

        """
        Hàm làm sạch và tiền xử lý văn bản tiếng Việt
        """
        # 1. Chuyển toàn bộ văn bản về chữ thường
        text = text.lower()

        # 2. Loại bỏ tất cả emoji, thay thế bằng khoảng trắng
        text = re.sub(emoji_pattern, "[emoji]", text)

        # 3. Giảm ký tự lặp liên tiếp (ví dụ: 'aaabbb' -> 'ab')
        text = re.sub(r"(\p{L})\1{1,}", r"\1", text)

        # 4. Đảm bảo có khoảng trắng trước và sau dấu câu
        # Giữa từ, dấu câu, và từ khác
        text = re.sub(r"(\w)\s*([" + string.punctuation + "])\s*(\w)", r"\1 \2 \3", text)
        # Từ và dấu câu ở cuối
        text = re.sub(r"(\w)\s*([" + string.punctuation + "])", r"\1 \2", text)
        text = re.sub(r"([!?])\1{1,}", r"\1\1\1", text)
        # re.sub(r"[\u200B-\u200D\uFEFF]", "", text)
        # # 5. Giảm nhiều dấu câu liên tiếp thành một dấu duy nhất
        text = re.sub(r"([.])\1{3,}", r"\1\1\1", text)
        text = re.sub(r"(?<![.,])([.,]{2})(?![.,])", r"\1", text)

        # 6. Loại bỏ khoảng trắng thừa ở đầu và cuối văn bản
        text = text.strip()

        # # 7. Loại bỏ dấu câu và khoảng trắng thừa ở đầu văn bản
        # while text.startswith(tuple(string.punctuation + string.whitespace)):
        #     text = text[1:]

        # # 8. Loại bỏ dấu câu và khoảng trắng thừa ở cuối văn bản
        # while text.endswith(tuple(string.punctuation + string.whitespace)):
        #     text = text[:-1]

        # 10. Giảm nhiều khoảng trắng liên tiếp thành một khoảng trắng duy nhất
        text = re.sub(r"\s+", " ", text)

        return text

    def predict(self, text):
        # 1. Tiền xử lý
        clean_content = self.clean_text(text)
        
        # 2. Tokenize
        inputs = self.tokenizer(
            clean_content, 
            return_tensors="pt", 
            truncation=True, 
            padding=True, 
            max_length=128
        ).to(self.device)

        input_ids = inputs["input_ids"][0]
        tokens = self.tokenizer.convert_ids_to_tokens(input_ids)

        # 3. Dự đoán (Bật cả hidden_states VÀ attentions)
        with torch.no_grad():
            outputs = self.model(**inputs, output_hidden_states=True, output_attentions=True)
            logits = outputs.logits
            
            # A. LẤY VECTOR EMBEDDING (Như cũ)
            last_hidden_state = outputs.hidden_states[-1]
            embeddings = last_hidden_state[0].cpu().numpy().tolist()

            # B. LẤY ATTENTION THẬT (MỚI)
            # outputs.attentions là tuple gồm 12 layers. Ta lấy layer cuối cùng [-1]
            # Shape: [batch_size, num_heads, seq_len, seq_len] -> [1, 12, N, N]


            # print("hehe", outputs.attentions[-1])

            last_layer_attn = outputs.attentions[-1] 
            
            # Tính trung bình cộng của 12 heads để ra 1 ma trận tổng quát [1, N, N]
            avg_attn = torch.mean(last_layer_attn, dim=1)[0] # Shape: [N, N]
            
            # Để hiển thị lên biểu đồ dạng thanh đơn giản (1 chiều), ta sẽ lấy giá trị MAX của mỗi hàng
            # Ý nghĩa: "Từ này tập trung mạnh nhất vào đâu?"
            attn_scores = torch.max(avg_attn, dim=1).values.cpu().numpy().tolist()
            
            # (Hoặc nếu bạn muốn lấy đường chéo - self attention):
            # attn_scores = torch.diagonal(avg_attn, 0).cpu().numpy().tolist()

        # 4. Tính xác suất
        probs = torch.nn.functional.softmax(logits, dim=-1)
        probs = probs.cpu().numpy()[0]

        pred_label_idx = np.argmax(probs)
        pred_label = LABELS.get(pred_label_idx, "Unknown")
        confidence = float(probs[pred_label_idx])

        return {
            "label": pred_label,
            "confidence": round(confidence * 100, 2),
            "original_text": text,
            "tokens": tokens,
            "embeddings": embeddings, 
            "attentions": attn_scores, # <--- Gửi điểm Attention thật về
            "probs": {
                "positive": float(probs[2]),
                "negative": float(probs[0]),
                "neutral": float(probs[1]) 
            }
        }
ai_engine = SentimentModel()