"""
Anomaly Fix Suggestions Engine.
Analyzes detected anomalies and generates actionable fix recommendations
based on temporal patterns, severity, and consumption context.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional


class AnomalyFixSuggester:
    """Generate intelligent fix suggestions for detected energy anomalies."""

    def __init__(self):
        self.peak_hours = list(range(9, 21))  # 9am-9pm
        self.off_peak_hours = [h for h in range(24) if h not in self.peak_hours]

    def suggest_fixes(
        self,
        anomaly_results: pd.DataFrame,
        full_data: pd.DataFrame,
    ) -> Dict:
        anomalies = anomaly_results[anomaly_results["is_anomaly"]].copy()

        if len(anomalies) == 0:
            return {
                "total_anomalies": 0,
                "categories": [],
                "fix_suggestions": [],
                "general_suggestions": ["No anomalies detected. Energy consumption patterns are healthy."],
                "priority_actions": [],
                "anomaly_summary": {},
            }

        anomalies["timestamp"] = pd.to_datetime(anomalies["timestamp"])
        full_data = full_data.copy()
        full_data["timestamp"] = pd.to_datetime(full_data["timestamp"])

        mean_kwh = full_data["energy_kwh"].mean()
        std_kwh = full_data["energy_kwh"].std()
        median_kwh = full_data["energy_kwh"].median()

        categories = self._categorize_anomalies(anomalies, mean_kwh, std_kwh)

        suggestions = []
        priority_actions = []

        for category in categories:
            cat_suggestions = self._generate_category_suggestions(
                category, mean_kwh, std_kwh, median_kwh, full_data
            )
            suggestions.extend(cat_suggestions["suggestions"])
            priority_actions.extend(cat_suggestions["priority_actions"])

        general = self._generate_general_suggestions(anomalies, full_data, mean_kwh, std_kwh)

        suggestions = list(dict.fromkeys(suggestions))
        priority_actions = list(dict.fromkeys(priority_actions))

        return {
            "total_anomalies": len(anomalies),
            "categories": categories,
            "fix_suggestions": suggestions,
            "general_suggestions": general,
            "priority_actions": priority_actions[:5],
            "anomaly_summary": {
                "avg_severity": round(float(anomalies["severity_score"].mean()), 4),
                "max_severity": round(float(anomalies["severity_score"].max()), 4),
                "critical_count": int((anomalies["severity_score"] > 0.8).sum()),
                "high_count": int(((anomalies["severity_score"] > 0.6) & (anomalies["severity_score"] <= 0.8)).sum()),
                "medium_count": int(((anomalies["severity_score"] > 0.4) & (anomalies["severity_score"] <= 0.6)).sum()),
                "low_count": int((anomalies["severity_score"] <= 0.4).sum()),
            },
        }

    def _categorize_anomalies(self, anomalies, mean_kwh, std_kwh):
        categories = []

        spikes = anomalies[anomalies["energy_kwh"] > mean_kwh + 2 * std_kwh]
        if len(spikes) > 0:
            spike_hours = spikes["timestamp"].dt.hour.value_counts()
            categories.append({
                "type": "consumption_spike",
                "label": "Consumption Spikes",
                "count": len(spikes),
                "avg_value": round(float(spikes["energy_kwh"].mean()), 2),
                "avg_severity": round(float(spikes["severity_score"].mean()), 4),
                "peak_hour": int(spike_hours.index[0]) if len(spike_hours) > 0 else None,
                "description": f"Found {len(spikes)} instances of abnormally high energy consumption (avg {spikes[chr(39)+'energy_kwh'+chr(39) if False else 'energy_kwh'].mean():.1f} kWh vs normal {mean_kwh:.1f} kWh).",
            })

        drops = anomalies[anomalies["energy_kwh"] < mean_kwh - 2 * std_kwh]
        if len(drops) > 0:
            categories.append({
                "type": "consumption_drop",
                "label": "Consumption Drops",
                "count": len(drops),
                "avg_value": round(float(drops["energy_kwh"].mean()), 2),
                "avg_severity": round(float(drops["severity_score"].mean()), 4),
                "description": f"Found {len(drops)} instances of abnormally low consumption (avg {drops['energy_kwh'].mean():.1f} kWh). May indicate equipment failures.",
            })

        night_anomalies = anomalies[anomalies["timestamp"].dt.hour.isin(self.off_peak_hours)]
        night_high = night_anomalies[night_anomalies["energy_kwh"] > mean_kwh]
        if len(night_high) > 0:
            categories.append({
                "type": "off_peak_excess",
                "label": "Off-Peak Excess Usage",
                "count": len(night_high),
                "avg_value": round(float(night_high["energy_kwh"].mean()), 2),
                "avg_severity": round(float(night_high["severity_score"].mean()), 4),
                "description": f"Found {len(night_high)} anomalies during off-peak hours with above-average consumption.",
            })

        weekend_anomalies = anomalies[anomalies["timestamp"].dt.dayofweek >= 5]
        if len(weekend_anomalies) > 0:
            categories.append({
                "type": "weekend_anomaly",
                "label": "Weekend Anomalies",
                "count": len(weekend_anomalies),
                "avg_value": round(float(weekend_anomalies["energy_kwh"].mean()), 2),
                "avg_severity": round(float(weekend_anomalies["severity_score"].mean()), 4),
                "description": f"Found {len(weekend_anomalies)} anomalies on weekends when consumption should be lower.",
            })

        anomalies_sorted = anomalies.sort_values("timestamp")
        if len(anomalies_sorted) > 1:
            time_diffs = anomalies_sorted["timestamp"].diff()
            consecutive = int((time_diffs <= pd.Timedelta(hours=2)).sum())
            if consecutive > 2:
                categories.append({
                    "type": "sustained_anomaly",
                    "label": "Sustained Abnormal Patterns",
                    "count": consecutive,
                    "avg_severity": round(float(anomalies_sorted["severity_score"].mean()), 4),
                    "description": f"Found {consecutive} consecutive anomalies within 2-hour windows. Likely systemic issue.",
                })

        return categories

    def _generate_category_suggestions(self, category, mean_kwh, std_kwh, median_kwh, full_data):
        suggestions = []
        priority_actions = []
        cat_type = category["type"]

        if cat_type == "consumption_spike":
            excess_pct = ((category["avg_value"] - mean_kwh) / mean_kwh * 100)
            suggestions.extend([
                f"Consumption spikes are {excess_pct:.0f}% above normal. Inspect HVAC systems and heavy machinery during peak hour {category.get('peak_hour', 'N/A')}:00.",
                "Install demand-response controllers to automatically limit peak consumption.",
                "Implement power factor correction to reduce apparent power demand.",
                "Schedule high-energy processes during off-peak hours to flatten demand curve.",
                "Check for faulty sensors that may be misreporting consumption data.",
            ])
            if category["avg_severity"] > 0.7:
                priority_actions.append(f"URGENT: Investigate {category['count']} critical consumption spikes averaging {category['avg_value']} kWh (normal: {mean_kwh:.1f} kWh).")

        elif cat_type == "consumption_drop":
            suggestions.extend([
                "Verify that metering equipment is functioning correctly during low-consumption periods.",
                "Check for tripped breakers or equipment failures that may cause unexpected shutdowns.",
                "Review maintenance schedules - planned shutdowns should be documented and excluded.",
                "Install backup power monitoring to detect partial system outages.",
            ])
            priority_actions.append(f"Investigate {category['count']} consumption drops - possible equipment failure or metering issues.")

        elif cat_type == "off_peak_excess":
            suggestions.extend([
                "Audit HVAC scheduling - systems may be running unnecessarily during off-peak hours.",
                "Install occupancy sensors to reduce energy use when facilities are unoccupied.",
                "Review lighting timers and ensure automated shutoff is functioning.",
                "Check for server rooms or equipment running at full capacity off-hours.",
                "Implement building management system (BMS) rules for off-peak energy limits.",
            ])
            priority_actions.append(f"Reduce off-peak waste: {category['count']} instances of above-average consumption during off-hours.")

        elif cat_type == "weekend_anomaly":
            suggestions.extend([
                "Review weekend operation schedules - equipment may be left running unnecessarily.",
                "Implement automated weekend shutdown sequences for non-essential systems.",
                "Check security systems and lighting for weekend override issues.",
                "Consider installing smart meters with weekend alerting capabilities.",
            ])

        elif cat_type == "sustained_anomaly":
            suggestions.extend([
                "Sustained anomalies indicate a systemic issue - perform a full energy audit.",
                "Check for HVAC refrigerant leaks or compressor failures causing extended high consumption.",
                "Review recent changes to building occupancy, equipment, or processes.",
                "Consider installing real-time energy monitoring with automated alerting for sustained deviations.",
            ])
            priority_actions.append(f"CRITICAL: {category['count']} consecutive anomalies detected - likely systemic issue requiring immediate audit.")

        return {"suggestions": suggestions, "priority_actions": priority_actions}

    def _generate_general_suggestions(self, anomalies, full_data, mean_kwh, std_kwh):
        suggestions = []
        anomaly_rate = len(anomalies) / len(full_data) if len(full_data) > 0 else 0

        if anomaly_rate > 0.1:
            suggestions.append(f"High anomaly rate ({anomaly_rate*100:.1f}%). Recommend comprehensive energy audit and installation of real-time monitoring systems.")
        elif anomaly_rate > 0.05:
            suggestions.append(f"Moderate anomaly rate ({anomaly_rate*100:.1f}%). Focus on peak-hour optimization and equipment maintenance schedules.")
        else:
            suggestions.append(f"Low anomaly rate ({anomaly_rate*100:.1f}%). Energy patterns are generally healthy. Continue regular monitoring.")

        cv = std_kwh / mean_kwh if mean_kwh > 0 else 0
        if cv > 0.3:
            suggestions.append(f"High consumption variability (CV={cv:.2f}). Consider load balancing and demand-side management strategies.")

        suggestions.append("Implement automated anomaly alerting to catch issues within 1 hour of occurrence.")
        suggestions.append("Maintain a log of known operational changes to distinguish planned events from true anomalies.")

        return suggestions
