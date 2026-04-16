# Resume Analyzer

An AI-powered resume analyzer built with FastAPI, Groq (LLaMA 3), and PyMuPDF.

## Features
- Upload PDF resume
- Paste job description
- Get instant AI analysis with match score, strengths, gaps, skills, ATS keywords, and recommendations

## Tech Stack
- **Backend**: FastAPI + Python
- **AI**: Groq API (LLaMA 3.3 70B)
- **PDF Parsing**: PyMuPDF
- **Frontend**: HTML, CSS, JavaScript

## Local Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/resume-analyzer.git
   cd resume-analyzer
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   LLM_MODEL=llama-3.3-70b-versatile
   MAX_TOKENS=2048
   MAX_PDF_SIZE_MB=10
   ```

4. Run the app:
   ```bash
   uvicorn main:app --reload
   ```

5. Open `http://localhost:8000`

## Deploy to Render

1. Push this repo to GitHub
2. Go to https://render.com and create a new Web Service
3. Connect your GitHub repo
4. Add `GROQ_API_KEY` in the Environment Variables section
5. Deploy!

## Get a Free Groq API Key
Visit https://console.groq.com to get a free API key.

## Check demo of the website
wait 30-60 sec then reload the page 
https://resumeiq-3.onrender.com
