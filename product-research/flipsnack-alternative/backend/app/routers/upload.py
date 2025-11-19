from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
import os
import uuid
from datetime import datetime
from typing import Optional
import aiofiles
from PIL import Image
import PyPDF2
from io import BytesIO

from core.database import get_db
from core.config import settings
from models import Publication, Page, User
from .auth import get_current_user

router = APIRouter()

# Helper functions
def validate_file_type(file: UploadFile) -> bool:
    if file.content_type not in settings.ALLOWED_FILE_TYPES:
        return False
    return True

def validate_file_size(file: UploadFile) -> bool:
    return file.size <= settings.MAX_FILE_SIZE

def get_file_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()

async def save_upload_file(file: UploadFile, upload_path: str) -> str:
    os.makedirs(upload_path, exist_ok=True)

    file_extension = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_path, unique_filename)

    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)

    return file_path

async def process_pdf_to_pages(pdf_path: str, upload_path: str) -> list:
    """Extract pages from PDF and save as images"""
    pages = []

    try:
        with open(pdf_path, 'rb') as pdf_file:
            pdf_reader = pypdf2.PdfReader(pdf_file)

            for page_num in range(len(pdf_reader.pages)):
                # Convert PDF page to image (simplified - in production, use proper PDF to image conversion)
                page_filename = f"page_{page_num + 1}.jpg"
                page_path = os.path.join(upload_path, page_filename)

                # For now, create a placeholder image
                # In production, you'd use libraries like pdf2image or wand
                pages.append({
                    "page_number": page_num + 1,
                    "page_url": page_path,
                    "thumbnail_url": page_path  # Same for now, should create thumbnail
                })

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing PDF: {str(e)}"
        )

    return pages

async def create_thumbnail(image_path: str, size: tuple = (200, 200)) -> str:
    """Create a thumbnail from an image"""
    try:
        with Image.open(image_path) as img:
            img.thumbnail(size)

            thumbnail_path = os.path.join(
                os.path.dirname(image_path),
                f"thumb_{os.path.basename(image_path)}"
            )

            img.save(thumbnail_path, "JPEG", quality=85)
            return thumbnail_path

    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        return image_path

# Routes
@router.post("/pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    publication_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file
    if not validate_file_type(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF files are allowed."
        )

    if not validate_file_size(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE // (1024 * 1024)}MB"
        )

    # Check if publication exists and belongs to user
    publication = db.query(Publication).filter(
        Publication.id == publication_id,
        Publication.owner_id == current_user.id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    # Create upload path
    today = datetime.now().strftime("%Y/%m/%d")
    upload_path = os.path.join("uploads", "pdf", today, str(publication_id))

    try:
        # Save PDF file
        pdf_path = await save_upload_file(file, upload_path)

        # Process PDF to pages
        pages_data = await process_pdf_to_pages(pdf_path, upload_path)

        # Update publication
        publication.pdf_url = pdf_path
        publication.page_count = len(pages_data)

        # Create page records
        for page_data in pages_data:
            db_page = Page(
                publication_id=publication_id,
                page_number=page_data["page_number"],
                page_url=page_data["page_url"],
                thumbnail_url=page_data["thumbnail_url"]
            )
            db.add(db_page)

        db.commit()
        db.refresh(publication)

        return {
            "message": "PDF uploaded and processed successfully",
            "pdf_url": pdf_path,
            "page_count": len(pages_data),
            "pages": pages_data
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading PDF: {str(e)}"
        )

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    page_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG and PNG files are allowed."
        )

    if not validate_file_size(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE // (1024 * 1024)}MB"
        )

    # Create upload path
    today = datetime.now().strftime("%Y/%m/%d")
    upload_path = os.path.join("uploads", "images", today)

    try:
        # Save image file
        image_path = await save_upload_file(file, upload_path)

        # Create thumbnail
        thumbnail_path = await create_thumbnail(image_path)

        return {
            "message": "Image uploaded successfully",
            "image_url": image_path,
            "thumbnail_url": thumbnail_path
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading image: {str(e)}"
        )

@router.post("/logo")
async def upload_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file
    if file.content_type not in ["image/jpeg", "image/png", "image/svg+xml"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, and SVG files are allowed."
        )

    if not validate_file_size(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE // (1024 * 1024)}MB"
        )

    # Create upload path
    today = datetime.now().strftime("%Y/%m/%d")
    upload_path = os.path.join("uploads", "logos", today)

    try:
        # Save logo file
        logo_path = await save_upload_file(file, upload_path)

        # Update user's brand logo
        current_user.brand_logo = logo_path
        db.commit()
        db.refresh(current_user)

        return {
            "message": "Logo uploaded successfully",
            "logo_url": logo_path
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading logo: {str(e)}"
        )

@router.delete("/{file_type}/{filename}")
async def delete_file(
    file_type: str,
    filename: str,
    current_user: User = Depends(get_current_user)
):
    # Validate file type
    if file_type not in ["pdf", "images", "logos"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type"
        )

    file_path = os.path.join("uploads", file_type, filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}"
        )