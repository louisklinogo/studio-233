from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)  # 'view', 'page_flip', 'click', 'download', etc.
    session_id = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    publication_id = Column(Integer, ForeignKey("publications.id"), nullable=False)

    # Event data
    page_number = Column(Integer, nullable=True)
    element_id = Column(String, nullable=True)
    element_type = Column(String, nullable=True)  # 'link', 'video', 'form', etc.
    duration = Column(Float, nullable=True)  # Time spent on page
    coordinates = Column(JSON, nullable=True)  # Click coordinates

    # Device info
    device_type = Column(String, nullable=True)  # 'desktop', 'mobile', 'tablet'
    browser = Column(String, nullable=True)
    os = Column(String, nullable=True)
    referrer = Column(String, nullable=True)
    country = Column(String, nullable=True)

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="analytics")
    publication = relationship("Publication", back_populates="analytics")

class Share(Base):
    __tablename__ = "shares"

    id = Column(Integer, primary_key=True, index=True)
    share_type = Column(String, nullable=False)  # 'link', 'embed', 'social'
    platform = Column(String, nullable=True)    # 'facebook', 'twitter', 'email', etc.
    publication_id = Column(Integer, ForeignKey("publications.id"), nullable=False)

    # Share data
    share_url = Column(String, nullable=True)
    embed_code = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    # Analytics
    click_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    publication = relationship("Publication", back_populates="shares")