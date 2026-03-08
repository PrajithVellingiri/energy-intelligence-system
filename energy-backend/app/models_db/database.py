"""
Database setup with SQLAlchemy async engine.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import DATABASE_URL


engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def init_db():
    """Create all tables."""
    # Import all models so Base.metadata knows about them
    from app.models_db.user import User  # noqa: F401
    from app.models_db.trained_dataset import TrainedDataset  # noqa: F401
    from app.models_db.analysis_report import AnalysisReport  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """Dependency to get DB session."""
    async with async_session() as session:
        yield session
