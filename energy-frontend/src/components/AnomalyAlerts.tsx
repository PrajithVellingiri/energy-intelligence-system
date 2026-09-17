import { useState } from "react";
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
import { AlertTriangle, ShieldCheck, Activity, Search, Filter } from "lucide-react";

export interface AnomalyItem {
  timestamp: string;
  energy_kwh: number;
  severity_score: number;
}

export interface AnomalyPoint {
  timestamp: string;
  energy_kwh: number;
  is_anomaly: boolean;
  severity_score: number;
}

export interface AnomalyData {
  anomalies: AnomalyItem[];
  all_data: AnomalyPoint[];
  summary: {
    total_records: number;
    total_anomalies: number;
    anomaly_rate: number;
    avg_severity: number;
    max_severity: number;
  };
}

interface AnomalyAlertsProps {
  data?: AnomalyData | null;
  formatTime?: (ts: string) => string;
}

export default function AnomalyAlerts({ data, formatTime }: AnomalyAlertsProps) {
  const [filterSeverity, setFilterSeverity] = useState<"all" | "critical" | "high">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const defaultFormatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:00`;
    } catch {
      return ts;
    }
  };

  const formatter = formatTime || defaultFormatTime;

  if (!data) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <Activity className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-50" />
        <p className="text-slate-400 text-sm">No anomaly telemetry loaded.</p>
      </div>
    );
  }

  // Sample data points for performance if the dataset is large
  const allPoints = data.all_data || [];
  const step = Math.max(1, Math.floor(allPoints.length / 400));
  const sampledData = allPoints
    .filter((_, i) => i % step === 0 || _.is_anomaly)
    .map((p) => ({
      time: formatter(p.timestamp),
      energy: p.energy_kwh,
      is_anomaly: p.is_anomaly,
      severity: p.severity_score,
      rawTime: p.timestamp,
    }));

  const filteredAnomalies = (data.anomalies || []).filter((a) => {
    if (filterSeverity === "critical" && a.severity_score < 0.7) return false;
    if (filterSeverity === "high" && a.severity_score < 0.4) return false;
    if (searchTerm && !a.timestamp.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 relative overflow-hidden">
      {/* Ambient background accent */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30 rounded-xl flex items-center justify-center shadow-glow-amber">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              Isolation Forest Anomaly Surveillance
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/30">
                Unsupervised ML
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies consumption spikes, voltage fluctuations, and outlier consumption behaviors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.summary.total_anomalies === 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>Grid Stable</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{data.summary.total_anomalies} Anomalies Detected</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
          <p className="text-xs text-slate-400 mb-1 font-medium">Telemetry Volume</p>
          <p className="text-2xl font-black text-white tracking-tight">
            {data.summary.total_records.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">pts</span>
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
          <p className="text-xs text-slate-400 mb-1 font-medium">Identified Outliers</p>
          <p className="text-2xl font-black text-red-400 tracking-tight">
            {data.summary.total_anomalies}
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
          <p className="text-xs text-slate-400 mb-1 font-medium">Contamination Rate</p>
          <p className="text-2xl font-black text-amber-300 tracking-tight">
            {data.summary.anomaly_rate.toFixed(2)}%
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
          <p className="text-xs text-slate-400 mb-1 font-medium">Peak Anomaly Score</p>
          <p className="text-2xl font-black text-purple-300 tracking-tight">
            {data.summary.max_severity.toFixed(3)}
          </p>
        </div>
      </div>

      {/* Scatter Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
          <span className="font-medium">Scatter Plot Analysis (Normal telemetry vs Outliers)</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 opacity-60" /> Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-glow-amber" /> Outlier
            </span>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                dataKey="energy"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                name="kWh"
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  backdropFilter: "blur(8px)",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  name === "energy" ? `${value} kWh` : value,
                  name === "energy" ? "Consumption" : name,
                ]}
              />
              <Scatter name="Telemetry" data={sampledData} fill="#06b6d4">
                {sampledData.map((entry, index) => (
                  <Cell
                    key={`point-${index}`}
                    fill={entry.is_anomaly ? "#ef4444" : "#06b6d4"}
                    opacity={entry.is_anomaly ? 1 : 0.45}
                    r={entry.is_anomaly ? 5.5 : 2.5}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomalies Table Section */}
      {data.anomalies.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300">Detailed Outlier Events</span>
              <span className="text-[11px] text-slate-500">
                ({filteredAnomalies.length} matching)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter timestamp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800/80 border border-slate-700/60 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as any)}
                aria-label="Filter anomalies by severity"
                className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Severities</option>
                <option value="high">High (&gt;0.4)</option>
                <option value="critical">Critical (&gt;0.7)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto max-h-56">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Timestamp</th>
                  <th className="text-right py-2 px-3 font-medium">Recorded Load</th>
                  <th className="text-right py-2 px-3 font-medium">Severity Score</th>
                  <th className="text-right py-2 px-3 font-medium">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAnomalies.slice(0, 50).map((a, i) => {
                  const isCritical = a.severity_score >= 0.7;
                  const isHigh = a.severity_score >= 0.4 && a.severity_score < 0.7;
                  return (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 text-slate-300 font-mono">
                        {new Date(a.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-white">
                        {a.energy_kwh.toFixed(2)} kWh
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-300">
                        {a.severity_score.toFixed(4)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isCritical
                              ? "bg-red-500/10 text-red-400 border border-red-500/30"
                              : isHigh
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {isCritical ? "Critical Spike" : isHigh ? "High Divergence" : "Moderate Drift"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredAnomalies.length > 50 && (
            <p className="text-[11px] text-slate-500 text-center mt-2.5">
              Showing top 50 anomalous events
            </p>
          )}
        </div>
      )}
    </div>
  );
}
