from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_URL
from app.models_db.database import init_db
from app.routes.auth_routes import router as auth_router
from app.routes.ai_routes import router as ai_router
from app.services.ai_service import ai_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup: initialize DB and load AI models
    await init_db()
    ai_service.load_models()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="AI Energy Intelligence Platform",
    description="AI-powered energy consumption analytics, forecasting, and optimization",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for local development and production deployment
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

if FRONTEND_URL:
    for url in FRONTEND_URL.split(","):
        cleaned = url.strip()
        if cleaned:
            origins.append(cleaned)
            origins.append(cleaned.rstrip("/"))

# If no specific frontend URL is provided in development, allow all origins
cors_origins = ["*"] if not FRONTEND_URL else list(set(origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(ai_router)


@app.get("/health")
async def health():
    """Production health check endpoint."""
    return {"status": "ok"}


@app.get("/healthz")
async def healthz():
    """Legacy health check endpoint."""
    return {"status": "ok"}

