from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.database import get_db, engine
from core.config import settings
from core.database import Base
import uvicorn

# Import routers
from app.routers import auth, publications, templates, analytics, collaboration, upload

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Flipsnack Alternative API",
    description="A comprehensive digital publishing platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Add request logging here
    response = await call_next(request)
    return response

# Exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(publications.router, prefix="/api/publications", tags=["publications"])
app.include_router(templates.router, prefix="/api/templates", tags=["templates"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(collaboration.router, prefix="/api/collaboration", tags=["collaboration"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])

@app.get("/")
async def root():
    return {"message": "Flipsnack Alternative API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)