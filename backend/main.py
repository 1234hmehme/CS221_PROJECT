from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from model_loader import ai_engine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

@app.post("/predict")
def predict(data: TextInput):
    # Gọi hàm predict từ model_loader
    result = ai_engine.predict(data.text)
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)