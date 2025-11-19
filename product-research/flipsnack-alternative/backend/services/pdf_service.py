import os
import asyncio
from typing import List, Dict, Any
from PIL import Image
import io
import pypdf2
from datetime import datetime
import uuid

class PDFService:
    def __init__(self, upload_path: str = "uploads"):
        self.upload_path = upload_path
        os.makedirs(upload_path, exist_ok=True)

    async def process_pdf_to_images(self, pdf_path: str, publication_id: int) -> List[Dict[str, Any]]:
        """
        Convert PDF pages to images
        """
        try:
            # Create publication-specific directory
            pub_dir = os.path.join(self.upload_path, "processed", str(publication_id))
            os.makedirs(pub_dir, exist_ok=True)

            pages = []

            # Open PDF file
            with open(pdf_path, 'rb') as pdf_file:
                pdf_reader = pypdf2.PdfReader(pdf_file)

                for page_num in range(len(pdf_reader.pages)):
                    # Create page filename
                    page_filename = f"page_{page_num + 1}.jpg"
                    page_path = os.path.join(pub_dir, page_filename)
                    thumbnail_filename = f"page_{page_num + 1}_thumb.jpg"
                    thumbnail_path = os.path.join(pub_dir, thumbnail_filename)

                    # For now, create placeholder images
                    # In production, you'd use proper PDF to image conversion libraries
                    # like pdf2image, wand, or commercial solutions
                    await self._create_placeholder_image(page_path, page_num + 1)
                    await self._create_thumbnail(page_path, thumbnail_path)

                    pages.append({
                        "page_number": page_num + 1,
                        "page_url": page_path,
                        "thumbnail_url": thumbnail_path
                    })

            return pages

        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")

    async def _create_placeholder_image(self, image_path: str, page_number: int):
        """
        Create a placeholder image for PDF page
        """
        # Create a simple placeholder image
        img = Image.new('RGB', (800, 600), color='white')

        # Add page number text (simplified)
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(img)

        try:
            # Try to use a default font
            font = ImageFont.load_default()
        except:
            font = None

        text = f"Page {page_number}"
        text_position = (400 - 50, 300 - 10)  # Center text

        if font:
            draw.text(text_position, text, fill='black', font=font)
        else:
            draw.text(text_position, text, fill='black')

        # Save image
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        img.save(image_path, "JPEG", quality=85)

    async def _create_thumbnail(self, image_path: str, thumbnail_path: str):
        """
        Create thumbnail from image
        """
        try:
            with Image.open(image_path) as img:
                # Calculate thumbnail size maintaining aspect ratio
                img.thumbnail((200, 200))

                # Save thumbnail
                img.save(thumbnail_path, "JPEG", quality=70)
        except Exception as e:
            print(f"Error creating thumbnail: {e}")
            # Copy original as fallback
            import shutil
            shutil.copy2(image_path, thumbnail_path)

    async def extract_pdf_metadata(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract metadata from PDF
        """
        try:
            with open(pdf_path, 'rb') as pdf_file:
                pdf_reader = pypdf2.PdfReader(pdf_file)

                metadata = {
                    "page_count": len(pdf_reader.pages),
                    "title": pdf_reader.metadata.get('/Title', ''),
                    "author": pdf_reader.metadata.get('/Author', ''),
                    "subject": pdf_reader.metadata.get('/Subject', ''),
                    "creator": pdf_reader.metadata.get('/Creator', ''),
                    "producer": pdf_reader.metadata.get('/Producer', ''),
                    "creation_date": pdf_reader.metadata.get('/CreationDate', ''),
                    "modification_date": pdf_reader.metadata.get('/ModDate', ''),
                }

                return metadata
        except Exception as e:
            print(f"Error extracting PDF metadata: {e}")
            return {"page_count": 0}

    async def validate_pdf(self, pdf_path: str) -> bool:
        """
        Validate PDF file
        """
        try:
            with open(pdf_path, 'rb') as pdf_file:
                pdf_reader = pypdf2.PdfReader(pdf_file)
                # Try to read first page to validate
                if len(pdf_reader.pages) > 0:
                    return True
                return False
        except Exception:
            return False

    async def get_pdf_file_size(self, pdf_path: str) -> int:
        """
        Get PDF file size in bytes
        """
        try:
            return os.path.getsize(pdf_path)
        except Exception:
            return 0