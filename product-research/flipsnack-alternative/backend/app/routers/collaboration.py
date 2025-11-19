from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from core.database import get_db
from models import Team, TeamMember, TeamPublication, User, Publication, Comment, PermissionLevel
from .auth import get_current_user
from .publications import get_publication as get_pub_by_id

router = APIRouter()

# Pydantic models
class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    max_members: int = 10
    can_create_publications: bool = True

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_members: Optional[int] = None
    can_create_publications: Optional[bool] = None

class TeamResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    max_members: int
    can_create_publications: bool
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TeamMemberCreate(BaseModel):
    user_email: str
    role: PermissionLevel = PermissionLevel.VIEWER

class TeamMemberUpdate(BaseModel):
    role: Optional[PermissionLevel] = None
    is_active: Optional[bool] = None

class TeamMemberResponse(BaseModel):
    id: int
    user_id: int
    team_id: int
    role: PermissionLevel
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str
    page_number: int
    position: Optional[dict] = None
    parent_id: Optional[int] = None

class CommentResponse(BaseModel):
    id: int
    content: str
    page_number: int
    position: Optional[dict]
    is_resolved: bool
    parent_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    user_id: int
    publication_id: int

    class Config:
        from_attributes = True

# Helper functions
def get_team_by_id(team_id: int, user_id: int, db: Session) -> Team:
    """Get team and verify user is owner"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    if team.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owner can perform this action"
        )

    return team

def get_team_member_by_id(team_id: int, member_id: int, user_id: int, db: Session) -> TeamMember:
    """Get team member and verify user has access"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Check if user is owner or member
    if team.owner_id != user_id:
        member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id,
            TeamMember.is_active == True
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    team_member = db.query(TeamMember).filter(
        TeamMember.id == member_id,
        TeamMember.team_id == team_id
    ).first()

    if not team_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )

    return team_member

# Team routes
@router.post("/teams", response_model=TeamResponse)
async def create_team(
    team: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_team = Team(
        name=team.name,
        description=team.description,
        max_members=team.max_members,
        can_create_publications=team.can_create_publications,
        owner_id=current_user.id
    )

    db.add(db_team)
    db.commit()
    db.refresh(db_team)

    return db_team

@router.get("/teams", response_model=List[TeamResponse])
async def get_user_teams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all teams where user is owner or member"""
    teams = db.query(Team).filter(Team.owner_id == current_user.id).all()

    # Also get teams where user is a member
    member_teams = db.query(Team).join(TeamMember).filter(
        TeamMember.user_id == current_user.id,
        TeamMember.is_active == True
    ).all()

    # Combine and remove duplicates
    all_teams = list(set(teams + member_teams))
    return all_teams

@router.get("/teams/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Check if user is owner or member
    if team.owner_id != current_user.id:
        member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_user.id,
            TeamMember.is_active == True
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    return team

@router.put("/teams/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int,
    team_update: TeamUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team = get_team_by_id(team_id, current_user.id, db)

    # Update fields
    update_data = team_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(team, field, value)

    db.commit()
    db.refresh(team)
    return team

@router.delete("/teams/{team_id}")
async def delete_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team = get_team_by_id(team_id, current_user.id, db)

    db.delete(team)
    db.commit()

    return {"message": "Team deleted successfully"}

# Team member routes
@router.post("/teams/{team_id}/members", response_model=TeamMemberResponse)
async def add_team_member(
    team_id: int,
    member: TeamMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team = get_team_by_id(team_id, current_user.id, db)

    # Check if team has space
    current_members = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.is_active == True
    ).count()

    if current_members >= team.max_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team has reached maximum number of members"
        )

    # Find user by email
    user = db.query(User).filter(User.email == member.user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if user is already a member
    existing_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user.id
    ).first()

    if existing_member:
        # Reactivate if inactive
        if not existing_member.is_active:
            existing_member.is_active = True
            existing_member.role = member.role
            db.commit()
            db.refresh(existing_member)
            return existing_member
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a team member"
            )

    # Add new member
    db_member = TeamMember(
        team_id=team_id,
        user_id=user.id,
        role=member.role
    )

    db.add(db_member)
    db.commit()
    db.refresh(db_member)

    return db_member

@router.get("/teams/{team_id}/members", response_model=List[TeamMemberResponse])
async def get_team_members(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Check if user is owner or member
    if team.owner_id != current_user.id:
        member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_user.id,
            TeamMember.is_active == True
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    members = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.is_active == True
    ).all()

    return members

@router.put("/teams/{team_id}/members/{member_id}", response_model=TeamMemberResponse)
async def update_team_member(
    team_id: int,
    member_id: int,
    member_update: TeamMemberUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team_member = get_team_member_by_id(team_id, member_id, current_user.id, db)

    # Update fields
    update_data = member_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(team_member, field, value)

    db.commit()
    db.refresh(team_member)
    return team_member

@router.delete("/teams/{team_id}/members/{member_id}")
async def remove_team_member(
    team_id: int,
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team_member = get_team_member_by_id(team_id, member_id, current_user.id, db)

    # Deactivate instead of delete
    team_member.is_active = False
    db.commit()

    return {"message": "Team member removed successfully"}

# Publication collaboration routes
@router.post("/publications/{publication_id}/share/{team_id}")
async def share_publication_with_team(
    publication_id: int,
    team_id: int,
    permission_level: PermissionLevel = PermissionLevel.EDITOR,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user owns the publication
    publication = db.query(Publication).filter(
        Publication.id == publication_id,
        Publication.owner_id == current_user.id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    # Check if user is team owner
    team = get_team_by_id(team_id, current_user.id, db)

    # Check if already shared
    existing_share = db.query(TeamPublication).filter(
        TeamPublication.team_id == team_id,
        TeamPublication.publication_id == publication_id
    ).first()

    if existing_share:
        existing_share.permission_level = permission_level
        db.commit()
        return {"message": "Publication share updated"}
    else:
        # Create new share
        team_pub = TeamPublication(
            team_id=team_id,
            publication_id=publication_id,
            permission_level=permission_level
        )

        db.add(team_pub)
        db.commit()

        return {"message": "Publication shared with team successfully"}

# Comment routes
@router.post("/publications/{publication_id}/comments", response_model=CommentResponse)
async def create_comment(
    publication_id: int,
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has access to publication
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    # Check if user owns publication or has team access
    if publication.owner_id != current_user.id:
        # Check team access
        team_access = db.query(TeamPublication).join(TeamMember).filter(
            TeamPublication.publication_id == publication_id,
            TeamMember.user_id == current_user.id,
            TeamMember.is_active == True
        ).first()

        if not team_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    db_comment = Comment(
        publication_id=publication_id,
        user_id=current_user.id,
        page_number=comment.page_number,
        content=comment.content,
        position=comment.position,
        parent_id=comment.parent_id
    )

    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    return db_comment

@router.get("/publications/{publication_id}/comments", response_model=List[CommentResponse])
async def get_publication_comments(
    publication_id: int,
    page_number: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user has access to publication
    publication = db.query(Publication).filter(
        Publication.id == publication_id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    # Check if user owns publication or has team access
    if publication.owner_id != current_user.id:
        # Check team access
        team_access = db.query(TeamPublication).join(TeamMember).filter(
            TeamPublication.publication_id == publication_id,
            TeamMember.user_id == current_user.id,
            TeamMember.is_active == True
        ).first()

        if not team_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    query = db.query(Comment).filter(Comment.publication_id == publication_id)

    if page_number:
        query = query.filter(Comment.page_number == page_number)

    comments = query.order_by(Comment.created_at.desc()).all()
    return comments

@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    content: str,
    is_resolved: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Only comment author can update content
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own comments"
        )

    comment.content = content
    if is_resolved is not None:
        comment.is_resolved = is_resolved

    db.commit()
    db.refresh(comment)

    return comment

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Only comment author can delete
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )

    db.delete(comment)
    db.commit()

    return {"message": "Comment deleted successfully"}