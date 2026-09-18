import { useState, useMemo } from "react";
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
import { ShieldCheck, Activity, Search } from "lucide-react";

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
  const [filterSeverity, setFilterSeverity] = useState<"all" | "high" | "medium" | "low">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(15);

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
      <div className="editorial-card p-12 text-center">
        <Activity className="w-8 h-8 text-forest/40 mx-auto mb-3" />
        <p className="text-sm font-semibold text-editorial-text">No Anomaly Surveillance Data</p>
        <p className="text-xs text-editorial-muted mt-1">Upload a CSV dataset to run Isolation Forest detection.</p>
      </div>
    );
  }

  // Sample data points for chart performance if the dataset is large
  const allPoints = data.all_data || [];
  const step = Math.max(1, Math.floor(allPoints.length / 350));
  const sampledData = allPoints
    .filter((_, i) => i % step === 0 || _.is_anomaly)
    .map((p) => ({
      time: formatter(p.timestamp),
      energy: p.energy_kwh,
      is_anomaly: p.is_anomaly,
      severity: p.severity_score,
      rawTime: p.timestamp,
    }));

  // Categorize anomalies by severity for editorial counters
  const highAnomalies = data.anomalies.filter((a) => a.severity_score >= 0.75);
  const medAnomalies = data.anomalies.filter((a) => a.severity_score >= 0.5 && a.severity_score < 0.75);
  const lowAnomalies = data.anomalies.filter((a) => a.severity_score < 0.5);

  // Filtered anomalies for the analytical table
  const filteredAnomalies = useMemo(() => {
    return data.anomalies.filter((a) => {
      const matchesSearch =
        searchTerm === "" ||
        a.timestamp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatter(a.timestamp).toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterSeverity === "high") return a.severity_score >= 0.75;
      if (filterSeverity === "medium") return a.severity_score >= 0.5 && a.severity_score < 0.75;
      if (filterSeverity === "low") return a.severity_score < 0.5;
      return true;
    });
  }, [data.anomalies, filterSeverity, searchTerm, formatter]);

  return (
    <div className="space-y-6">
      {/* Top Editorial Surveillance Card */}
      <div className="editorial-card-elevated p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-editorial-divider">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                Surveillance &amp; Outliers
              </span>
              <span className="text-[11px] text-editorial-muted flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                Isolation Forest Algorithmic Engine
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-editorial-text">
              Energy Anomaly Surveillance
            </h3>
            <p className="text-xs text-editorial-muted mt-1 max-w-2xl">
              Evaluating non-linear variance and abnormal consumption spikes across multidimensional facility operations.
            </p>
          </div>

          {/* Rate Badge */}
          <div className="flex items-center gap-3 self-start lg:self-auto">
            <div className="bg-ivory-100 border border-editorial-border rounded-xl px-4 py-2.5 text-right">
              <span className="text-[10px] uppercase font-bold text-editorial-muted tracking-wider block">
                Anomaly Rate
              </span>
              <span className="text-lg font-bold text-forest font-mono">
                {data.summary.anomaly_rate != null ? `${data.summary.anomaly_rate.toFixed(1)}%` : "0.0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Editorial Severity Counter Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-6">
          <div className="bg-ivory-100 border border-editorial-border rounded-xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted block mb-1">
              Total Detected
            </span>
            <p className="text-2xl font-bold text-forest tracking-tight">
              {data.summary.total_anomalies.toLocaleString()}
            </p>
            <span className="text-[11px] text-editorial-muted mt-1 block">
              Across {data.summary.total_records.toLocaleString()} readings
            </span>
          </div>

          <div className="bg-[#FDF2F2] border border-[#F5C6CB] rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C2B2B]">
                Critical / High
              </span>
              <span className="w-2 h-2 rounded-full bg-[#D9534F]" />
            </div>
            <p className="text-2xl font-bold text-[#9C2B2B] tracking-tight">
              {highAnomalies.length.toLocaleString()}
            </p>
            <span className="text-[11px] text-[#A94442] mt-1 block font-medium">
              Severity &ge; 75%
            </span>
          </div>

          <div className="bg-[#FEF9EE] border border-[#F9E2AF] rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-solar-800">
                Moderate / Medium
              </span>
              <span className="w-2 h-2 rounded-full bg-solar" />
            </div>
            <p className="text-2xl font-bold text-solar-800 tracking-tight">
              {medAnomalies.length.toLocaleString()}
            </p>
            <span className="text-[11px] text-solar-700 mt-1 block font-medium">
              Severity 50% &ndash; 74%
            </span>
          </div>

          <div className="bg-sage-50 border border-sage-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sage-800">
                Low / Minor
              </span>
              <span className="w-2 h-2 rounded-full bg-sage" />
            </div>
            <p className="text-2xl font-bold text-sage-800 tracking-tight">
              {lowAnomalies.length.toLocaleString()}
            </p>
            <span className="text-[11px] text-sage-700 mt-1 block font-medium">
              Severity &lt; 50%
            </span>
          </div>
        </div>

        {/* Scatter Chart: Restrained editorial points */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <p className="text-xs font-semibold text-editorial-muted mb-2 flex items-center justify-between">
            <span>Scatter Surveillance Horizon (Sampled Telemetry)</span>
            <span className="text-[11px] font-normal">
              ● Red: High • Amber: Medium • Green: Normal
            </span>
          </p>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#E3E4DD" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#8C958F"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E3E4DD" }}
                interval="preserveStartEnd"
                minTickGap={45}
              />
              <YAxis
                dataKey="energy"
                stroke="#8C958F"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v} kWh`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-editorial-border rounded-xl p-3 shadow-editorial-md text-xs">
                        <p className="font-bold text-editorial-text">{d.time}</p>
                        <p className="font-mono text-forest mt-1">
                          Load: <span className="font-bold">{d.energy?.toFixed(2)} kWh</span>
                        </p>
                        {d.is_anomaly ? (
                          <div className="mt-1.5 pt-1.5 border-t border-editorial-divider flex items-center gap-1.5 text-[#D9534F] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D9534F]" />
                            <span>Anomaly (Score: {(d.severity * 100).toFixed(0)}%)</span>
                          </div>
                        ) : (
                          <span className="text-sage font-medium mt-1 block">Normal Operation</span>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={sampledData} shape="circle">
                {sampledData.map((entry, index) => {
                  let fillColor = "#B2D4BC";
                  let radius = 2;
                  let opacity = 0.5;

                  if (entry.is_anomaly) {
                    if (entry.severity >= 0.75) {
                      fillColor = "#D9534F";
                      radius = 4.5;
                      opacity = 0.95;
                    } else if (entry.severity >= 0.5) {
                      fillColor = "#E8A93A";
                      radius = 4;
                      opacity = 0.9;
                    } else {
                      fillColor = "#7DAF8A";
                      radius = 3.5;
                      opacity = 0.85;
                    }
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fillColor}
                      r={radius}
                      fillOpacity={opacity}
                      stroke={entry.is_anomaly ? "#FFFFFF" : "none"}
                      strokeWidth={entry.is_anomaly ? 1 : 0}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytical Anomaly Log Table */}
      <div className="editorial-card-elevated p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-editorial-divider">
          <div>
            <h4 className="text-lg font-bold text-editorial-text">
              Prescriptive Anomaly Telemetry Log
            </h4>
            <p className="text-xs text-editorial-muted mt-0.5">
              Chronological log with Isolation Forest deviation confidence and operational status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-editorial-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search timestamp..."
                className="bg-ivory-100 border border-editorial-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-editorial-text placeholder-editorial-muted focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
              />
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1 bg-ivory-100 p-1 rounded-lg border border-editorial-border text-xs">
              {(["all", "high", "medium", "low"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterSeverity(lvl)}
                  className={`px-2.5 py-1 rounded-md font-semibold capitalize transition-all ${
                    filterSeverity === lvl
                      ? "bg-white text-forest shadow-editorial-sm"
                      : "text-editorial-muted hover:text-editorial-text"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredAnomalies.length === 0 ? (
          <div className="py-12 text-center text-editorial-muted text-xs">
            No anomalous events match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-editorial-divider text-[11px] uppercase tracking-wider text-editorial-muted font-bold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Measured Demand</th>
                  <th className="py-3 px-4">Deviation Severity</th>
                  <th className="py-3 px-4 text-right">Status Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-divider text-xs">
                {filteredAnomalies.slice(0, displayCount).map((item, idx) => {
                  const isHigh = item.severity_score >= 0.75;
                  const isMed = item.severity_score >= 0.5 && item.severity_score < 0.75;

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-ivory-50 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-editorial-text">
                        {formatter(item.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-forest">
                        {item.energy_kwh.toFixed(2)} kWh
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-editorial-divider rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isHigh ? "bg-[#D9534F]" : isMed ? "bg-solar" : "bg-sage"
                              }`}
                              style={{ width: `${Math.min(100, item.severity_score * 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-editorial-muted">
                            {(item.severity_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isHigh ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDF2F2] text-[#9C2B2B] border border-[#F5C6CB]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D9534F]" />
                            Critical Spike
                          </span>
                        ) : isMed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF9EE] text-solar-800 border border-[#F9E2AF]">
                            <span className="w-1.5 h-1.5 rounded-full bg-solar" />
                            Moderate Outlier
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sage-50 text-sage-800 border border-sage-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                            Minor Variance
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredAnomalies.length > displayCount && (
              <div className="pt-4 text-center">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 25)}
                  className="text-xs font-bold text-forest hover:text-forest-600 bg-forest-50 border border-forest-100 px-4 py-2 rounded-xl transition-all"
                >
                  Show More Logged Entries ({filteredAnomalies.length - displayCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
