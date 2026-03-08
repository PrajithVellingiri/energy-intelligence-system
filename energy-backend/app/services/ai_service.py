"""
AI Service Layer.
Loads trained models at startup and provides inference methods.
CSV-driven: analytics are generated per-upload, and new data trains the model
only if it hasn't been seen before and the model hasn't reached optimal accuracy.
"""

import sys
import os
import hashlib
import numpy as np
import pandas as pd
from typing import Dict, Optional

from app.config import (
    LSTM_MODEL_PATH,
    FORECAST_SCALER_PATH,
    ANOMALY_MODEL_PATH,
    AI_DIR,
    CHECKPOINT_DIR,
)

# Add AI directory to path so we can import AI modules
if AI_DIR not in sys.path:
    sys.path.insert(0, AI_DIR)

from models.lstm_forecaster import LSTMForecaster, LSTMTrainer
from models.anomaly_detector import EnergyAnomalyDetector
from optimization.load_optimizer import LoadOptimizer
from scoring.energy_score import EnergyHealthScorer
from preprocessing.pipeline import EnergyDataPreprocessor
from preprocessing.csv_analyzer import SmartCSVAnalyzer
from scoring.anomaly_fixes import AnomalyFixSuggester

# Training accuracy thresholds
OPTIMAL_LSTM_VAL_LOSS = 0.005  # MSE threshold below which we consider the model optimal
TRAINING_EPOCHS = 50
TRAINING_PATIENCE = 10
TRAINING_BATCH_SIZE = 64


def compute_data_hash(df: pd.DataFrame) -> str:
    """Compute a SHA-256 hash of a DataFrame's content for deduplication."""
    content = pd.util.hash_pandas_object(df, index=False).values.tobytes()
    return hashlib.sha256(content).hexdigest()


class AIService:
    """Singleton service that manages all AI models."""

    def __init__(self):
        self.forecaster: Optional[LSTMTrainer] = None
        self.preprocessor: Optional[EnergyDataPreprocessor] = None
        self.anomaly_detector: Optional[EnergyAnomalyDetector] = None
        self.optimizer: Optional[LoadOptimizer] = None
        self.scorer: Optional[EnergyHealthScorer] = None
        self._loaded = False
        self.current_val_loss: Optional[float] = None

    def load_models(self):
        """Load all trained models from checkpoints."""
        if self._loaded:
            return

        print("Loading AI models...")

        # Load LSTM forecaster
        self.preprocessor = EnergyDataPreprocessor(lookback=24)
        if os.path.exists(FORECAST_SCALER_PATH):
            self.preprocessor.load_scaler(FORECAST_SCALER_PATH)

        if os.path.exists(LSTM_MODEL_PATH):
            model = LSTMForecaster(input_size=1, hidden_size=64, num_layers=2, dropout=0.2)
            self.forecaster = LSTMTrainer(model)
            self.forecaster.load_model(LSTM_MODEL_PATH)
            print("  LSTM forecaster loaded")

        # Load anomaly detector
        self.anomaly_detector = EnergyAnomalyDetector()
        if os.path.exists(ANOMALY_MODEL_PATH):
            self.anomaly_detector.load_model(ANOMALY_MODEL_PATH)
            print("  Anomaly detector loaded")

        # Initialize optimizer and scorer (no model files needed)
        self.optimizer = LoadOptimizer()
        self.scorer = EnergyHealthScorer()
        print("  Optimizer and scorer initialized")

        self._loaded = True
        print("All AI models loaded successfully!")

    @property
    def is_model_optimal(self) -> bool:
        """Check if the model has reached optimal accuracy."""
        if self.current_val_loss is not None and self.current_val_loss <= OPTIMAL_LSTM_VAL_LOSS:
            return True
        return False

    def train_with_data(self, normalized_df: pd.DataFrame) -> Dict:
        """
        Train/fine-tune models with new data.
        Returns training results including whether training was performed and metrics.
        """
        if self.is_model_optimal:
            return {
                "trained": False,
                "reason": "Model has already reached optimal accuracy",
                "current_val_loss": self.current_val_loss,
                "threshold": OPTIMAL_LSTM_VAL_LOSS,
            }

        if len(normalized_df) < 48:
            return {
                "trained": False,
                "reason": f"Dataset too small for training ({len(normalized_df)} records, need at least 48)",
            }

        print(f"Training models with {len(normalized_df)} records...")

        training_result: Dict = {"trained": True}

        # Train LSTM forecaster
        try:
            preprocessor = EnergyDataPreprocessor(lookback=24)
            energy_values = normalized_df["energy_kwh"].values
            scaled_data = preprocessor.fit_transform(energy_values)

            X, y = preprocessor.create_sequences(scaled_data)
            if len(X) < 10:
                training_result["lstm"] = {"trained": False, "reason": "Not enough sequences"}
            else:
                split_idx = max(int(len(X) * 0.8), 1)
                X_train, X_val = X[:split_idx], X[split_idx:]
                y_train, y_val = y[:split_idx], y[split_idx:]

                if len(X_val) == 0:
                    X_val = X_train[-2:]
                    y_val = y_train[-2:]

                model = LSTMForecaster(input_size=1, hidden_size=64, num_layers=2, dropout=0.2)
                trainer = LSTMTrainer(model, learning_rate=0.001)

                history = trainer.train(
                    X_train, y_train,
                    X_val, y_val,
                    epochs=TRAINING_EPOCHS,
                    batch_size=TRAINING_BATCH_SIZE,
                    patience=TRAINING_PATIENCE,
                )

                best_val_loss = history["best_val_loss"]
                self.current_val_loss = best_val_loss

                # Save model and update running instance
                os.makedirs(CHECKPOINT_DIR, exist_ok=True)
                trainer.save_model(LSTM_MODEL_PATH)
                preprocessor.save_scaler(FORECAST_SCALER_PATH)

                self.forecaster = trainer
                self.preprocessor = preprocessor

                training_result["lstm"] = {
                    "trained": True,
                    "best_val_loss": round(best_val_loss, 6),
                    "epochs_trained": history["epochs_trained"],
                    "optimal": best_val_loss <= OPTIMAL_LSTM_VAL_LOSS,
                }

                print(f"  LSTM trained: val_loss={best_val_loss:.6f}, epochs={history['epochs_trained']}")

        except Exception as e:
            training_result["lstm"] = {"trained": False, "error": str(e)}
            print(f"  LSTM training error: {e}")

        # Train anomaly detector
        try:
            detector = EnergyAnomalyDetector(contamination=0.05)
            detect_df = normalized_df[["timestamp", "energy_kwh"]].copy()
            detector.fit(detect_df)

            results = detector.detect(detect_df)
            n_anomalies = int(results["is_anomaly"].sum())

            os.makedirs(CHECKPOINT_DIR, exist_ok=True)
            detector.save_model(ANOMALY_MODEL_PATH)
            self.anomaly_detector = detector

            training_result["anomaly_detector"] = {
                "trained": True,
                "anomalies_found": n_anomalies,
                "total_records": len(detect_df),
            }

            print(f"  Anomaly detector trained: {n_anomalies} anomalies in {len(detect_df)} records")

        except Exception as e:
            training_result["anomaly_detector"] = {"trained": False, "error": str(e)}
            print(f"  Anomaly detector training error: {e}")

        return training_result

    def analyze_user_dataset(self, raw_df: pd.DataFrame) -> Dict:
        """Analyze a user-uploaded CSV dataset through the full AI pipeline."""
        # Step 1: Smart CSV analysis and normalization
        analyzer = SmartCSVAnalyzer()
        normalized_df, detection_info = analyzer.analyze_and_normalize(raw_df)

        if len(normalized_df) < 24:
            raise ValueError(
                f"Dataset too small after normalization ({len(normalized_df)} records). "
                "Need at least 24 hourly records for analysis."
            )

        # Step 2: Forecast using LSTM
        forecast_result = None
        if self.forecaster is not None and self.preprocessor is not None:
            try:
                recent_data = normalized_df["energy_kwh"].values[-24:]
                scaled_data = self.preprocessor.transform(recent_data)
                predictions_scaled = self.forecaster.forecast_multistep(scaled_data, n_steps=24)
                predictions = self.preprocessor.inverse_transform(predictions_scaled)
                predictions = np.maximum(predictions, 0)

                last_ts = normalized_df["timestamp"].iloc[-1]
                forecast_timestamps = pd.date_range(
                    start=last_ts + pd.Timedelta(hours=1),
                    periods=24,
                    freq="h",
                )

                history_hours = min(72, len(normalized_df))
                historical = normalized_df.tail(history_hours)

                forecast_result = {
                    "forecast": [
                        {"timestamp": ts.isoformat(), "predicted_kwh": round(float(val), 2)}
                        for ts, val in zip(forecast_timestamps, predictions)
                    ],
                    "historical": [
                        {"timestamp": row["timestamp"].isoformat(), "energy_kwh": round(float(row["energy_kwh"]), 2)}
                        for _, row in historical.iterrows()
                    ],
                    "summary": {
                        "forecast_hours": 24,
                        "avg_predicted_kwh": round(float(predictions.mean()), 2),
                        "max_predicted_kwh": round(float(predictions.max()), 2),
                        "min_predicted_kwh": round(float(predictions.min()), 2),
                    },
                }
            except Exception as e:
                forecast_result = {"error": str(e)}

        # Step 3: Anomaly detection
        anomaly_result = None
        anomaly_raw = None
        if self.anomaly_detector is not None and self.anomaly_detector.is_fitted:
            try:
                detect_df = normalized_df[["timestamp", "energy_kwh"]].copy()
                detect_df = detect_df.reset_index(drop=True)
                anomaly_raw = self.anomaly_detector.detect(detect_df)

                anomalies_only = anomaly_raw[anomaly_raw["is_anomaly"]]
                total_records = len(anomaly_raw)
                total_anomalies = len(anomalies_only)

                anomaly_result = {
                    "anomalies": [
                        {
                            "timestamp": str(row["timestamp"]),
                            "energy_kwh": round(float(row["energy_kwh"]), 2),
                            "severity_score": round(float(row["severity_score"]), 4),
                        }
                        for _, row in anomalies_only.iterrows()
                    ],
                    "all_data": [
                        {
                            "timestamp": str(row["timestamp"]),
                            "energy_kwh": round(float(row["energy_kwh"]), 2),
                            "is_anomaly": bool(row["is_anomaly"]),
                            "severity_score": round(float(row["severity_score"]), 4),
                        }
                        for _, row in anomaly_raw.iterrows()
                    ],
                    "summary": {
                        "total_records": total_records,
                        "total_anomalies": total_anomalies,
                        "anomaly_rate": round(total_anomalies / total_records * 100, 2) if total_records > 0 else 0,
                        "avg_severity": round(float(anomalies_only["severity_score"].mean()), 4) if total_anomalies > 0 else 0,
                        "max_severity": round(float(anomalies_only["severity_score"].max()), 4) if total_anomalies > 0 else 0,
                    },
                }
            except Exception as e:
                anomaly_result = {"error": str(e)}

        # Step 4: Anomaly fix suggestions
        fix_suggestions = None
        if anomaly_raw is not None:
            try:
                suggester = AnomalyFixSuggester()
                fix_suggestions = suggester.suggest_fixes(anomaly_raw, normalized_df)
            except Exception as e:
                fix_suggestions = {"error": str(e)}

        # Step 5: Load optimization
        optimization_result = None
        if self.optimizer is not None:
            try:
                optimization_result = self.optimizer.analyze(normalized_df)
            except Exception as e:
                optimization_result = {"error": str(e)}

        # Step 6: Energy health score
        health_score_result = None
        if self.scorer is not None:
            try:
                health_score_result = self.scorer.calculate(normalized_df, anomaly_raw)
            except Exception as e:
                health_score_result = {"error": str(e)}

        # Step 7: Dashboard summary from uploaded data
        recent = normalized_df.tail(24)
        dashboard_summary = {
            "current_consumption": round(float(recent["energy_kwh"].iloc[-1]), 2),
            "avg_24h": round(float(recent["energy_kwh"].mean()), 2),
            "max_24h": round(float(recent["energy_kwh"].max()), 2),
            "min_24h": round(float(recent["energy_kwh"].min()), 2),
            "total_records": len(normalized_df),
            "date_range": {
                "start": str(normalized_df["timestamp"].iloc[0]),
                "end": str(normalized_df["timestamp"].iloc[-1]),
            },
        }

        return {
            "detected_columns": detection_info,
            "dashboard_summary": dashboard_summary,
            "analysis": {
                "forecast": forecast_result,
                "anomalies": anomaly_result,
                "optimization": optimization_result,
                "health_score": health_score_result,
            },
            "fix_suggestions": fix_suggestions,
        }


# Global AI service instance
ai_service = AIService()
