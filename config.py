import os
from dotenv import load_dotenv

load_dotenv()

# LLM API Configuration
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
LLM_MODEL: str = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
MAX_TOKENS: int = int(os.getenv("MAX_TOKENS", "2048"))

# App Settings
APP_TITLE: str = "Resume Analyzer"
MAX_PDF_SIZE_MB: int = int(os.getenv("MAX_PDF_SIZE_MB", "10"))

# Validate required keys on startup
if not GROQ_API_KEY:
    raise EnvironmentError(
        "GROQ_API_KEY is not set. Please add it to your .env file."
    )
