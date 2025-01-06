from PyPDF2 import PdfReader, PdfWriter
import base64
from io import BytesIO


def pdf_split(pdf_data, from_page, *args):
    """
    Split PDF from specified page range
    pdf_data: base64 encoded PDF file
    from_page: starting page number (1-based)
    *args: optional to_page number
    Returns: base64 encoded split PDF
    """
    to_page = from_page if not args else args[0]

    if to_page < from_page:
        raise Exception("To page must be greater than from page")

    # Decode base64 PDF data
    pdf_bytes = base64.b64decode(pdf_data)
    reader = PdfReader(BytesIO(pdf_bytes))

    # Convert to 0-based page numbers
    from_idx = from_page - 1
    to_idx = to_page - 1

    # Create new PDF with selected pages
    writer = PdfWriter()
    for page_num in range(from_idx, to_idx + 1):
        if page_num < len(reader.pages):
            writer.add_page(reader.pages[page_num])

    # Save to bytes buffer
    output_buffer = BytesIO()
    writer.write(output_buffer)
    output_buffer.seek(0)

    # Return as base64
    return base64.b64encode(output_buffer.getvalue()).decode('utf-8')
