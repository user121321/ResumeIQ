import re


def clean_text(text: str) -> str:
    """
    Clean and normalise raw text extracted from a PDF resume.

    Steps:
    1. Normalise line endings.
    2. Remove null bytes and non-printable control characters.
    3. Collapse excessive whitespace/blank lines.
    4. Strip leading/trailing whitespace.

    Args:
        text: Raw text extracted from the PDF.

    Returns:
        Cleaned text ready to be sent to the LLM.
    """
    if not text:
        return ""

    # Normalise Windows line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove null bytes
    text = text.replace("\x00", "")

    # Remove non-printable control characters (keep newlines and tabs)
    text = re.sub(r"[^\x09\x0A\x20-\x7E\u00A0-\uFFFF]", " ", text)

    # Collapse 3+ consecutive blank lines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Collapse multiple spaces/tabs into a single space
    text = re.sub(r"[ \t]{2,}", " ", text)

    # Strip each line individually
    lines = [line.strip() for line in text.splitlines()]
    text = "\n".join(lines)

    return text.strip()