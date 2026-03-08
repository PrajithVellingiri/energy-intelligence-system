"""
Application configuration.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "energy-platform-hackathon-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./energy_platform.db")

# AI Model Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AI_DIR = os.path.join(os.path.dirname(BASE_DIR), "AI")
CHECKPOINT_DIR = os.path.join(AI_DIR, "checkpoints")
DATA_DIR = os.path.join(AI_DIR, "data")

LSTM_MODEL_PATH = os.path.join(CHECKPOINT_DIR, "lstm_forecaster.pth")
FORECAST_SCALER_PATH = os.path.join(CHECKPOINT_DIR, "forecast_scaler.pkl")
ANOMALY_MODEL_PATH = os.path.join(CHECKPOINT_DIR, "anomaly_detector.pkl")
ENERGY_DATA_PATH = os.path.join(DATA_DIR, "energy_data.csv")

# Export CHECKPOINT_DIR for use in ai_service training
