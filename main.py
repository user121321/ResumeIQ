from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
import io

from services.resume_parser import extract_text_from_pdf
from services.llm_service import analyze_resume
from utils.text_cleaner import clean_text

app = FastAPI(title="Resume Analyzer", version="1.0.0")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    # Validate file type
    if not resume.filename.endswith(".pdf"):
        return JSONResponse(
            status_code=400,
            content={"error": "Only PDF files are supported."}
        )

    # Read the uploaded PDF
    pdf_bytes = await resume.read()

    # Extract text from PDF
    raw_text = extract_text_from_pdf(io.BytesIO(pdf_bytes))
    if not raw_text:
        return JSONResponse(
            status_code=422,
            content={"error": "Could not extract text from the PDF. Ensure it is not scanned/image-only."}
        )

    # Clean the extracted text
    cleaned_resume_text = clean_text(raw_text)

    # Send to LLM for analysis
    result = await analyze_resume(cleaned_resume_text, job_description)

    return JSONResponse(content=result)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)