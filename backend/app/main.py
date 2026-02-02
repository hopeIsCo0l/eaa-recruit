"""
FastAPI main application for EAA Recruit platform.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.routers import recruitment, auth, admin
from app.database import engine, Base
from app.models.user import User  # Import to register model

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EAA Recruit API",
    description="AI-Powered Recruitment Automation Platform for Ethiopian Airlines",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(recruitment.router, prefix="/api", tags=["recruitment"])
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "EAA Recruit API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
