import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { analyticsAPI } from "../lib/api";
import UploadAnalysisPanel from "../components/UploadAnalysisPanel";
import AIMetricsPanel from "../components/AIMetricsPanel";
import {
  Zap,
  LogOut,
  Upload,
  FileText,
  Clock,
  Trash2,
  ChevronRight,
  Plus,
  BarChart3,
  Shield,
  AlertTriangle,
  Loader2,
  Home,
  Menu,
  X,
} from "lucide-react";

interface ReportSummary {
  id: number;
  filename: string;
  record_count: number;
  avg_24h: number | null;
  max_24h: number | null;
  health_score: number | null;
  health_grade: string | null;
  anomaly_count: number | null;
  total_records: number | null;
  date_range_start: string | null;
  date_range_end: string | null;
  created_at: string | null;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedReportData, setSelectedReportData] = useState<unknown>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const res = await analyticsAPI.listReports();
      setReports(res.data);
    } catch {
      // ignore
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    setReports([]);
    setSelectedReportId(null);
    setSelectedReportData(null);
    setShowUpload(false);
    fetchReports();
  }, [fetchReports, user?.email]);

  const handleSelectReport = async (id: number) => {
    if (id === selectedReportId) return;
    setSelectedReportId(id);
    setShowUpload(false);
    setLoadingReport(true);
    setMobileMenuOpen(false);
    try {
      const res = await analyticsAPI.getReport(id);
      setSelectedReportData(res.data);
    } catch {
      setSelectedReportData(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!window.confirm("Permanently remove this telemetry report?")) return;
    setDeletingId(id);
    try {
      await analyticsAPI.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (selectedReportId === id) {
        setSelectedReportId(null);
        setSelectedReportData(null);
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const handleNewUpload = () => {
    setSelectedReportId(null);
    setSelectedReportData(null);
    setShowUpload(true);
    setMobileMenuOpen(false);
  };

  const handleUploadComplete = () => {
    fetchReports();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const gradeBadge = (grade: string | null) => {
    if (!grade) return null;
    const isA = grade.startsWith("A");
    const isB = grade === "B";
    const isC = grade === "C";
    return (
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          isA
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            : isB
            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
            : isC
            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
        }`}
      >
        Grade {grade}
      </span>
    );
  };

  // Sidebar report list component (used for both desktop and mobile drawer)
  const renderReportsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          Telemetry Vault ({reports.length})
        </h2>
        <button
          onClick={handleNewUpload}
          className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 rounded-xl transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Upload</span>
        </button>
      </div>

      {loadingReports ? (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-10 px-3 bg-slate-900/40 rounded-xl border border-slate-800">
          <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
          <p className="text-xs font-semibold text-slate-400">No reports generated yet</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Ingest a CSV dataset to initiate AI predictions
          </p>
          <button
            onClick={handleNewUpload}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:underline"
          >
            Upload Now &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
          {reports.map((r) => {
            const isSelected = selectedReportId === r.id;
            return (
              <div
                key={r.id}
                onClick={() => handleSelectReport(r.id)}
                className={`group relative rounded-xl p-3.5 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-cyan-500/10 border border-cyan-500/50 shadow-glow-cyan"
                    : "bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{r.filename}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      {formatDate(r.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {gradeBadge(r.health_grade)}
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? "text-cyan-400" : "text-slate-600"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2.5 text-[11px] text-slate-400 font-mono">
                  {r.total_records != null && (
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3 text-slate-500" />
                      {r.total_records.toLocaleString()}
                    </span>
                  )}
                  {r.health_score != null && (
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      {r.health_score.toFixed(0)}/100
                    </span>
                  )}
                  {r.anomaly_count != null && r.anomaly_count > 0 && (
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <AlertTriangle className="w-3 h-3" />
                      {r.anomaly_count}
                    </span>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteReport(r.id);
                  }}
                  disabled={deletingId === r.id}
                  className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                  title="Delete report"
                >
                  {deletingId === r.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-pattern text-slate-100 selection:bg-cyan-500/30">
      {/* Top Console Navigation */}
      <nav className="border-b border-slate-800/80 bg-[#07090e]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <div className="flex items-center gap-3">
              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl glass-panel text-slate-400 hover:text-white"
                aria-label="Toggle Reports Drawer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div
                onClick={() => navigate("/")}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-glow-cyan group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-black tracking-tight text-white">
                      Energy Intelligence
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Core Live
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 -mt-0.5">Control Center &amp; Ingestion</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate("/")}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl glass-panel transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-300 bg-surface-elevated border border-slate-700/80 px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[11px]">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="font-semibold">{user?.username}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors px-3 py-1.5 rounded-xl glass-panel hover:border-rose-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Slide-over Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-[#0c101a] border-r border-slate-800 p-5 h-full z-50 flex flex-col justify-between overflow-y-auto shadow-2xl">
            {renderReportsList()}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 w-full py-2.5 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 rounded-xl"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar: Telemetry Vault */}
          <aside className="hidden lg:block lg:w-80 shrink-0">
            <div className="glass-panel-elevated rounded-2xl p-5 sticky top-24 border border-slate-800/90 shadow-xl">
              {renderReportsList()}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Context Banner */}
            {(showUpload || (!selectedReportId && !loadingReport)) && (
              <div className="glass-panel-elevated rounded-2xl p-6 mb-6 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl flex items-center justify-center shrink-0 shadow-glow-cyan">
                    <Upload className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {reports.length > 0
                        ? "Ingest New Telemetry Stream"
                        : `Welcome to the Console, ${user?.username || "Operator"}`}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl font-normal">
                      Feed real-time or historical energy readings (any frequency from 5-minute smart meters to hourly facility SCADA).
                      Our neural pipelines will automatically validate, forecast demand, uncover anomaly footprints, and evaluate cost-reduction opportunities.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ingestion Dropzone & Realtime Analysis */}
            {(showUpload || (!selectedReportId && !loadingReport)) && (
              <UploadAnalysisPanel onUploadComplete={handleUploadComplete} />
            )}

            {/* Saved Report Loaded View */}
            {selectedReportId && !showUpload && (
              <>
                {loadingReport ? (
                  <div className="glass-panel-elevated rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
                    <p className="text-sm font-bold text-white">Loading Historical Telemetry Report...</p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Querying SQLite analysis vault ID #{selectedReportId}
                    </p>
                  </div>
                ) : selectedReportData ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 font-mono">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span className="text-white font-bold">
                          {(selectedReportData as any).filename || "Saved Telemetry Report"}
                        </span>
                      </div>
                      <button
                        onClick={handleNewUpload}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload another CSV</span>
                      </button>
                    </div>

                    <UploadAnalysisPanel
                      savedReport={selectedReportData}
                      onUploadComplete={handleUploadComplete}
                    />
                  </div>
                ) : (
                  <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">
                    <p>Failed to retrieve stored report records.</p>
                  </div>
                )}
              </>
            )}

            {/* AI Diagnostics Panel */}
            <AIMetricsPanel />

            {/* Platform Metadata Footer */}
            <div className="mt-10 py-6 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>Energy Intelligence Platform • Industrial Time-Series AI Engine</p>
              <p className="font-mono text-[11px]">PyTorch LSTM • Isolation Forest • FastAPI</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
