from typing import IO
from pypdf import PdfReader
import io
import logging

logger = logging.getLogger("skillpick.pdf")


def extract_text_from_pdf_bytes(data: bytes) -> str:
    """
    Extract text from a PDF given as bytes.
    """
    try:
        pdf_stream: IO[bytes] = io.BytesIO(data)
        reader = PdfReader(pdf_stream)
        texts = []
        for page in reader.pages:
            try:
                texts.append(page.extract_text() or "")
            except Exception as e:  # noqa: BLE001
                logger.warning("Failed to extract text from page: %s", e)
        return "\n".join(texts).strip()
    except Exception as e:  # noqa: BLE001
        logger.error("PDF parsing failed: %s", e)
        return ""
