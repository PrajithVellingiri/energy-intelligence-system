"""
Data preprocessing pipeline for energy consumption data.
Handles validation, resampling, scaling, and sequence generation.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler, StandardScaler
import pickle
import os
from typing import Tuple, Optional


class EnergyDataPreprocessor:
    """Preprocess energy data for LSTM forecasting."""
    
    def __init__(self, lookback: int = 24):
        self.lookback = lookback
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.is_fitted = False
    
    def load_and_validate(self, filepath: str) -> pd.DataFrame:
        """Load CSV and validate data."""
        df = pd.read_csv(filepath)
        
        if "timestamp" not in df.columns or "energy_kwh" not in df.columns:
            raise ValueError("Dataset must contain 'timestamp' and 'energy_kwh' columns")
        
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp").reset_index(drop=True)
        
        # Remove duplicates
        df = df.drop_duplicates(subset=["timestamp"])
        
        # Resample to hourly frequency and interpolate missing values
        df = df.set_index("timestamp")
        df = df.resample("h").mean()
        df["energy_kwh"] = df["energy_kwh"].interpolate(method="linear")
        df = df.dropna().reset_index()
        
        return df
    
    def fit_transform(self, data: np.ndarray) -> np.ndarray:
        """Fit scaler and transform data."""
        reshaped = data.reshape(-1, 1)
        scaled = self.scaler.fit_transform(reshaped)
        self.is_fitted = True
        return scaled.flatten()
    
    def transform(self, data: np.ndarray) -> np.ndarray:
        """Transform data using fitted scaler."""
        if not self.is_fitted:
            raise ValueError("Scaler not fitted. Call fit_transform first.")
        reshaped = data.reshape(-1, 1)
        return self.scaler.transform(reshaped).flatten()
    
    def inverse_transform(self, data: np.ndarray) -> np.ndarray:
        """Inverse transform scaled data back to original scale."""
        reshaped = data.reshape(-1, 1)
        return self.scaler.inverse_transform(reshaped).flatten()
    
    def create_sequences(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Create sliding window sequences for LSTM training."""
        X, y = [], []
        for i in range(self.lookback, len(data)):
            X.append(data[i - self.lookback:i])
            y.append(data[i])
        return np.array(X), np.array(y)
    
    def save_scaler(self, path: str):
        """Save the fitted scaler to disk."""
        with open(path, "wb") as f:
            pickle.dump(self.scaler, f)
    
    def load_scaler(self, path: str):
        """Load a saved scaler from disk."""
        with open(path, "rb") as f:
            self.scaler = pickle.load(f)
            self.is_fitted = True


class AnomalyFeatureExtractor:
    """Extract features for anomaly detection."""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract time-based features for anomaly detection."""
        features = df.copy()
        features["hour_of_day"] = features["timestamp"].dt.hour
        features["day_of_week"] = features["timestamp"].dt.dayofweek
        return features
    
    def fit_transform(self, features: np.ndarray) -> np.ndarray:
        """Fit and transform features."""
        scaled = self.scaler.fit_transform(features)
        self.is_fitted = True
        return scaled
    
    def transform(self, features: np.ndarray) -> np.ndarray:
        """Transform features."""
        return self.scaler.transform(features)
    
    def save_scaler(self, path: str):
        with open(path, "wb") as f:
            pickle.dump(self.scaler, f)
    
    def load_scaler(self, path: str):
        with open(path, "rb") as f:
            self.scaler = pickle.load(f)
            self.is_fitted = True
