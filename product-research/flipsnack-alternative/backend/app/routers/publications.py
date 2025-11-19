from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
import os
from core.database import get_db
from core.config import settings
from models import Publication, Page, User, Template
from .auth import get_current_user

router = APIRouter()

# Pydantic models
class PublicationCreate(BaseModel):
    title: str
    description: Optional[str] = None
    template_id: Optional[int] = None
    is_public: bool = False
    canvas_data: Optional[str] = None

class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_published: Optional[bool] = None
    theme: Optional[str] = None
    custom_css: Optional[str] = None
    canvas_data: Optional[str] = None

class PublicationResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    slug: str
    is_published: bool
    is_public: bool
    page_count: int
    theme: str
    view_count: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    owner_id: int
    template_id: Optional[int]

    class Config:
        from_attributes = True

class PageResponse(BaseModel):
    id: int
    page_number: int
    page_url: str
    thumbnail_url: Optional[str]
    content: Optional[dict]

    class Config:
        from_attributes = True

# Helper functions
def generate_slug(title: str) -> str:
    import re
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')
    return f"{slug}-{uuid.uuid4().hex[:8]}"

def get_upload_path(file_type: str = "pdf") -> str:
    base_path = "uploads"
    today = datetime.now().strftime("%Y/%m/%d")
    return os.path.join(base_path, file_type, today)

# Routes
@router.post("/", response_model=PublicationResponse)
async def create_publication(
    publication: PublicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if template exists and belongs to user
    if publication.template_id:
        template = db.query(Template).filter(Template.id == publication.template_id).first()
        if not template or (not template.is_public and template.created_by != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )

    # Create publication
    slug = generate_slug(publication.title)
    db_publication = Publication(
        title=publication.title,
        description=publication.description,
        slug=slug,
        is_public=publication.is_public,
        owner_id=current_user.id,
        template_id=publication.template_id,
        canvas_data=publication.canvas_data
    )

    db.add(db_publication)
    db.commit()
    db.refresh(db_publication)

    return db_publication

@router.get("/", response_model=List[PublicationResponse])
async def get_publications(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    publications = db.query(Publication).filter(
        Publication.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    return publications

@router.get("/slug/{slug}", response_model=PublicationResponse)
async def get_publication_by_slug(
    slug: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get publication by slug - accessible without authentication for public publications"""

    publication = db.query(Publication).filter(Publication.slug == slug).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    # Check if publication is accessible
    if not publication.is_public and not publication.is_published:
        # Check if user is authenticated and is the owner
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This publication is private"
            )

        try:
            token = auth_header.split(" ")[1]
            # In production, you'd validate the token here
            # For now, we'll assume the token is valid
            # and the user ID is embedded in the token
            # This is a simplified check - implement proper JWT validation
            user_id = 1  # Extract from token in production
            if publication.owner_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to view this publication"
                )
        except:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authentication"
            )

    return publication

@router.get("/{publication_id}", response_model=PublicationResponse)
async def get_publication(
    publication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id,
        Publication.owner_id == current_user.id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    return publication

@router.put("/{publication_id}", response_model=PublicationResponse)
async def update_publication(
    publication_id: int,
    publication_update: PublicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id,
        Publication.owner_id == current_user.id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    # Update fields
    update_data = publication_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(publication, field, value)

    # Set published_at if publishing for the first time
    if publication_update.is_published and not publication.published_at:
        publication.published_at = datetime.utcnow()

    db.commit()
    db.refresh(publication)
    return publication

@router.delete("/{publication_id}")
async def delete_publication(
    publication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id,
        Publication.owner_id == current_user.id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    db.delete(publication)
    db.commit()

    return {"message": "Publication deleted successfully"}

@router.get("/slug/{slug}/pages", response_model=List[PageResponse])
async def get_pages_by_slug(
    slug: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get pages for a publication by slug"""

    publication = db.query(Publication).filter(Publication.slug == slug).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    # Check if publication is accessible (same logic as get_publication_by_slug)
    if not publication.is_public and not publication.is_published:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This publication is private"
            )

        try:
            token = auth_header.split(" ")[1]
            # Simplified token validation
            user_id = 1  # Extract from token in production
            if publication.owner_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to view this publication"
                )
        except:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authentication"
            )

    pages = db.query(Page).filter(Page.publication_id == publication.id).order_by(Page.page_number).all()
    return pages

@router.get("/{publication_id}/pages", response_model=List[PageResponse])
async def get_pages(
    publication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id,
        Publication.owner_id == current_user.id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    pages = db.query(Page).filter(Page.publication_id == publication_id).order_by(Page.page_number).all()
    return pages

@router.post("/{publication_id}/publish")
async def publish_publication(
    publication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id,
        Publication.owner_id == current_user.id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    if not publication.pdf_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Publication must have a PDF to publish"
        )

    publication.is_published = True
    publication.published_at = datetime.utcnow()

    db.commit()
    db.refresh(publication)

    return {"message": "Publication published successfully", "publication": publication}

@router.post("/{publication_id}/unpublish")
async def unpublish_publication(
    publication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    publication = db.query(Publication).filter(
        Publication.id == publication_id,
        Publication.owner_id == current_user.id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    publication.is_published = False
    publication.published_at = None

    db.commit()
    db.refresh(publication)

    return {"message": "Publication unpublished successfully"}