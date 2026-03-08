"""
AnalysisReport model - stores persisted analysis results linked to a user.
Each report is an independent snapshot of a CSV analysis.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.models_db.database import Base


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    data_hash = Column(String, nullable=False)
    record_count = Column(Integer, nullable=False)
    # Store the full analysis result as JSON text
    result_json = Column(Text, nullable=False)
    # Summary fields for quick display in the report list
    avg_24h = Column(Float, nullable=True)
    max_24h = Column(Float, nullable=True)
    health_score = Column(Float, nullable=True)
    health_grade = Column(String, nullable=True)
    anomaly_count = Column(Integer, nullable=True)
    total_records = Column(Integer, nullable=True)
    date_range_start = Column(String, nullable=True)
    date_range_end = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
