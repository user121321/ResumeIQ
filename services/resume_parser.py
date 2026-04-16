import fitz  # PyMuPDF
from typing import Optional
import io


def extract_text_from_pdf(pdf_source: io.BytesIO) -> Optional[str]:
    """
    Extract plain text from a PDF file.

    Args:
        pdf_source: A BytesIO object containing PDF binary data.

    Returns:
        Extracted text as a string, or None if extraction fails.
    """
    try:
        pdf_bytes = pdf_source.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        all_text = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            if text.strip():
                all_text.append(text)

        doc.close()

        full_text = "\n".join(all_text)
        return full_text if full_text.strip() else None

    except Exception as e:
        print(f"[ResumeParser] Error extracting PDF text: {e}")
        return None