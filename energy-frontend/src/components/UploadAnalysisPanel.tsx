import { useState, useRef, useEffect } from "react";
import { analyticsAPI } from "../lib/api";
import ForecastChart from "./ForecastChart";
import AnomalyAlerts from "./AnomalyAlerts";
import OptimizationPanel from "./OptimizationPanel";
import EnergyScoreCard from "./EnergyScoreCard";
import {
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
  Clock,
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
        <div className="editorial-card-elevated p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-editorial-divider">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                  Data Workspace
                </span>
                <span className="text-[11px] text-editorial-muted flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-solar" />
                  Automated Frequency &amp; Schema Parser
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-editorial-text">
                Import Facility Telemetry
              </h3>
              <p className="text-xs text-editorial-muted mt-1 max-w-2xl">
                Upload raw energy consumption CSV records. The system normalizes timestamps, computes anomaly signatures, and executes deep-learning forecasting.
              </p>
            </div>

            <span className="text-xs font-mono font-medium text-editorial-muted bg-ivory-100 border border-editorial-border px-3 py-1.5 rounded-lg self-start sm:self-auto">
              Format: CSV (Comma, Semicolon, Tab)
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
              isDragOver
                ? "border-forest bg-forest-50/50"
                : file
                ? "border-forest-400 bg-ivory-50"
                : "border-editorial-border hover:border-forest-300 hover:bg-ivory-50/80 bg-white"
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
              <div className="w-12 h-12 rounded-2xl bg-ivory-100 border border-editorial-border flex items-center justify-center mx-auto mb-3 shadow-editorial-sm">
                <FileText className={`w-6 h-6 ${file ? "text-forest" : "text-editorial-muted"}`} />
              </div>
              {file ? (
                <div>
                  <p className="text-base font-bold text-editorial-text flex items-center justify-center gap-1.5">
                    <span>{file.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-forest" />
                  </p>
                  <p className="text-xs text-editorial-muted mt-1 font-mono">
                    {(file.size / 1024).toFixed(1)} KB • Staged for neural processing
                  </p>
                  <p className="text-xs text-forest font-semibold mt-2 underline">Click to choose a different CSV</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-editorial-text">
                    Drag and drop your energy telemetry dataset here, or{" "}
                    <span className="text-forest font-bold underline">select CSV file</span>
                  </p>
                  <p className="text-xs text-editorial-muted mt-1.5">
                    Supports building sub-meters, SCADA logs, solar inverters, and utility billing records
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-xs text-editorial-muted flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-solar" />
              <span>Model weights load automatically from pre-trained checkpoints</span>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full sm:w-auto px-7 py-3 bg-forest hover:bg-forest-700 disabled:opacity-40 text-white rounded-xl font-bold shadow-editorial transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Telemetry...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-solar" />
                  <span>Execute Analysis &amp; Forecasting</span>
                </>
              )}
            </button>
          </div>

          {/* Dynamic AI Analysis Progress Indicator */}
          {loading && (
            <div className="mt-5 p-4 rounded-xl bg-ivory-100 border border-forest-200 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-forest animate-spin shrink-0" />
              <div className="text-xs text-forest font-mono font-medium">
                {analysisStep || "Running AI models..."}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 bg-[#FDF2F2] border border-[#F5C6CB] text-[#9C2B2B] rounded-xl p-4 flex items-start gap-2.5 text-xs">
              <XCircle className="w-4 h-4 text-[#D9534F] shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Analysis Results View */}
      {result && (
        <div className="space-y-6">
          {/* Navigation Section Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-editorial-divider">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap border-b-2 -mb-px ${
                    isActive
                      ? "border-forest text-forest bg-white rounded-t-lg shadow-editorial-sm"
                      : "border-transparent text-editorial-muted hover:text-editorial-text hover:bg-ivory-100/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-forest" : "text-editorial-muted"}`} />
                  <span>{s.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-solar ml-1" />}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Executive Overview & Summary */}
          {activeSection === "summary" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="editorial-card p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted block mb-1">
                    Terminal Recorded Load
                  </span>
                  <p className="text-3xl font-bold text-editorial-text tracking-tight font-mono">
                    {result.dashboard_summary.current_consumption.toFixed(1)}
                    <span className="text-xs font-normal text-editorial-muted ml-1.5">kWh</span>
                  </p>
                  <p className="text-[11px] text-editorial-muted mt-1">Latest observed telemetry</p>
                </div>

                <div className="editorial-card p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted block mb-1">
                    24h Rolling Average
                  </span>
                  <p className="text-3xl font-bold text-forest tracking-tight font-mono">
                    {result.dashboard_summary.avg_24h.toFixed(1)}
                    <span className="text-xs font-normal text-editorial-muted ml-1.5">kWh</span>
                  </p>
                  <p className="text-[11px] text-editorial-muted mt-1">Operational baseline</p>
                </div>

                <div className="editorial-card p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted block mb-1">
                    Peak Recorded Demand
                  </span>
                  <p className="text-3xl font-bold text-solar-800 tracking-tight font-mono">
                    {result.dashboard_summary.max_24h.toFixed(1)}
                    <span className="text-xs font-normal text-editorial-muted ml-1.5">kWh</span>
                  </p>
                  <p className="text-[11px] text-editorial-muted mt-1">Maximum demand surge</p>
                </div>

                <div className="editorial-card p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted block mb-1">
                    Off-Peak Demand Floor
                  </span>
                  <p className="text-3xl font-bold text-sage-800 tracking-tight font-mono">
                    {result.dashboard_summary.min_24h.toFixed(1)}
                    <span className="text-xs font-normal text-editorial-muted ml-1.5">kWh</span>
                  </p>
                  <p className="text-[11px] text-editorial-muted mt-1">Minimum base load</p>
                </div>
              </div>

              {/* Data Range & Hash Strip */}
              <div className="editorial-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-editorial-muted font-mono">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-forest" />
                  <span>
                    Dataset Scope: {result.dashboard_summary.total_records.toLocaleString()} records •{" "}
                    {new Date(result.dashboard_summary.date_range.start).toLocaleDateString()} to{" "}
                    {new Date(result.dashboard_summary.date_range.end).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-ivory-100 border border-editorial-border text-editorial-text text-[10px]">
                    SHA-256: {result.data_hash.substring(0, 10)}...
                  </span>
                  {result.already_trained_before ? (
                    <span className="text-editorial-muted text-[11px]">Cached Model State</span>
                  ) : (
                    <span className="text-forest text-[11px] font-semibold">Trained Model Weights</span>
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
            <div className="editorial-card-elevated p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-editorial-divider">
                <div className="w-10 h-10 bg-forest-50 border border-forest-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-editorial-text tracking-tight">
                    Auto-Identified Telemetry Schema
                  </h3>
                  <p className="text-xs text-editorial-muted mt-0.5">
                    Heuristic engine parsed column semantics and normalized time alignment
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-ivory-100 border border-editorial-border rounded-xl p-4">
                  <p className="text-[11px] uppercase font-bold text-editorial-muted mb-1">Datetime Timestamp</p>
                  <p className="text-base font-bold text-forest font-mono">
                    {result.detected_columns.datetime_column}
                  </p>
                </div>

                <div className="bg-ivory-100 border border-editorial-border rounded-xl p-4">
                  <p className="text-[11px] uppercase font-bold text-editorial-muted mb-1">Energy Stream Column</p>
                  <p className="text-base font-bold text-editorial-text font-mono truncate">
                    {result.detected_columns.energy_columns.join(", ")}
                  </p>
                </div>

                <div className="bg-ivory-100 border border-editorial-border rounded-xl p-4">
                  <p className="text-[11px] uppercase font-bold text-editorial-muted mb-1">Environmental / Weather</p>
                  <p className="text-base font-bold text-editorial-text font-mono truncate">
                    {result.detected_columns.weather_columns.length > 0
                      ? result.detected_columns.weather_columns.join(", ")
                      : "None (Autonomously simulated)"}
                  </p>
                </div>

                <div className="bg-ivory-100 border border-editorial-border rounded-xl p-4">
                  <p className="text-[11px] uppercase font-bold text-editorial-muted mb-1">Sampling Cadence</p>
                  <p className="text-base font-bold text-sage-800 font-mono">
                    {result.detected_columns.unit_detected} • {result.detected_columns.frequency_minutes}m frequency
                  </p>
                </div>
              </div>

              {/* Statistical Distribution */}
              <div className="border border-editorial-border rounded-xl p-5 bg-white">
                <h4 className="text-xs font-bold text-editorial-text uppercase tracking-wider mb-4">
                  Telemetry Statistical Distribution
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-ivory-100 rounded-lg border border-editorial-border">
                    <p className="text-editorial-muted mb-0.5">Arithmetic Mean</p>
                    <p className="text-base font-bold text-forest font-mono">
                      {result.detected_columns.energy_stats.mean.toFixed(2)} kWh
                    </p>
                  </div>
                  <div className="p-3 bg-ivory-100 rounded-lg border border-editorial-border">
                    <p className="text-editorial-muted mb-0.5">Standard Deviation</p>
                    <p className="text-base font-bold text-editorial-text font-mono">
                      {result.detected_columns.energy_stats.std.toFixed(2)} kWh
                    </p>
                  </div>
                  <div className="p-3 bg-ivory-100 rounded-lg border border-editorial-border">
                    <p className="text-editorial-muted mb-0.5">Global Minimum</p>
                    <p className="text-base font-bold text-sage-800 font-mono">
                      {result.detected_columns.energy_stats.min.toFixed(2)} kWh
                    </p>
                  </div>
                  <div className="p-3 bg-ivory-100 rounded-lg border border-editorial-border">
                    <p className="text-editorial-muted mb-0.5">Global Maximum</p>
                    <p className="text-base font-bold text-solar-800 font-mono">
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
    <div className="editorial-card-elevated p-6 sm:p-7">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-editorial-divider">
        <div className="w-10 h-10 bg-solar-50 border border-solar-200 rounded-xl flex items-center justify-center">
          <Wrench className="w-5 h-5 text-solar" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-editorial-text tracking-tight">
            Prescriptive Remediation &amp; Engineering Plan
          </h3>
          <p className="text-xs text-editorial-muted mt-0.5">
            Operational recommendations categorized by anomaly severity clusters and time of occurrence
          </p>
        </div>
      </div>

      {/* Priority Actions */}
      {data.priority_actions && data.priority_actions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-[#9C2B2B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#D9534F]" />
            Immediate Priority Corrective Actions
          </h4>
          <div className="space-y-2.5">
            {data.priority_actions.map((act, i) => (
              <div
                key={i}
                className="bg-[#FDF2F2] border border-[#F5C6CB] rounded-xl p-3.5 text-xs text-[#9C2B2B] flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-[#D9534F] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="leading-relaxed mt-0.5 font-medium">{act}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categorized Anomaly Accordions */}
      {data.categories && data.categories.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-editorial-muted uppercase tracking-wider mb-3">
            Identified Anomaly Categories
          </h4>
          <div className="space-y-2">
            {data.categories.map((cat) => {
              const isExpanded = expandedCat === cat.type;
              return (
                <div
                  key={cat.type}
                  className="editorial-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedCat(isExpanded ? null : cat.type)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-ivory-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-editorial-text">{cat.label}</p>
                      <p className="text-xs text-editorial-muted mt-0.5">
                        {cat.count} occurrences • Severity: {cat.avg_severity.toFixed(3)}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-editorial-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-editorial-muted" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-editorial-divider text-xs text-editorial-muted leading-relaxed bg-ivory-50">
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
          <h4 className="text-xs font-bold text-forest uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest" />
            Tactical Engineering Steps
          </h4>
          <div className="space-y-2">
            {data.fix_suggestions.map((fix, idx) => (
              <div
                key={idx}
                className="bg-white border border-editorial-border rounded-xl p-3.5 text-xs text-editorial-text flex items-start gap-2.5 shadow-editorial-sm"
              >
                <span className="text-forest font-mono font-bold mt-0.5 shrink-0">#{idx + 1}</span>
                <p className="leading-relaxed">{fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Best Practices */}
      {data.general_suggestions && data.general_suggestions.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-editorial-muted uppercase tracking-wider mb-3">
            Long-Term Operational Guidelines
          </h4>
          <div className="space-y-2">
            {data.general_suggestions.map((sug, idx) => (
              <div
                key={idx}
                className="bg-ivory-100 border border-editorial-border rounded-xl p-3 text-xs text-editorial-muted"
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
