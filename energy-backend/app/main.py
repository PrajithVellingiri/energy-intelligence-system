from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(auth_router)
app.include_router(ai_router)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
