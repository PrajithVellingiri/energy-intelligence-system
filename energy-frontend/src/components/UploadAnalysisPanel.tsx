import { useState, useRef, useEffect } from "react";
import { analyticsAPI } from "../lib/api";
import ForecastChart from "./ForecastChart";
import AnomalyAlerts from "./AnomalyAlerts";
import OptimizationPanel from "./OptimizationPanel";
import EnergyScoreCard from "./EnergyScoreCard";
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
  Database,
  Sparkles,
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

interface UploadAnalysisPanelProps {
  savedReport?: unknown;
  onUploadComplete?: () => void;
}

export default function UploadAnalysisPanel({
  savedReport,
  onUploadComplete,
}: UploadAnalysisPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeSection, setActiveSection] = useState<string>("summary");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (savedReport) {
      setResult(savedReport as AnalysisResult);
      setActiveSection("summary");
      setFile(null);
      setError("");
    } else {
      setResult(null);
      setActiveSection("summary");
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.name.endsWith(".csv")) {
      setFile(dropped);
      setError("");
      setResult(null);
    } else if (dropped) {
      setError("Please drop a valid .CSV file.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setAnalysisStep("Normalizing dataset & detecting energy columns...");

    const stepTimer = setTimeout(() => {
      setAnalysisStep("Executing PyTorch LSTM forecasting & Isolation Forest detection...");
    }, 2000);

    try {
      const res = await analyticsAPI.analyzeCSV(file);
      setResult(res.data);
      setActiveSection("summary");
      onUploadComplete?.();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(
        axiosErr.response?.data?.detail || "Failed to analyze CSV. Please ensure the CSV contains valid timestamps and numeric load records."
      );
    } finally {
      clearTimeout(stepTimer);
      setLoading(false);
      setAnalysisStep("");
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:00`;
    } catch {
      return ts;
    }
  };

  const sections = [
    { id: "summary", label: "Executive Overview", icon: Zap },
    { id: "detection", label: "Auto-Identified Schema", icon: Database },
    { id: "forecast", label: "Neural Forecast", icon: TrendingUp },
    { id: "anomalies", label: "Anomaly Surveillance", icon: Activity },
    { id: "fixes", label: "Prescriptive Fixes", icon: Wrench },
    { id: "optimization", label: "Load Optimization", icon: BarChart3 },
    { id: "health", label: "Sustainability Index", icon: Shield },
  ];

  const isViewingSaved = !!savedReport;

  return (
    <div className="space-y-6">
      {/* Upload Dropzone Card (Visible when not viewing a saved report) */}
      {!isViewingSaved && (
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-7 relative overflow-hidden border border-slate-700/80 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl flex items-center justify-center shadow-glow-cyan">
                <Upload className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Ingest Telemetry &amp; Run AI Models
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload raw energy consumption CSVs. The system automatically normalizes timestamps, aligns frequencies, and triggers models.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-slate-400 bg-surface-elevated/80 border border-slate-700 px-3 py-1.5 rounded-lg self-start sm:self-auto">
              Formats: CSV (any delimiter / column schema)
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
              isDragOver
                ? "border-cyan-400 bg-cyan-500/10 scale-[1.005]"
                : file
                ? "border-cyan-500/50 bg-slate-900/60"
                : "border-slate-700/80 hover:border-cyan-500/40 bg-slate-950/40"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto mb-3 border border-slate-700 shadow-inner">
                <FileText className={`w-6 h-6 ${file ? "text-cyan-400" : "text-slate-500"}`} />
              </div>
              {file ? (
                <div>
                  <p className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                    <span>{file.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {(file.size / 1024).toFixed(1)} KB • Ready for model pipeline
                  </p>
                  <p className="text-[11px] text-cyan-400 mt-2 underline">Click to choose different file</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Drag and drop your energy telemetry CSV here, or{" "}
                    <span className="text-cyan-400 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Supports building sub-meters, SCADA logs, solar inverters, and utility billing records
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Pipeline trains only on unseen datasets to conserve cloud compute</span>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl font-bold shadow-glow-cyan transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Pipeline...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Dynamic AI Analysis Progress Indicator */}
          {loading && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
              <div className="text-xs text-cyan-300 font-mono font-medium">
                {analysisStep || "Running AI models..."}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Analysis Results View */}
      {result && (
        <div className="space-y-6">
          {/* Navigation Section Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan"
                      : "glass-panel text-slate-400 hover:text-white hover:border-slate-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Executive Overview & Summary */}
          {activeSection === "summary" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
                    <span>Latest Reading</span>
                    <Zap className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-3xl font-black text-white tracking-tight">
                    {result.dashboard_summary.current_consumption.toFixed(1)}
                    <span className="text-xs font-normal text-slate-400 ml-1.5">kWh</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Terminal load value</p>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
                    <span>24h Average Demand</span>
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-3xl font-black text-blue-300 tracking-tight">
                    {result.dashboard_summary.avg_24h.toFixed(1)}
                    <span className="text-xs font-normal text-slate-400 ml-1.5">kWh</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Rolling daily baseline</p>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
                    <span>Recorded Peak Load</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-3xl font-black text-amber-300 tracking-tight">
                    {result.dashboard_summary.max_24h.toFixed(1)}
                    <span className="text-xs font-normal text-slate-400 ml-1.5">kWh</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Maximum demand surge</p>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-medium">
                    <span>Recorded Off-Peak Low</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-black text-emerald-300 tracking-tight">
                    {result.dashboard_summary.min_24h.toFixed(1)}
                    <span className="text-xs font-normal text-slate-400 ml-1.5">kWh</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Minimum demand floor</p>
                </div>
              </div>

              {/* Data Range & Hash Strip */}
              <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>
                    Dataset Scope: {result.dashboard_summary.total_records.toLocaleString()} records •{" "}
                    {new Date(result.dashboard_summary.date_range.start).toLocaleDateString()} to{" "}
                    {new Date(result.dashboard_summary.date_range.end).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                    SHA-256: {result.data_hash.substring(0, 10)}...
                  </span>
                  {result.already_trained_before ? (
                    <span className="text-slate-400 text-[11px]">Cached Model State</span>
                  ) : (
                    <span className="text-emerald-400 text-[11px] font-semibold">Trained Model Weights</span>
                  )}
                </div>
              </div>

              {/* Quick Preview of Forecast and Health Gauge */}
              {result.analysis.forecast && (
                <ForecastChart data={result.analysis.forecast} formatTime={formatTime} />
              )}

              {result.analysis.health_score && (
                <EnergyScoreCard data={result.analysis.health_score} />
              )}
            </div>
          )}

          {/* Tab 2: Auto-Identified Data Fields */}
          {activeSection === "detection" && (
            <div className="glass-panel-elevated rounded-2xl p-6 sm:p-7 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-cyan-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center shadow-glow-cyan">
                  <Database className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Auto-Identified Telemetry Schema
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Heuristic engine parsed column semantics and normalized time alignment
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1">Datetime Timestamp Column</p>
                  <p className="text-base font-bold text-cyan-300 font-mono">
                    {result.detected_columns.datetime_column}
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1">Identified Energy Stream</p>
                  <p className="text-base font-bold text-white font-mono truncate">
                    {result.detected_columns.energy_columns.join(", ")}
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1">Environmental / Weather</p>
                  <p className="text-base font-bold text-slate-300 font-mono truncate">
                    {result.detected_columns.weather_columns.length > 0
                      ? result.detected_columns.weather_columns.join(", ")
                      : "None (Autonomously simulated)"}
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1">Telemetry Unit &amp; Rate</p>
                  <p className="text-base font-bold text-emerald-300 font-mono">
                    {result.detected_columns.unit_detected} • {result.detected_columns.frequency_minutes} min interval
                  </p>
                </div>
              </div>

              {/* Statistical Distribution */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Telemetry Distribution Statistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                    <p className="text-slate-500 mb-0.5">Arithmetic Mean</p>
                    <p className="text-base font-bold text-white font-mono">
                      {result.detected_columns.energy_stats.mean.toFixed(2)} kWh
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                    <p className="text-slate-500 mb-0.5">Standard Deviation</p>
                    <p className="text-base font-bold text-white font-mono">
                      {result.detected_columns.energy_stats.std.toFixed(2)} kWh
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                    <p className="text-slate-500 mb-0.5">Global Minimum</p>
                    <p className="text-base font-bold text-emerald-400 font-mono">
                      {result.detected_columns.energy_stats.min.toFixed(2)} kWh
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800">
                    <p className="text-slate-500 mb-0.5">Global Maximum</p>
                    <p className="text-base font-bold text-amber-400 font-mono">
                      {result.detected_columns.energy_stats.max.toFixed(2)} kWh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Neural Forecast */}
          {activeSection === "forecast" && result.analysis.forecast && (
            <ForecastChart data={result.analysis.forecast} formatTime={formatTime} />
          )}

          {/* Tab 4: Anomaly Surveillance */}
          {activeSection === "anomalies" && result.analysis.anomalies && (
            <AnomalyAlerts data={result.analysis.anomalies} formatTime={formatTime} />
          )}

          {/* Tab 5: Prescriptive Fix Suggestions */}
          {activeSection === "fixes" && result.fix_suggestions && (
            <FixSuggestionsSection data={result.fix_suggestions} />
          )}

          {/* Tab 6: Load Optimization */}
          {activeSection === "optimization" && result.analysis.optimization && (
            <OptimizationPanel data={result.analysis.optimization} />
          )}

          {/* Tab 7: Sustainability Health Score */}
          {activeSection === "health" && result.analysis.health_score && (
            <EnergyScoreCard data={result.analysis.health_score} />
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Prescriptive Fix Suggestions                        */
/* ------------------------------------------------------------------ */

function FixSuggestionsSection({ data }: { data: FixSuggestions }) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 sm:p-7 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center shadow-glow-amber">
          <Wrench className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            Automated Engineering Remediation
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Prescriptive corrections derived from anomaly cluster severity and temporal occurrence
          </p>
        </div>
      </div>

      {/* Priority Actions */}
      {data.priority_actions && data.priority_actions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Immediate Priority Corrective Actions
          </h4>
          <div className="space-y-2.5">
            {data.priority_actions.map((act, i) => (
              <div
                key={i}
                className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-200 flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[10px] font-bold text-rose-300 shrink-0">
                  {i + 1}
                </span>
                <p className="leading-relaxed mt-0.5">{act}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categorized Anomaly Accordions */}
      {data.categories && data.categories.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Anomaly Class Breakdown
          </h4>
          <div className="space-y-2">
            {data.categories.map((cat) => {
              const isExpanded = expandedCat === cat.type;
              return (
                <div
                  key={cat.type}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedCat(isExpanded ? null : cat.type)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{cat.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {cat.count} occurrences • Severity: {cat.avg_severity.toFixed(3)}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
                      {cat.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Fixes */}
      {data.fix_suggestions && data.fix_suggestions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Tactical Engineering Steps
          </h4>
          <div className="space-y-2">
            {data.fix_suggestions.map((fix, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2.5"
              >
                <span className="text-cyan-400 font-mono font-bold mt-0.5 shrink-0">#{idx + 1}</span>
                <p className="leading-relaxed">{fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Best Practices */}
      {data.general_suggestions && data.general_suggestions.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Long-Term Operational Guidelines
          </h4>
          <div className="space-y-2">
            {data.general_suggestions.map((sug, idx) => (
              <div
                key={idx}
                className="bg-surface-elevated/30 border border-slate-800/60 rounded-xl p-3 text-xs text-slate-400"
              >
                {sug}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
