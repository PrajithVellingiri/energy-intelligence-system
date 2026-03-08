import { useState, useEffect } from "react";
import { analyticsAPI } from "../lib/api";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AlertTriangle, Shield, Activity } from "lucide-react";

interface AnomalyData {
  anomalies: Array<{
    timestamp: string;
    energy_kwh: number;
    severity_score: number;
  }>;
  all_data: Array<{
    timestamp: string;
    energy_kwh: number;
    is_anomaly: boolean;
    severity_score: number;
  }>;
  summary: {
    total_records: number;
    total_anomalies: number;
    anomaly_rate: number;
    avg_severity: number;
    max_severity: number;
  };
}

export default function AnomalyAlerts() {
  const [data, setData] = useState<AnomalyData | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnomalies();
  }, [days]);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getAnomalies(days);
      setData(res.data);
      setError("");
    } catch (err: any) {
      setError("Failed to load anomaly data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare scatter chart data (sample for performance)
  const chartData = data
    ? data.all_data
        .filter((_, i) => i % Math.max(1, Math.floor(data.all_data.length / 500)) === 0)
        .map((d, i) => ({
          index: i,
          energy_kwh: d.energy_kwh,
          is_anomaly: d.is_anomaly,
          severity: d.severity_score,
        }))
    : [];

  const getSeverityColor = (score: number) => {
    if (score > 0.8) return "#ef4444";
    if (score > 0.6) return "#f97316";
    if (score > 0.4) return "#eab308";
    return "#22c55e";
  };

  const getSeverityLabel = (score: number) => {
    if (score > 0.8) return "Critical";
    if (score > 0.6) return "High";
    if (score > 0.4) return "Medium";
    return "Low";
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-48" />
          <div className="h-64 bg-slate-700/50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Anomaly Detection</h3>
            <p className="text-sm text-slate-400">Isolation Forest Analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                days === d
                  ? "bg-red-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : (
        <>
          {/* Summary */}
          {data && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-700/30 rounded-xl p-3 hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <AlertTriangle className="w-3 h-3" />
                  Anomalies
                </div>
                <p className="text-white font-semibold text-lg">
                  {data.summary.total_anomalies}
                  <span className="text-xs text-slate-400 ml-1">
                    / {data.summary.total_records}
                  </span>
                </p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3 hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Activity className="w-3 h-3" />
                  Rate
                </div>
                <p className="text-white font-semibold text-lg">
                  {data.summary.anomaly_rate}%
                </p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3 hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Shield className="w-3 h-3" />
                  Max Severity
                </div>
                <p className="text-white font-semibold text-lg">
                  {(data.summary.max_severity * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Scatter Chart */}
          <div className="h-56 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="index"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  name="Time"
                  label={{ value: "Time Index", position: "bottom", fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  dataKey="energy_kwh"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  name="kWh"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)}`,
                    name === "energy_kwh" ? "Energy (kWh)" : name,
                  ]}
                />
                <Scatter data={chartData} name="Energy">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.is_anomaly ? getSeverityColor(entry.severity) : "#3b82f6"}
                      opacity={entry.is_anomaly ? 0.9 : 0.3}
                      r={entry.is_anomaly ? 5 : 2}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Anomalies Table */}
          {data && data.anomalies.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Anomalies</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.anomalies.slice(0, 10).map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getSeverityColor(a.severity_score) }}
                      />
                      <span className="text-sm text-slate-300">
                        {new Date(a.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-white font-medium">
                        {a.energy_kwh} kWh
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: getSeverityColor(a.severity_score) + "20",
                          color: getSeverityColor(a.severity_score),
                        }}
                      >
                        {getSeverityLabel(a.severity_score)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
