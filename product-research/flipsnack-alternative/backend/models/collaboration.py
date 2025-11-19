from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import enum

class PermissionLevel(enum.Enum):
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"
    COMMENTER = "commenter"

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Team settings
    max_members = Column(Integer, default=10)
    can_create_publications = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id])
    members = relationship("TeamMember", back_populates="team")
    publications = relationship("TeamPublication", back_populates="team")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(PermissionLevel), default=PermissionLevel.VIEWER)
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="teams")

class TeamPublication(Base):
    __tablename__ = "team_publications"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    publication_id = Column(Integer, ForeignKey("publications.id"), nullable=False)
    permission_level = Column(Enum(PermissionLevel), default=PermissionLevel.EDITOR)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    team = relationship("Team", back_populates="publications")
    publication = relationship("Publication")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    publication_id = Column(Integer, ForeignKey("publications.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    page_number = Column(Integer, nullable=False)

    # Comment content
    content = Column(Text, nullable=False)
    position = Column(JSON, nullable=True)  # {x: 100, y: 200}
    is_resolved = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    publication = relationship("Publication")
    user = relationship("User")
    parent = relationship("Comment", remote_side=[id])
    replies = relationship("Comment")