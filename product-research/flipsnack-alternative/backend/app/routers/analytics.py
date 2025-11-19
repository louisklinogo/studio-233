from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import uuid

from core.database import get_db
from models import Analytics, Publication, User, Share
from .auth import get_current_user

router = APIRouter()

# Pydantic models
class AnalyticsEvent(BaseModel):
    event_type: str
    publication_id: int
    page_number: Optional[int] = None
    element_id: Optional[str] = None
    element_type: Optional[str] = None
    duration: Optional[float] = None
    coordinates: Optional[Dict[str, float]] = None

class AnalyticsResponse(BaseModel):
    total_views: int
    unique_views: int
    avg_time_per_page: float
    top_pages: List[Dict[str, Any]]
    device_breakdown: Dict[str, int]
    daily_views: List[Dict[str, Any]]

class ShareCreate(BaseModel):
    share_type: str
    platform: Optional[str] = None
    publication_id: int

class ShareResponse(BaseModel):
    id: int
    share_type: str
    platform: Optional[str]
    share_url: Optional[str]
    embed_code: Optional[str]
    click_count: int
    created_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True

# Helper functions
def get_client_info(request: Request) -> Dict[str, str]:
    """Extract client information from request"""
    user_agent = request.headers.get("user-agent", "")
    x_forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = x_forwarded_for.split(",")[0] if x_forwarded_for else request.client.host

    # Simple device detection
    if "Mobile" in user_agent:
        device_type = "mobile"
    elif "Tablet" in user_agent:
        device_type = "tablet"
    else:
        device_type = "desktop"

    # Simple browser detection
    browser = "unknown"
    if "Chrome" in user_agent:
        browser = "chrome"
    elif "Firefox" in user_agent:
        browser = "firefox"
    elif "Safari" in user_agent:
        browser = "safari"

    return {
        "device_type": device_type,
        "browser": browser,
        "ip": client_ip
    }

# Public routes (no authentication required)
@router.post("/track")
async def track_event(
    event: AnalyticsEvent,
    request: Request,
    session_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Public endpoint for tracking analytics events"""

    # Verify publication exists and is public
    publication = db.query(Publication).filter(
        Publication.id == event.publication_id,
        Publication.is_published == True,
        Publication.is_public == True
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    # Generate session ID if not provided
    if not session_id:
        session_id = str(uuid.uuid4())

    # Get client info
    client_info = get_client_info(request)

    # Create analytics event
    analytics_event = Analytics(
        event_type=event.event_type,
        session_id=session_id,
        publication_id=event.publication_id,
        page_number=event.page_number,
        element_id=event.element_id,
        element_type=event.element_type,
        duration=event.duration,
        coordinates=event.coordinates,
        device_type=client_info["device_type"],
        browser=client_info["browser"],
        referrer=request.headers.get("referer")
    )

    db.add(analytics_event)

    # Update view count
    if event.event_type == "view":
        publication.view_count += 1

    db.commit()

    return {"message": "Event tracked successfully", "session_id": session_id}

@router.get("/public/{publication_slug}/embed")
async def get_embed_data(
    publication_slug: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get publication data for embedding"""

    publication = db.query(Publication).filter(
        Publication.slug == publication_slug,
        Publication.is_published == True,
        Publication.is_public == True
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    # Track embed view
    client_info = get_client_info(request)
    session_id = str(uuid.uuid4())

    analytics_event = Analytics(
        event_type="embed_view",
        session_id=session_id,
        publication_id=publication.id,
        device_type=client_info["device_type"],
        browser=client_info["browser"],
        referrer=request.headers.get("referer")
    )

    db.add(analytics_event)
    publication.view_count += 1
    db.commit()

    return {
        "publication": {
            "id": publication.id,
            "title": publication.title,
            "slug": publication.slug,
            "page_count": publication.page_count,
            "theme": publication.theme
        }
    }

# Protected routes (authentication required)
@router.get("/{publication_id}/summary", response_model=AnalyticsResponse)
async def get_analytics_summary(
    publication_id: int,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics summary for a publication"""

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

    # Date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Total views
    total_views = db.query(Analytics).filter(
        Analytics.publication_id == publication_id,
        Analytics.event_type == "view",
        Analytics.created_at >= start_date
    ).count()

    # Unique views (by session)
    unique_views = db.query(Analytics.session_id).filter(
        Analytics.publication_id == publication_id,
        Analytics.event_type == "view",
        Analytics.created_at >= start_date
    ).distinct().count()

    # Average time per page
    avg_time_result = db.query(func.avg(Analytics.duration)).filter(
        Analytics.publication_id == publication_id,
        Analytics.event_type == "page_flip",
        Analytics.created_at >= start_date
    ).scalar()
    avg_time_per_page = avg_time_result or 0

    # Top pages
    top_pages = db.query(
        Analytics.page_number,
        func.count(Analytics.id).label('views')
    ).filter(
        Analytics.publication_id == publication_id,
        Analytics.event_type == "view",
        Analytics.created_at >= start_date
    ).group_by(Analytics.page_number).order_by(desc('views')).limit(5).all()

    top_pages_data = [{"page": page, "views": views} for page, views in top_pages]

    # Device breakdown
    device_stats = db.query(
        Analytics.device_type,
        func.count(Analytics.id).label('count')
    ).filter(
        Analytics.publication_id == publication_id,
        Analytics.created_at >= start_date
    ).group_by(Analytics.device_type).all()

    device_breakdown = {device: count for device, count in device_stats}

    # Daily views
    daily_views = db.query(
        func.date(Analytics.created_at).label('date'),
        func.count(Analytics.id).label('views')
    ).filter(
        Analytics.publication_id == publication_id,
        Analytics.event_type == "view",
        Analytics.created_at >= start_date
    ).group_by(func.date(Analytics.created_at)).order_by('date').all()

    daily_views_data = [{"date": date.strftime("%Y-%m-%d"), "views": views} for date, views in daily_views]

    return AnalyticsResponse(
        total_views=total_views,
        unique_views=unique_views,
        avg_time_per_page=avg_time_per_page,
        top_pages=top_pages_data,
        device_breakdown=device_breakdown,
        daily_views=daily_views_data
    )

@router.post("/share", response_model=ShareResponse)
async def create_share(
    share: ShareCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a share link or embed code"""

    # Check if user owns the publication
    publication = db.query(Publication).filter(
        Publication.id == share.publication_id,
        Publication.owner_id == current_user.id
    ).first()

    if not publication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )

    # Generate share URL
    import uuid
    share_token = str(uuid.uuid4())
    base_url = "https://yourdomain.com"  # Replace with actual domain
    share_url = f"{base_url}/view/{publication.slug}?token={share_token}"

    # Generate embed code
    embed_code = f"""
    <iframe
        src="{base_url}/embed/{publication.slug}?token={share_token}"
        width="100%"
        height="600px"
        frameborder="0"
        allowfullscreen>
    </iframe>
    """

    # Create share record
    db_share = Share(
        share_type=share.share_type,
        platform=share.platform,
        publication_id=share.publication_id,
        share_url=share_url,
        embed_code=embed_code
    )

    db.add(db_share)
    db.commit()
    db.refresh(db_share)

    return db_share

@router.get("/shares/{publication_id}", response_model=List[ShareResponse])
async def get_shares(
    publication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all shares for a publication"""

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

    shares = db.query(Share).filter(Share.publication_id == publication_id).all()
    return shares