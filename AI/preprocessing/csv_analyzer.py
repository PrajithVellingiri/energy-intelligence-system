"""
Smart CSV Analyzer for user-uploaded energy datasets.
Auto-detects column types, normalizes data, and prepares it for AI analysis.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple


class SmartCSVAnalyzer:
    """Intelligently analyze and normalize any energy-related CSV file."""

    # Keywords for auto-detecting column types
    DATETIME_KEYWORDS = {"datetime", "timestamp", "date", "time", "date_time"}
    ENERGY_KEYWORDS = {"energy", "power", "consumption", "kwh", "kw", "watt", "load", "demand", "usage", "zone"}
    WEATHER_KEYWORDS = {"temperature", "temp", "humidity", "wind", "solar", "diffuse", "pressure", "cloud", "rain"}

    def __init__(self):
        self.column_mapping: Dict[str, str] = {}
        self.detected_info: Dict = {}

    def analyze_and_normalize(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict]:
        """
        Analyze a raw CSV DataFrame and normalize it into our standard format.
        Returns (normalized_df, detection_info).
        Standard format: timestamp, energy_kwh columns (plus optional extras).
        """
        df = df.copy()

        # Strip whitespace from column names
        df.columns = [col.strip() for col in df.columns]

        # Step 1: Detect datetime column
        dt_col = self._detect_datetime_column(df)

        # Step 2: Parse datetime
        df[dt_col] = self._parse_datetime(df[dt_col])

        # Step 3: Detect energy/power columns
        energy_cols = self._detect_energy_columns(df, dt_col)

        # Step 4: Detect weather columns
        weather_cols = self._detect_weather_columns(df, dt_col, energy_cols)

        # Step 5: Compute total energy
        df["_total_energy"] = df[energy_cols].sum(axis=1)

        # Step 6: Determine data frequency and resample to hourly if needed
        freq_minutes = self._detect_frequency(df[dt_col])

        if freq_minutes < 50:
            # Sub-hourly data, resample to hourly
            cols_to_resample = ["_total_energy"] + weather_cols
            df_resampled = df.set_index(dt_col)[cols_to_resample].resample("h").mean().reset_index()
        else:
            df_resampled = df[[dt_col, "_total_energy"] + weather_cols].copy()

        df_resampled = df_resampled.rename(columns={dt_col: "timestamp"})

        # Step 7: Convert to kWh if needed
        mean_val = df_resampled["_total_energy"].mean()
        scale_factor = 1.0
        unit_detected = "kWh"
        if mean_val > 10000:
            scale_factor = 0.001
            unit_detected = "Watts (converted to kWh)"
        elif mean_val > 1000:
            scale_factor = 0.001
            unit_detected = "Watts (converted to kWh)"

        df_resampled["energy_kwh"] = df_resampled["_total_energy"] * scale_factor
        df_resampled = df_resampled.drop(columns=["_total_energy"])

        # Clean weather column names
        rename_map = {}
        for col in weather_cols:
            clean = col.lower().replace(" ", "_").replace("-", "_")
            if clean != col:
                rename_map[col] = clean
        df_resampled = df_resampled.rename(columns=rename_map)

        # Drop NaN rows
        df_resampled = df_resampled.dropna(subset=["energy_kwh"])
        df_resampled = df_resampled.sort_values("timestamp").reset_index(drop=True)

        # Build detection info
        self.detected_info = {
            "datetime_column": dt_col,
            "energy_columns": energy_cols,
            "weather_columns": weather_cols,
            "total_records_raw": len(df),
            "total_records_processed": len(df_resampled),
            "frequency_minutes": freq_minutes,
            "unit_detected": unit_detected,
            "scale_factor": scale_factor,
            "date_range": {
                "start": str(df_resampled["timestamp"].iloc[0]) if len(df_resampled) > 0 else None,
                "end": str(df_resampled["timestamp"].iloc[-1]) if len(df_resampled) > 0 else None,
            },
            "energy_stats": {
                "mean": round(float(df_resampled["energy_kwh"].mean()), 2),
                "std": round(float(df_resampled["energy_kwh"].std()), 2),
                "min": round(float(df_resampled["energy_kwh"].min()), 2),
                "max": round(float(df_resampled["energy_kwh"].max()), 2),
            },
        }

        return df_resampled, self.detected_info

    def _detect_datetime_column(self, df: pd.DataFrame) -> str:
        """Detect the datetime column by name or content."""
        # Try by name
        for col in df.columns:
            if col.lower().strip() in self.DATETIME_KEYWORDS:
                return col

        # Try by content - look for string columns that parse as dates
        for col in df.columns:
            if df[col].dtype == object:
                try:
                    pd.to_datetime(df[col].head(10))
                    return col
                except (ValueError, TypeError):
                    continue

        # Fallback to first column
        return df.columns[0]

    def _parse_datetime(self, series: pd.Series) -> pd.Series:
        """Parse datetime with multiple format attempts."""
        # Try standard parsing first
        try:
            return pd.to_datetime(series, infer_datetime_format=True)
        except (ValueError, TypeError):
            pass

        # Try dayfirst
        try:
            return pd.to_datetime(series, dayfirst=True)
        except (ValueError, TypeError):
            pass

        # Try common formats
        for fmt in ["%m/%d/%Y %H:%M", "%d-%m-%Y %H:%M", "%Y-%m-%d %H:%M:%S", "%d/%m/%Y %H:%M"]:
            try:
                return pd.to_datetime(series, format=fmt)
            except (ValueError, TypeError):
                continue

        return pd.to_datetime(series, errors="coerce")

    def _detect_energy_columns(self, df: pd.DataFrame, dt_col: str) -> List[str]:
        """Detect energy/power consumption columns."""
        energy_cols = []
        for col in df.columns:
            if col == dt_col:
                continue
            if not pd.api.types.is_numeric_dtype(df[col]):
                continue
            col_lower = col.lower()
            # Check if it matches energy keywords
            if any(kw in col_lower for kw in self.ENERGY_KEYWORDS):
                energy_cols.append(col)

        # If no energy columns found by keyword, use all numeric non-weather columns
        if not energy_cols:
            for col in df.columns:
                if col == dt_col:
                    continue
                if not pd.api.types.is_numeric_dtype(df[col]):
                    continue
                col_lower = col.lower()
                if not any(kw in col_lower for kw in self.WEATHER_KEYWORDS):
                    energy_cols.append(col)

        # If still nothing, just use all numeric columns
        if not energy_cols:
            energy_cols = [
                col for col in df.columns
                if col != dt_col and pd.api.types.is_numeric_dtype(df[col])
            ]

        return energy_cols

    def _detect_weather_columns(self, df: pd.DataFrame, dt_col: str, energy_cols: List[str]) -> List[str]:
        """Detect weather/environmental columns."""
        weather_cols = []
        for col in df.columns:
            if col == dt_col or col in energy_cols:
                continue
            if not pd.api.types.is_numeric_dtype(df[col]):
                continue
            if any(kw in col.lower() for kw in self.WEATHER_KEYWORDS):
                weather_cols.append(col)
        return weather_cols

    def _detect_frequency(self, dt_series: pd.Series) -> int:
        """Detect the data frequency in minutes."""
        if len(dt_series) < 2:
            return 60
        diffs = dt_series.diff().dropna()
        median_diff = diffs.median()
        minutes = int(median_diff.total_seconds() / 60)
        return max(minutes, 1)
