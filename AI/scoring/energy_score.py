"""
Energy Health Score Calculator.
Provides an overall performance score for energy efficiency and sustainability.
"""

import numpy as np
import pandas as pd
from typing import Dict, Optional


class EnergyHealthScorer:
    """Calculate energy health score based on multiple metrics."""
    
    def __init__(
        self,
        weight_anomaly: float = 30.0,
        weight_peak_variance: float = 35.0,
        weight_carbon: float = 35.0,
        carbon_factor: float = 0.42,  # kg CO2 per kWh (US average grid)
    ):
        self.weight_anomaly = weight_anomaly
        self.weight_peak_variance = weight_peak_variance
        self.weight_carbon = weight_carbon
        self.carbon_factor = carbon_factor
    
    def calculate(
        self,
        df: pd.DataFrame,
        anomaly_results: pd.DataFrame = None,
    ) -> Dict:
        """Calculate the energy health score."""
        
        df = df.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        
        # 1. Anomaly Rate (0-1)
        if anomaly_results is not None and "is_anomaly" in anomaly_results.columns:
            anomaly_rate = anomaly_results["is_anomaly"].mean()
        else:
            # Simple statistical anomaly detection as fallback
            mean_kwh = df["energy_kwh"].mean()
            std_kwh = df["energy_kwh"].std()
            threshold = mean_kwh + 2 * std_kwh
            anomaly_rate = (df["energy_kwh"] > threshold).mean()
        
        # 2. Peak Variance (normalized 0-1)
        # Measures how much consumption varies between peak and off-peak
        df["hour"] = df["timestamp"].dt.hour
        peak_hours = list(range(9, 21))
        peak_avg = df[df["hour"].isin(peak_hours)]["energy_kwh"].mean()
        off_peak_avg = df[~df["hour"].isin(peak_hours)]["energy_kwh"].mean()
        
        overall_avg = df["energy_kwh"].mean()
        peak_variance = abs(peak_avg - off_peak_avg) / overall_avg if overall_avg > 0 else 0
        peak_variance = min(peak_variance, 1.0)  # Cap at 1.0
        
        # 3. Carbon Intensity (normalized 0-1)
        total_kwh = df["energy_kwh"].sum()
        total_hours = max((df["timestamp"].max() - df["timestamp"].min()).total_seconds() / 3600, 1)
        avg_hourly_kwh = total_kwh / total_hours
        
        # Normalize: assume 500 kWh/h is high intensity
        carbon_intensity = min(avg_hourly_kwh / 500.0, 1.0)
        
        # Calculate total carbon emissions
        carbon_emissions_kg = total_kwh * self.carbon_factor
        
        # 4. Compute health score (0-100)
        score = 100 - (
            self.weight_anomaly * anomaly_rate +
            self.weight_peak_variance * peak_variance +
            self.weight_carbon * carbon_intensity
        )
        score = max(0, min(100, score))
        
        # Generate insight summary
        insights = self._generate_insights(score, anomaly_rate, peak_variance, carbon_intensity)
        
        # Grade
        grade = self._get_grade(score)
        
        return {
            "energy_health_score": round(score, 1),
            "grade": grade,
            "anomaly_rate": round(anomaly_rate * 100, 2),
            "peak_variance": round(peak_variance * 100, 2),
            "carbon_intensity": round(carbon_intensity * 100, 2),
            "carbon_emissions_kg": round(carbon_emissions_kg, 2),
            "carbon_emissions_tons": round(carbon_emissions_kg / 1000, 2),
            "total_consumption_kwh": round(total_kwh, 2),
            "avg_hourly_kwh": round(avg_hourly_kwh, 2),
            "insight_summary": insights,
            "metrics": {
                "anomaly_weight": self.weight_anomaly,
                "peak_variance_weight": self.weight_peak_variance,
                "carbon_weight": self.weight_carbon,
            }
        }
    
    def _generate_insights(
        self, score: float, anomaly_rate: float, peak_variance: float, carbon_intensity: float
    ) -> list:
        """Generate human-readable insights."""
        insights = []
        
        if score >= 80:
            insights.append("Excellent energy efficiency. System is performing well.")
        elif score >= 60:
            insights.append("Good energy efficiency with room for improvement.")
        elif score >= 40:
            insights.append("Moderate energy efficiency. Significant optimization opportunities exist.")
        else:
            insights.append("Poor energy efficiency. Immediate attention recommended.")
        
        if anomaly_rate > 0.05:
            insights.append(f"High anomaly rate ({anomaly_rate*100:.1f}%). Investigate irregular consumption patterns.")
        elif anomaly_rate > 0.02:
            insights.append(f"Moderate anomaly rate ({anomaly_rate*100:.1f}%). Monitor for recurring issues.")
        else:
            insights.append("Low anomaly rate. Consumption patterns are stable.")
        
        if peak_variance > 0.5:
            insights.append("High peak-to-off-peak variance. Consider load shifting strategies.")
        elif peak_variance > 0.2:
            insights.append("Moderate peak variance. Some load balancing could help.")
        else:
            insights.append("Good load distribution across peak and off-peak hours.")
        
        if carbon_intensity > 0.5:
            insights.append("High carbon intensity. Consider renewable energy sources.")
        elif carbon_intensity > 0.2:
            insights.append("Moderate carbon footprint. Efficiency improvements could reduce emissions.")
        else:
            insights.append("Low carbon intensity. Good sustainability performance.")
        
        return insights
    
    def _get_grade(self, score: float) -> str:
        """Convert score to letter grade."""
        if score >= 90:
            return "A+"
        elif score >= 80:
            return "A"
        elif score >= 70:
            return "B"
        elif score >= 60:
            return "C"
        elif score >= 50:
            return "D"
        else:
            return "F"
