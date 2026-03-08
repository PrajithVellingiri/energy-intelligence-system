"""
Isolation Forest-based anomaly detection for energy consumption.
Detects abnormal energy usage patterns with severity scoring.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pickle
import os
from typing import Tuple


class EnergyAnomalyDetector:
    """Detect anomalies in energy consumption using Isolation Forest."""
    
    def __init__(self, contamination: float = 0.05, random_state: int = 42):
        self.contamination = contamination
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=100,
            max_samples="auto",
        )
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """Extract features for anomaly detection."""
        features = pd.DataFrame()
        features["energy_kwh"] = df["energy_kwh"]
        features["hour_of_day"] = pd.to_datetime(df["timestamp"]).dt.hour
        features["day_of_week"] = pd.to_datetime(df["timestamp"]).dt.dayofweek
        return features[["energy_kwh", "hour_of_day", "day_of_week"]].values
    
    def fit(self, df: pd.DataFrame):
        """Fit the anomaly detection model."""
        features = self.prepare_features(df)
        scaled_features = self.scaler.fit_transform(features)
        self.model.fit(scaled_features)
        self.is_fitted = True
        print(f"Anomaly detector fitted on {len(df)} samples")
    
    def detect(self, df: pd.DataFrame) -> pd.DataFrame:
        """Detect anomalies and return results with severity scores."""
        if not self.is_fitted:
            raise ValueError("Model not fitted. Call fit() first.")
        
        features = self.prepare_features(df)
        scaled_features = self.scaler.transform(features)
        
        # Get predictions (-1 = anomaly, 1 = normal)
        predictions = self.model.predict(scaled_features)
        
        # Get anomaly scores (more negative = more anomalous)
        scores = self.model.decision_function(scaled_features)
        
        # Convert to severity score (0-1, higher = more anomalous)
        min_score = scores.min()
        max_score = scores.max()
        score_range = max_score - min_score if max_score != min_score else 1.0
        severity = 1.0 - (scores - min_score) / score_range
        
        result = pd.DataFrame({
            "timestamp": df["timestamp"].values,
            "energy_kwh": df["energy_kwh"].values,
            "is_anomaly": predictions == -1,
            "severity_score": np.round(severity, 4),
        })
        
        n_anomalies = result["is_anomaly"].sum()
        print(f"Detected {n_anomalies} anomalies out of {len(result)} samples ({100*n_anomalies/len(result):.1f}%)")
        
        return result
    
    def save_model(self, path: str):
        """Save model and scaler to disk."""
        with open(path, "wb") as f:
            pickle.dump({
                "model": self.model,
                "scaler": self.scaler,
                "contamination": self.contamination,
            }, f)
        print(f"Anomaly detector saved to {path}")
    
    def load_model(self, path: str):
        """Load model and scaler from disk."""
        with open(path, "rb") as f:
            data = pickle.load(f)
        self.model = data["model"]
        self.scaler = data["scaler"]
        self.contamination = data["contamination"]
        self.is_fitted = True
        print(f"Anomaly detector loaded from {path}")
