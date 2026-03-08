import { useState, useRef, useEffect } from "react";
import { analyticsAPI } from "../lib/api";
import { formatINR } from "../lib/currency";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Upload,
  FileText,
  AlertTriangle,
  TrendingUp,
  Activity,
  BarChart3,
  Zap,
  Shield,
  Wrench,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DetectedColumns {
  datetime_column: string;
  energy_columns: string[];
  weather_columns: string[];
  total_records_raw: number;
  total_records_processed: number;
  frequency_minutes: number;
  unit_detected: string;
  date_range: { start: string; end: string };
  energy_stats: { mean: number; std: number; min: number; max: number };
}

interface ForecastPoint {
  timestamp: string;
  predicted_kwh: number;
}
interface HistoricalPoint {
  timestamp: string;
  energy_kwh: number;
}
interface AnomalyPoint {
  timestamp: string;
  energy_kwh: number;
  is_anomaly: boolean;
  severity_score: number;
}
interface AnomalyCategory {
  type: string;
  label: string;
  count: number;
  avg_value?: number;
  avg_severity: number;
  description: string;
}
interface FixSuggestions {
  total_anomalies: number;
  categories: AnomalyCategory[];
  fix_suggestions: string[];
  general_suggestions: string[];
  priority_actions: string[];
  anomaly_summary: {
    avg_severity: number;
    max_severity: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
  };
}

interface TrainingInfo {
  trained: boolean;
  reason?: string;
  current_val_loss?: number;
  threshold?: number;
  lstm?: {
    trained: boolean;
    best_val_loss?: number;
    epochs_trained?: number;
    optimal?: boolean;
    error?: string;
    reason?: string;
  };
  anomaly_detector?: {
    trained: boolean;
    anomalies_found?: number;
    total_records?: number;
    error?: string;
  };
}

interface DashboardSummary {
  current_consumption: number;
  avg_24h: number;
  max_24h: number;
  min_24h: number;
  total_records: number;
  date_range: { start: string; end: string };
}

interface AnalysisResult {
  detected_columns: DetectedColumns;
  dashboard_summary: DashboardSummary;
  analysis: {
    forecast: {
      forecast: ForecastPoint[];
      historical: HistoricalPoint[];
      summary: {
        forecast_hours: number;
        avg_predicted_kwh: number;
        max_predicted_kwh: number;
        min_predicted_kwh: number;
      };
    } | null;
    anomalies: {
      anomalies: Array<{
        timestamp: string;
        energy_kwh: number;
        severity_score: number;
      }>;
      all_data: AnomalyPoint[];
      summary: {
        total_records: number;
        total_anomalies: number;
        anomaly_rate: number;
        avg_severity: number;
        max_severity: number;
      };
    } | null;
    optimization: {
      original_cost: number;
      optimized_cost: number;
      estimated_savings: number;
      peak_reduction_percent: number;
      recommended_shift_hours: number[];
    } | null;
    health_score: {
      energy_health_score: number;
      carbon_emissions: number;
      insight_summary: string[];
    } | null;
  };
  fix_suggestions: FixSuggestions | null;
  training_info: TrainingInfo | null;
  data_hash: string;
  already_trained_before: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface UploadAnalysisPanelProps {
  /** If provided, render this saved report in read-only mode (no upload UI). */
  savedReport?: unknown;
  /** Called after a new CSV is successfully uploaded & analyzed. */
  onUploadComplete?: () => void;
}

export default function UploadAnalysisPanel({
  savedReport,
  onUploadComplete,
}: UploadAnalysisPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeSection, setActiveSection] = useState<string>("detection");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When a saved report is provided, populate the result state directly
  useEffect(() => {
    if (savedReport) {
      setResult(savedReport as AnalysisResult);
      setActiveSection("summary");
      setFile(null);
      setError("");
    } else {
      setResult(null);
      setActiveSection("detection");
    }
  }, [savedReport]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setError("");
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const res = await analyticsAPI.analyzeCSV(file);
      setResult(res.data);
      setActiveSection("summary");
      onUploadComplete?.();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(
        axiosErr.response?.data?.detail || "Failed to analyze CSV. Please check the file format."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
  };

  const sections = [
    { id: "summary", label: "Summary", icon: Zap },
    { id: "detection", label: "Auto-Identified Data Fields", icon: FileText },
    { id: "forecast", label: "Forecast", icon: TrendingUp },
    { id: "anomalies", label: "Anomalies", icon: Activity },
    { id: "fixes", label: "Fix Suggestions", icon: Wrench },
    { id: "optimization", label: "Optimization", icon: BarChart3 },
    { id: "health", label: "Health Score", icon: Shield },
  ];

  const isViewingSaved = !!savedReport;

  return (
    <div className="space-y-6">
      {/* Upload Card — hidden when viewing a saved report */}
      {!isViewingSaved && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Upload & Analyze CSV</h3>
              <p className="text-sm text-slate-400">
                Upload any energy consumption CSV - AI will auto-detect columns and analyze
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 w-full">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-xl p-6 text-center transition-colors group"
              >
                <FileText className="w-8 h-8 text-slate-500 group-hover:text-purple-400 mx-auto mb-2 transition-colors" />
                {file ? (
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB - Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-300 group-hover:text-white transition-colors">
                      Click to select CSV file
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports any energy consumption CSV format
                    </p>
                  </div>
                )}
              </button>
            </div>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Analyze
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-800 rounded-xl p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Section Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shadow-md hover:shadow-lg ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                      : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Section Content */}
          {activeSection === "summary" && (
            <DashboardSummarySection
              summary={result.dashboard_summary}
              trainingInfo={result.training_info}
              alreadyTrained={result.already_trained_before}
            />
          )}
          {activeSection === "detection" && <DetectionInfo info={result.detected_columns} />}
          {activeSection === "forecast" && result.analysis.forecast && (
            <ForecastSection data={result.analysis.forecast} formatTime={formatTime} />
          )}
          {activeSection === "anomalies" && result.analysis.anomalies && (
            <AnomaliesSection data={result.analysis.anomalies} formatTime={formatTime} />
          )}
          {activeSection === "fixes" && result.fix_suggestions && (
            <FixSuggestionsSection data={result.fix_suggestions} />
          )}
          {activeSection === "optimization" && result.analysis.optimization && (
            <OptimizationSection data={result.analysis.optimization} />
          )}
          {activeSection === "health" && result.analysis.health_score && (
            <HealthScoreSection data={result.analysis.health_score} />
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function DashboardSummarySection({
  summary,
}: {
  summary: DashboardSummary;
  trainingInfo: TrainingInfo | null;
  alreadyTrained: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          Dataset Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
            <p className="text-xs text-blue-300 mb-1">Latest Reading</p>
            <p className="text-2xl font-bold text-white">
              {summary.current_consumption.toFixed(1)}
              <span className="text-sm text-slate-400 ml-1">kWh</span>
            </p>
          </div>
          <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-xl p-4">
            <p className="text-xs text-indigo-300 mb-1">24h Average</p>
            <p className="text-2xl font-bold text-white">
              {summary.avg_24h.toFixed(1)}
              <span className="text-sm text-slate-400 ml-1">kWh</span>
            </p>
          </div>
          <div className="bg-amber-600/10 border border-amber-600/20 rounded-xl p-4">
            <p className="text-xs text-amber-300 mb-1">24h Peak</p>
            <p className="text-2xl font-bold text-white">
              {summary.max_24h.toFixed(1)}
              <span className="text-sm text-slate-400 ml-1">kWh</span>
            </p>
          </div>
          <div className="bg-green-600/10 border border-green-600/20 rounded-xl p-4">
            <p className="text-xs text-green-300 mb-1">24h Low</p>
            <p className="text-2xl font-bold text-white">
              {summary.min_24h.toFixed(1)}
              <span className="text-sm text-slate-400 ml-1">kWh</span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-700/30 rounded-lg px-4 py-2">
          <span>{summary.total_records.toLocaleString()} total records</span>
          <span>
            {new Date(summary.date_range.start).toLocaleDateString()} -{" "}
            {new Date(summary.date_range.end).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function DetectionInfo({ info }: { info: DetectedColumns }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-purple-400" />
        Auto-Identified Data Fields
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard label="Datetime Column" value={info.datetime_column} />
        <InfoCard label="Energy Columns" value={info.energy_columns.join(", ")} />
        <InfoCard
          label="Weather Columns"
          value={info.weather_columns.length > 0 ? info.weather_columns.join(", ") : "None detected"}
        />
        <InfoCard label="Unit Detected" value={info.unit_detected} />
        <InfoCard label="Raw Records" value={info.total_records_raw.toLocaleString()} />
        <InfoCard label="Processed (Hourly)" value={info.total_records_processed.toLocaleString()} />
        <InfoCard label="Frequency" value={`${info.frequency_minutes} minutes`} />
        <InfoCard
          label="Date Range"
          value={`${new Date(info.date_range.start).toLocaleDateString()} - ${new Date(info.date_range.end).toLocaleDateString()}`}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatMini label="Mean" value={`${info.energy_stats.mean} kWh`} />
        <StatMini label="Std Dev" value={`${info.energy_stats.std} kWh`} />
        <StatMini label="Min" value={`${info.energy_stats.min} kWh`} />
        <StatMini label="Max" value={`${info.energy_stats.max} kWh`} />
      </div>
    </div>
  );
}

function ForecastSection({
  data,
  formatTime,
}: {
  data: NonNullable<AnalysisResult["analysis"]["forecast"]>;
  formatTime: (ts: string) => string;
}) {
  const chartData = [
    ...data.historical.map((h) => ({
      time: formatTime(h.timestamp),
      actual: h.energy_kwh,
      forecast: null as number | null,
    })),
    ...data.forecast.map((f) => ({
      time: formatTime(f.timestamp),
      actual: null as number | null,
      forecast: f.predicted_kwh,
    })),
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        24h Forecast (Based on Your Data)
      </h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatMini label="Avg Predicted" value={`${data.summary.avg_predicted_kwh} kWh`} />
        <StatMini label="Peak" value={`${data.summary.max_predicted_kwh} kWh`} />
        <StatMini label="Low" value={`${data.summary.min_predicted_kwh} kWh`} />
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={false} name="Historical" connectNulls={false} />
            <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Forecast" connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AnomaliesSection({
  data,
  formatTime,
}: {
  data: NonNullable<AnalysisResult["analysis"]["anomalies"]>;
  formatTime: (ts: string) => string;
}) {
  const chartData = data.all_data.map((d) => ({
    time: formatTime(d.timestamp),
    energy: d.energy_kwh,
    severity: d.is_anomaly ? d.severity_score : null,
  }));

  // Show only a subset for the scatter chart to avoid performance issues
  const step = Math.max(1, Math.floor(chartData.length / 500));
  const sampledData = chartData.filter((_, i) => i % step === 0);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-red-400" />
        Anomaly Detection Results
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatMini label="Total Records" value={data.summary.total_records.toLocaleString()} />
        <StatMini label="Anomalies Found" value={data.summary.total_anomalies.toString()} color="red" />
        <StatMini label="Anomaly Rate" value={`${data.summary.anomaly_rate}%`} />
        <StatMini label="Max Severity" value={data.summary.max_severity.toFixed(4)} color="red" />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis dataKey="energy" stroke="#94a3b8" tick={{ fontSize: 11 }} name="kWh" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Scatter name="Energy" data={sampledData} fill="#3b82f6">
              {sampledData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.severity !== null ? "#ef4444" : "#3b82f6"}
                  opacity={entry.severity !== null ? 1 : 0.4}
                  r={entry.severity !== null ? 5 : 2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {data.anomalies.length > 0 && (
        <div className="mt-4 max-h-48 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-700 sticky top-0 bg-slate-800">
              <tr>
                <th className="text-left py-2 px-2">Timestamp</th>
                <th className="text-right py-2 px-2">Energy (kWh)</th>
                <th className="text-right py-2 px-2">Severity</th>
              </tr>
            </thead>
            <tbody>
              {data.anomalies.slice(0, 50).map((a, i) => (
                <tr key={i} className="border-b border-slate-700/50 text-slate-300">
                  <td className="py-1.5 px-2">{new Date(a.timestamp).toLocaleString()}</td>
                  <td className="text-right py-1.5 px-2">{a.energy_kwh}</td>
                  <td className="text-right py-1.5 px-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        a.severity_score > 0.7
                          ? "bg-red-900/50 text-red-300"
                          : a.severity_score > 0.4
                          ? "bg-yellow-900/50 text-yellow-300"
                          : "bg-blue-900/50 text-blue-300"
                      }`}
                    >
                      {a.severity_score.toFixed(4)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.anomalies.length > 50 && (
            <p className="text-xs text-slate-500 text-center mt-2">
              Showing 50 of {data.anomalies.length} anomalies
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FixSuggestionsSection({ data }: { data: FixSuggestions }) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Wrench className="w-5 h-5 text-amber-400" />
        Anomaly Fix Suggestions
      </h3>

      {/* Anomaly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatMini label="Total Anomalies" value={data.total_anomalies.toString()} />
        <StatMini label="Critical" value={data.anomaly_summary.critical_count?.toString() ?? "0"} color="red" />
        <StatMini label="High" value={data.anomaly_summary.high_count?.toString() ?? "0"} color="amber" />
        <StatMini label="Medium/Low" value={((data.anomaly_summary.medium_count ?? 0) + (data.anomaly_summary.low_count ?? 0)).toString()} color="blue" />
      </div>

      {/* Priority Actions */}
      {data.priority_actions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Priority Actions
          </h4>
          <div className="space-y-2">
            {data.priority_actions.map((action, i) => (
              <div key={i} className="bg-red-900/20 border border-red-900/40 rounded-xl p-3 text-sm text-red-200">
                {action}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {data.categories.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Anomaly Categories</h4>
          <div className="space-y-2">
            {data.categories.map((cat) => (
              <div key={cat.type} className="bg-slate-700/30 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedCat(expandedCat === cat.type ? null : cat.type)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div>
                    <p className="text-white font-medium">{cat.label}</p>
                    <p className="text-xs text-slate-400">
                      {cat.count} occurrences | Avg severity: {cat.avg_severity.toFixed(4)}
                    </p>
                  </div>
                  {expandedCat === cat.type ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {expandedCat === cat.type && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-slate-300 mb-2">{cat.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fix Suggestions */}
      {data.fix_suggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Recommended Fixes
          </h4>
          <div className="space-y-2">
            {data.fix_suggestions.map((fix, i) => (
              <div key={i} className="flex items-start gap-3 bg-yellow-900/10 border border-yellow-900/30 rounded-xl p-3">
                <span className="text-yellow-400 text-sm font-bold shrink-0">{i + 1}.</span>
                <p className="text-sm text-yellow-300">{fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Suggestions */}
      {data.general_suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">General Recommendations</h4>
          <div className="space-y-2">
            {data.general_suggestions.map((s, i) => (
              <div key={i} className="bg-slate-700/20 rounded-xl p-3 text-sm text-slate-300">
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OptimizationSection({
  data,
}: {
  data: NonNullable<AnalysisResult["analysis"]["optimization"]>;
}) {
  const savingsPercent =
    data.original_cost > 0
      ? ((data.estimated_savings / data.original_cost) * 100).toFixed(1)
      : "0";

  const barData = [
    { name: "Original Cost", value: data.original_cost, color: "#ef4444" },
    { name: "Optimized Cost", value: data.optimized_cost, color: "#22c55e" },
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-green-400" />
        Load Optimization Analysis
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatMini label="Original Cost" value={formatINR(data.original_cost)} />
        <StatMini label="Optimized Cost" value={formatINR(data.optimized_cost)} color="green" />
        <StatMini label="Savings" value={`${formatINR(data.estimated_savings)} (${savingsPercent}%)`} color="green" />
        <StatMini label="Peak Reduction" value={`${data.peak_reduction_percent.toFixed(1)}%`} />
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HealthScoreSection({
  data,
}: {
  data: NonNullable<AnalysisResult["analysis"]["health_score"]>;
}) {
  if (!data || !data.energy_health_score) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
        <p className="text-slate-400 text-center py-8">Health score data not available</p>
      </div>
    );
  }

  const score = data.energy_health_score;
  const scoreColor =
    score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
  const scoreBg =
    score >= 80 ? "bg-green-900/20 border-green-800" : score >= 60 ? "bg-yellow-900/20 border-yellow-800" : "bg-red-900/20 border-red-800";

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-emerald-400" />
        Energy Health Score
      </h3>
      <div className="flex flex-col items-center mb-6">
        <div className={`w-40 h-40 rounded-full border-8 ${scoreBg} flex items-center justify-center mb-4`}>
          <div className="text-center">
            <span className="text-5xl font-bold" style={{ color: scoreColor }}>{score.toFixed(0)}</span>
            <p className="text-xs text-slate-400 mt-1">/ 100</p>
          </div>
        </div>
        {data.carbon_emissions && (
          <div className="bg-slate-700/30 rounded-xl p-4 w-full max-w-xs">
            <p className="text-xs text-slate-400 text-center">Carbon Emissions</p>
            <p className="text-2xl font-bold text-white text-center">
              {data.carbon_emissions.toFixed(2)} <span className="text-sm text-slate-400">kg CO2</span>
            </p>
          </div>
        )}
      </div>
      {data.insight_summary && data.insight_summary.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">AI Insights</h4>
          {data.insight_summary.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 bg-slate-700/20 rounded-xl p-3">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-slate-300">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-700/30 rounded-xl p-3">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-white text-sm font-medium">{value}</p>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color?: string }) {
  const colorClass =
    color === "red"
      ? "text-red-400"
      : color === "green"
      ? "text-green-400"
      : color === "amber"
      ? "text-amber-400"
      : color === "blue"
      ? "text-blue-400"
      : "text-white";

  return (
    <div className="bg-slate-700/30 rounded-xl p-3">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}
