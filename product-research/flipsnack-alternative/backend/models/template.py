from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, default="general")
    is_premium = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)

    # Template structure
    layout = Column(JSON, nullable=False)  # Defines page structure
    styles = Column(JSON, nullable=True)   # CSS and styling rules
    components = Column(JSON, nullable=True)  # Reusable components

    # Preview
    preview_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)

    # Usage stats
    usage_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign keys
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    publications = relationship("Publication", back_populates="template")
    creator = relationship("User", foreign_keys=[created_by])