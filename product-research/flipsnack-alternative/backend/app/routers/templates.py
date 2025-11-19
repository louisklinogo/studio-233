from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from core.database import get_db
from models import Template, User
from .auth import get_current_user

router = APIRouter()

# Pydantic models
class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "general"
    is_public: bool = True
    layout: dict
    styles: Optional[dict] = None
    components: Optional[dict] = None

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_public: Optional[bool] = None
    is_premium: Optional[bool] = None
    layout: Optional[dict] = None
    styles: Optional[dict] = None
    components: Optional[dict] = None
    preview_url: Optional[str] = None

class TemplateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: str
    is_premium: bool
    is_public: bool
    layout: dict
    styles: Optional[dict]
    components: Optional[dict]
    preview_url: Optional[str]
    thumbnail_url: Optional[str]
    usage_count: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int]

    class Config:
        from_attributes = True

# Routes
@router.post("/", response_model=TemplateResponse)
async def create_template(
    template: TemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_template = Template(
        name=template.name,
        description=template.description,
        category=template.category,
        is_public=template.is_public,
        layout=template.layout,
        styles=template.styles,
        components=template.components,
        created_by=current_user.id
    )

    db.add(db_template)
    db.commit()
    db.refresh(db_template)

    return db_template

@router.get("/", response_model=List[TemplateResponse])
async def get_templates(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    search: Optional[str] = None,
    is_public: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Template)

    # Filter by visibility
    if is_public is None:
        # Show public templates and user's private templates
        query = query.filter(
            or_(
                Template.is_public == True,
                Template.created_by == current_user.id
            )
        )
    else:
        query = query.filter(Template.is_public == is_public)

    # Filter by category
    if category:
        query = query.filter(Template.category == category)

    # Search functionality
    if search:
        query = query.filter(
            or_(
                Template.name.ilike(f"%{search}%"),
                Template.description.ilike(f"%{search}%")
            )
        )

    templates = query.offset(skip).limit(limit).all()
    return templates

@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    template = db.query(Template).filter(Template.id == template_id).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    # Check if user can access this template
    if not template.is_public and template.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this template"
        )

    return template

@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: int,
    template_update: TemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    template = db.query(Template).filter(Template.id == template_id).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    # Check if user can modify this template
    if template.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own templates"
        )

    # Update fields
    update_data = template_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)

    db.commit()
    db.refresh(template)
    return template

@router.delete("/{template_id}")
async def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    template = db.query(Template).filter(Template.id == template_id).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    # Check if user can delete this template
    if template.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own templates"
        )

    db.delete(template)
    db.commit()

    return {"message": "Template deleted successfully"}

@router.get("/categories/list")
async def get_template_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get all unique categories
    categories = db.query(Template.category).distinct().all()
    return [category[0] for category in categories]

@router.post("/{template_id}/duplicate")
async def duplicate_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    template = db.query(Template).filter(Template.id == template_id).first()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    # Check if user can access this template
    if not template.is_public and template.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this template"
        )

    # Create a copy
    new_template = Template(
        name=f"{template.name} (Copy)",
        description=template.description,
        category=template.category,
        is_public=False,  # Copies are private by default
        layout=template.layout,
        styles=template.styles,
        components=template.components,
        created_by=current_user.id
    )

    db.add(new_template)
    db.commit()
    db.refresh(new_template)

    return new_template