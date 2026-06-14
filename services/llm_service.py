import json
import re
from pathlib import Path

from groq import Groq

from config import GROQ_API_KEY, LLM_MODEL, MAX_TOKENS


# Load prompt template once at module level
PROMPT_TEMPLATE_PATH = Path(__file__).parent.parent / "prompts" / "resume_prompt.txt"
PROMPT_TEMPLATE = PROMPT_TEMPLATE_PATH.read_text(encoding="utf-8")

# Initialise Groq client
client = Groq(api_key=GROQ_API_KEY)


async def analyze_resume(resume_text: str, job_description: str) -> dict:



    
    prompt = PROMPT_TEMPLATE.replace("{{RESUME}}", resume_text).replace(
        "{{JOB_DESCRIPTION}}", job_description
    )

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert technical recruiter and career coach. Always respond with valid JSON only — no extra text, no markdown, no code fences.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            model=LLM_MODEL,
            max_tokens=MAX_TOKENS,
            temperature=0.3,
        )

        
        raw_response = chat_completion.choices[0].message.content
        return _parse_llm_response(raw_response)

    except Exception as e:
        print(f"[LLMService] Groq API error: {e}")
        return {"error": f"Groq API error: {str(e)}"}


def _parse_llm_response(raw: str) -> dict:

    
    # Strip markdown code fences if present
    cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback: try to locate JSON object within the response
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

    return {"error": "Failed to parse LLM response as JSON.", "raw_response": raw}
