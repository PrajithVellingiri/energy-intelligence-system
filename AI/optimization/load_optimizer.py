"""
Load Optimization Engine for energy cost reduction.
Simulates load shifting from peak to off-peak hours to estimate savings.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional


class LoadOptimizer:
    """Estimate cost savings by shifting energy consumption away from peak hours."""
    
    def __init__(
        self,
        peak_hours: List[int] = None,
        peak_tariff: float = 0.25,
        off_peak_tariff: float = 0.10,
        shiftable_load_pct: float = 0.30,
    ):
        self.peak_hours = peak_hours or list(range(9, 21))  # 9am-9pm
        self.off_peak_hours = [h for h in range(24) if h not in self.peak_hours]
        self.peak_tariff = peak_tariff
        self.off_peak_tariff = off_peak_tariff
        self.shiftable_load_pct = shiftable_load_pct
    
    def analyze(self, df: pd.DataFrame) -> Dict:
        """Analyze energy data and compute optimization recommendations."""
        
        df = df.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["hour"] = df["timestamp"].dt.hour
        df["is_peak"] = df["hour"].isin(self.peak_hours)
        
        # Current consumption breakdown
        peak_consumption = df[df["is_peak"]]["energy_kwh"].sum()
        off_peak_consumption = df[~df["is_peak"]]["energy_kwh"].sum()
        total_consumption = peak_consumption + off_peak_consumption
        
        # Calculate original cost
        original_peak_cost = peak_consumption * self.peak_tariff
        original_off_peak_cost = off_peak_consumption * self.off_peak_tariff
        original_cost = original_peak_cost + original_off_peak_cost
        
        # Simulate load shifting
        shiftable_load = peak_consumption * self.shiftable_load_pct
        optimized_peak_consumption = peak_consumption - shiftable_load
        optimized_off_peak_consumption = off_peak_consumption + shiftable_load
        
        # Calculate optimized cost
        optimized_peak_cost = optimized_peak_consumption * self.peak_tariff
        optimized_off_peak_cost = optimized_off_peak_consumption * self.off_peak_tariff
        optimized_cost = optimized_peak_cost + optimized_off_peak_cost
        
        # Savings
        estimated_savings = original_cost - optimized_cost
        savings_pct = (estimated_savings / original_cost * 100) if original_cost > 0 else 0
        
        # Peak reduction
        peak_reduction_pct = (shiftable_load / peak_consumption * 100) if peak_consumption > 0 else 0
        
        # Recommended shift hours (off-peak hours with lowest avg consumption)
        off_peak_df = df[~df["is_peak"]].groupby("hour")["energy_kwh"].mean()
        recommended_hours = off_peak_df.nsmallest(4).index.tolist()
        
        # Hourly breakdown for visualization
        hourly_original = df.groupby("hour")["energy_kwh"].mean().to_dict()
        hourly_optimized = {}
        for h in range(24):
            if h in self.peak_hours:
                hourly_optimized[h] = hourly_original.get(h, 0) * (1 - self.shiftable_load_pct)
            else:
                # Distribute shifted load evenly across off-peak hours
                shift_per_hour = (sum(hourly_original.get(ph, 0) for ph in self.peak_hours) * self.shiftable_load_pct) / len(self.off_peak_hours)
                hourly_optimized[h] = hourly_original.get(h, 0) + shift_per_hour
        
        return {
            "original_cost": round(original_cost, 2),
            "optimized_cost": round(optimized_cost, 2),
            "estimated_savings": round(estimated_savings, 2),
            "savings_percentage": round(savings_pct, 2),
            "peak_reduction_percent": round(peak_reduction_pct, 2),
            "total_consumption_kwh": round(total_consumption, 2),
            "peak_consumption_kwh": round(peak_consumption, 2),
            "off_peak_consumption_kwh": round(off_peak_consumption, 2),
            "recommended_shift_hours": recommended_hours,
            "peak_tariff": self.peak_tariff,
            "off_peak_tariff": self.off_peak_tariff,
            "hourly_original": {str(k): round(v, 2) for k, v in hourly_original.items()},
            "hourly_optimized": {str(k): round(v, 2) for k, v in hourly_optimized.items()},
        }
