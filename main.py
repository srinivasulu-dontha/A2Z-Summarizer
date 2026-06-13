from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

from backend.summarizer import process_text, read_pdf, read_docx, read_url

app = FastAPI(title="A2Z Summarizer API")

# Add CORS middleware if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str
    algo: str = "LSA"
    num_sentences: int = 3

class UrlRequest(BaseModel):
    url: str
    algo: str = "LSA"
    num_sentences: int = 3

@app.post("/api/summarize/text")
async def summarize_text(req: TextRequest):
    try:
        result = process_text(req.text, req.algo, req.num_sentences)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/summarize/file")
async def summarize_file(
    file: UploadFile = File(...),
    algo: str = Form("LSA"),
    num_sentences: int = Form(3)
):
    try:
        content = await file.read()
        filename = file.filename.lower()
        
        text = ""
        if filename.endswith(".pdf"):
            text = read_pdf(content)
        elif filename.endswith(".docx"):
            text = read_docx(content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or DOCX.")
            
        result = process_text(text, algo, num_sentences)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/summarize/url")
async def summarize_url_endpoint(req: UrlRequest):
    try:
        text = read_url(req.url)
        result = process_text(text, req.algo, req.num_sentences)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Mount static files to serve the frontend
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
