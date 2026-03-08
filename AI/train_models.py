"""
Master training script for all AI models.
Loads existing dataset (real or synthetic), trains LSTM forecaster, fits anomaly detector.
"""

import sys
import os
import numpy as np
import pandas as pd

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data.generate_dataset import generate_energy_dataset
from preprocessing.pipeline import EnergyDataPreprocessor
from models.lstm_forecaster import LSTMForecaster, LSTMTrainer
from models.anomaly_detector import EnergyAnomalyDetector


def train_all():
    """Train all AI models."""
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    checkpoint_dir = os.path.join(base_dir, "checkpoints")
    os.makedirs(checkpoint_dir, exist_ok=True)
    
    # ============================================================
    # Step 1: Load Dataset (use existing if available, else generate)
    # ============================================================
    print("=" * 60)
    print("STEP 1: Loading energy dataset...")
    print("=" * 60)
    
    data_path = os.path.join(data_dir, "energy_data.csv")
    if os.path.exists(data_path):
        df = pd.read_csv(data_path)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        print(f"Loaded existing dataset: {len(df)} records")
    else:
        df = generate_energy_dataset(
            start_date="2023-01-01",
            end_date="2024-12-31",
            output_path=data_path,
        )
        print(f"Generated synthetic dataset: {len(df)} records")
    print(f"Dataset: {len(df)} records\n")
    
    # ============================================================
    # Step 2: Train LSTM Forecaster
    # ============================================================
    print("=" * 60)
    print("STEP 2: Training LSTM Forecasting Model...")
    print("=" * 60)
    
    preprocessor = EnergyDataPreprocessor(lookback=24)
    clean_df = preprocessor.load_and_validate(data_path)
    
    # Scale data
    energy_values = clean_df["energy_kwh"].values
    scaled_data = preprocessor.fit_transform(energy_values)
    
    # Create sequences
    X, y = preprocessor.create_sequences(scaled_data)
    print(f"Sequences: X={X.shape}, y={y.shape}")
    
    # Train/validation split (80/20)
    split_idx = int(len(X) * 0.8)
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]
    
    print(f"Train: {X_train.shape[0]} samples, Val: {X_val.shape[0]} samples")
    
    # Create and train model
    model = LSTMForecaster(
        input_size=1,
        hidden_size=64,
        num_layers=2,
        dropout=0.2,
    )
    
    trainer = LSTMTrainer(model, learning_rate=0.001)
    
    history = trainer.train(
        X_train, y_train,
        X_val, y_val,
        epochs=50,
        batch_size=64,
        patience=10,
    )
    
    print(f"\nTraining complete! Best val loss: {history['best_val_loss']:.6f}")
    print(f"Epochs trained: {history['epochs_trained']}")
    
    # Save model and scaler
    trainer.save_model(os.path.join(checkpoint_dir, "lstm_forecaster.pth"))
    preprocessor.save_scaler(os.path.join(checkpoint_dir, "forecast_scaler.pkl"))
    
    # ============================================================
    # Step 3: Train Anomaly Detector
    # ============================================================
    print("\n" + "=" * 60)
    print("STEP 3: Training Anomaly Detection Model...")
    print("=" * 60)
    
    detector = EnergyAnomalyDetector(contamination=0.05)
    detector.fit(clean_df)
    
    # Run detection to verify
    results = detector.detect(clean_df)
    n_anomalies = results["is_anomaly"].sum()
    print(f"Anomalies detected: {n_anomalies} ({100*n_anomalies/len(results):.1f}%)")
    
    # Save model
    detector.save_model(os.path.join(checkpoint_dir, "anomaly_detector.pkl"))
    
    # ============================================================
    # Summary
    # ============================================================
    print("\n" + "=" * 60)
    print("TRAINING COMPLETE!")
    print("=" * 60)
    print(f"Checkpoints saved to: {checkpoint_dir}")
    print(f"Files:")
    for f in os.listdir(checkpoint_dir):
        fpath = os.path.join(checkpoint_dir, f)
        size = os.path.getsize(fpath)
        print(f"  - {f} ({size/1024:.1f} KB)")


if __name__ == "__main__":
    train_all()
