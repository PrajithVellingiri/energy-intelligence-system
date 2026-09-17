"""
Synthetic energy consumption dataset generator.
Generates realistic hourly energy data with seasonality, trends, and anomalies.
"""

import numpy as np
import pandas as pd
import os

def generate_energy_dataset(
    start_date: str = "2023-01-01",
    end_date: str = "2024-12-31",
    output_path: str = None,
) -> pd.DataFrame:
    """Generate realistic hourly energy consumption dataset."""
    dates = pd.date_range(start=start_date, end=end_date, freq="h")
    n = len(dates)
    
    np.random.seed(42)
    
    # Base daily pattern (sinusoidal + peak at 18:00)
    hours = dates.hour.values
    daily_pattern = 20 + 15 * np.sin((hours - 6) * np.pi / 12) ** 2
    
    # Weekly pattern (lower on weekends)
    day_of_week = dates.dayofweek.values
    weekend_factor = np.where(day_of_week >= 5, 0.75, 1.0)
    
    # Yearly seasonal pattern (higher in summer/winter due to HVAC)
    day_of_year = dates.dayofyear.values
    seasonal_pattern = 5 * np.cos(day_of_year * 2 * np.pi / 365) + 3 * np.sin(day_of_year * 4 * np.pi / 365)
    
    # Noise
    noise = np.random.normal(0, 2.5, n)
    
    # Temperature & environmental factors
    temp = 20 + 12 * np.sin((day_of_year - 100) * 2 * np.pi / 365) + 5 * np.sin((hours - 8) * np.pi / 12) + np.random.normal(0, 1.5, n)
    humidity = np.clip(60 - (temp - 20) * 1.2 + np.random.normal(0, 5, n), 20, 95)
    wind_speed = np.clip(np.random.rayleigh(3.0, n), 0.5, 25)
    
    # Calculate energy
    energy_kwh = (daily_pattern * weekend_factor + seasonal_pattern + noise + np.maximum(0, (temp - 24) * 1.5))
    energy_kwh = np.maximum(5.0, energy_kwh)
    
    # Inject ~2% anomalies
    anomaly_indices = np.random.choice(n, size=int(n * 0.02), replace=False)
    energy_kwh[anomaly_indices] *= np.random.choice([0.2, 1.8, 2.3], size=len(anomaly_indices))
    
    # Sub-zones
    zone1 = energy_kwh * 0.45 + np.random.normal(0, 0.5, n)
    zone2 = energy_kwh * 0.35 + np.random.normal(0, 0.5, n)
    zone3 = energy_kwh * 0.20 + np.random.normal(0, 0.3, n)
    
    df = pd.DataFrame({
        "timestamp": dates,
        "energy_kwh": np.round(energy_kwh, 2),
        "temperature": np.round(temp, 1),
        "humidity": np.round(humidity, 1),
        "wind_speed": np.round(wind_speed, 1),
        "PowerConsumption_Zone1": np.round(np.maximum(0, zone1), 2),
        "PowerConsumption_Zone2": np.round(np.maximum(0, zone2), 2),
        "PowerConsumption_Zone3": np.round(np.maximum(0, zone3), 2),
    })
    
    if output_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Saved dataset to {output_path}")
        
    return df

if __name__ == "__main__":
    generate_energy_dataset(output_path="energy_data.csv")
