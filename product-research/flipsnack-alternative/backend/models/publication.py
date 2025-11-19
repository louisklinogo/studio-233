from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    is_published = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    password_protected = Column(Boolean, default=False)
    password = Column(String, nullable=True)

    # PDF settings
    pdf_url = Column(String, nullable=True)
    page_count = Column(Integer, default=0)

    # Styling
    theme = Column(String, default="default")
    custom_css = Column(Text, nullable=True)
    page_transition = Column(String, default="flip")

    # Canvas data for editor
    canvas_data = Column(Text, nullable=True)

    # Analytics
    view_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)

    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"))
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="publications")
    template = relationship("Template", back_populates="publications")
    pages = relationship("Page", back_populates="publication")
    analytics = relationship("Analytics", back_populates="publication")
    shares = relationship("Share", back_populates="publication")

class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    page_number = Column(Integer, nullable=False)
    page_url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)

    # Content elements (JSON structure for multimedia)
    content = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign keys
    publication_id = Column(Integer, ForeignKey("publications.id"))

    # Relationships
    publication = relationship("Publication", back_populates="pages")