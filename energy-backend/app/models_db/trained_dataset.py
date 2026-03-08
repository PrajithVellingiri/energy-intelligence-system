"""
TrainedDataset model - tracks which CSV datasets have been used for model training.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.models_db.database import Base


class TrainedDataset(Base):
    __tablename__ = "trained_datasets"

    id = Column(Integer, primary_key=True, index=True)
    data_hash = Column(String, unique=True, index=True, nullable=False)
    filename = Column(String, nullable=True)
    record_count = Column(Integer, nullable=False)
    lstm_val_loss = Column(Float, nullable=True)
    anomaly_count = Column(Integer, nullable=True)
    trained_at = Column(DateTime(timezone=True), server_default=func.now())
