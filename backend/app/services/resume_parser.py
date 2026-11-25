
from io import BytesIO

import pymupdf
from docx import Document


def extract_resume_text(
    file_content: bytes,
    file_extension: str,
) -> str:
    """Extract text from a PDF or DOCX resume."""

    if file_extension == ".pdf":
        with pymupdf.open(
            stream=file_content,
            filetype="pdf",
        ) as pdf:
            text = "\n".join(
                page.get_text()
                for page in pdf
            )

    elif file_extension == ".docx":
        document = Document(BytesIO(file_content))

        paragraphs = [
            paragraph.text
            for paragraph in document.paragraphs
        ]

        text = "\n".join(paragraphs)

    else:
        raise ValueError(
            "Only PDF and DOCX files are supported."
        )

    text = text.strip()

    if not text:
        raise ValueError(
            "No readable text found in the resume."
        )

    return text
