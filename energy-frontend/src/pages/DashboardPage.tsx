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
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

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
        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
          isA
            ? "bg-forest-50 text-forest border-forest-200"
            : isB
            ? "bg-sage-50 text-sage-800 border-sage-200"
            : isC
            ? "bg-solar-50 text-solar-800 border-solar-200"
            : "bg-[#FDF2F2] text-[#9C2B2B] border-[#F5C6CB]"
        }`}
      >
        Grade {grade}
      </span>
    );
  };

  // Sidebar report list component (used for both desktop and mobile drawer)
  const renderReportsList = () => (
    <div className="space-y-6">
      {/* Overview Section */}
      <div>
        <span className="text-[10px] font-bold text-editorial-muted uppercase tracking-widest block mb-2.5 px-3">
          Overview
        </span>
        <div className="space-y-1">
          <button
            onClick={() => {
              if (reports.length > 0 && !selectedReportId) {
                handleSelectReport(reports[0].id);
              } else {
                setShowUpload(false);
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              !showUpload && selectedReportId
                ? "bg-forest-50 text-forest font-bold"
                : "text-editorial-text hover:bg-ivory-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-forest" />
              <span>Active Telemetry</span>
            </span>
            {!showUpload && selectedReportId && (
              <span className="w-1.5 h-1.5 rounded-full bg-solar" />
            )}
          </button>

          <button
            onClick={handleNewUpload}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              showUpload || (!selectedReportId && !loadingReport)
                ? "bg-forest-50 text-forest font-bold"
                : "text-editorial-text hover:bg-ivory-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-solar" />
              <span>Ingest Dataset</span>
            </span>
            {(showUpload || (!selectedReportId && !loadingReport)) && (
              <span className="w-1.5 h-1.5 rounded-full bg-solar" />
            )}
          </button>
        </div>
      </div>

      <div className="border-t border-editorial-divider" />

      {/* Telemetry Vault Reports Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-3">
          <span className="text-[10px] font-bold text-editorial-muted uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-forest" />
            Telemetry Vault ({reports.length})
          </span>
          <button
            onClick={handleNewUpload}
            className="text-[11px] font-bold text-forest hover:text-forest-600 flex items-center gap-1"
            title="Upload new CSV"
          >
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
        </div>

        {loadingReports ? (
          <div className="flex items-center justify-center py-8 text-editorial-muted">
            <Loader2 className="w-4 h-4 animate-spin text-forest" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 px-3 bg-ivory-100 rounded-xl border border-editorial-border">
            <Upload className="w-6 h-6 text-editorial-muted mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-editorial-text">No Telemetry Stored</p>
            <p className="text-[11px] text-editorial-muted mt-0.5">
              Upload a CSV dataset to initiate analysis
            </p>
            <button
              onClick={handleNewUpload}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline"
            >
              Import Data &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[calc(100vh-25rem)] overflow-y-auto pr-1">
            {reports.map((r) => {
              const isSelected = selectedReportId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectReport(r.id)}
                  className={`group relative rounded-xl p-3 cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-forest-50 border-forest-300 text-forest shadow-editorial-sm"
                      : "bg-white border-editorial-border hover:border-editorial-muted hover:bg-ivory-50"
                  }`}
                >
                  {/* Left Amber Indicator on active selection */}
                  {isSelected && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-solar rounded-r" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 pl-1">
                      <p className="text-xs font-bold truncate flex items-center gap-1.5 text-editorial-text">
                        <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-forest" : "text-editorial-muted"}`} />
                        <span className="truncate">{r.filename}</span>
                      </p>
                      <p className="text-[10px] text-editorial-muted mt-0.5 font-mono">
                        {formatDate(r.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {gradeBadge(r.health_grade)}
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${
                          isSelected ? "text-forest" : "text-editorial-muted/40"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 pl-1 text-[10px] font-mono text-editorial-muted">
                    {r.total_records != null && (
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3 text-editorial-muted" />
                        {r.total_records.toLocaleString()}
                      </span>
                    )}
                    {r.health_score != null && (
                      <span className="flex items-center gap-1 text-forest font-semibold">
                        <Shield className="w-3 h-3" />
                        {r.health_score.toFixed(0)}/100
                      </span>
                    )}
                    {r.anomaly_count != null && r.anomaly_count > 0 && (
                      <span className="flex items-center gap-1 text-solar-800 font-bold">
                        <AlertTriangle className="w-3 h-3 text-solar" />
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
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#FDF2F2] text-editorial-muted hover:text-[#D9534F]"
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

      <div className="border-t border-editorial-divider" />

      {/* System Status Section */}
      <div>
        <span className="text-[10px] font-bold text-editorial-muted uppercase tracking-widest block mb-2 px-3">
          Engine Architecture
        </span>
        <div className="space-y-1 text-xs text-editorial-muted px-3">
          <div className="flex items-center justify-between py-1 border-b border-editorial-divider">
            <span>Neural Forecaster</span>
            <span className="font-mono font-bold text-forest">PyTorch LSTM</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-editorial-divider">
            <span>Surveillance Model</span>
            <span className="font-mono font-bold text-forest">Isolation Forest</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span>Inference Status</span>
            <span className="font-mono font-bold text-sage-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sage" />
              Live Engine
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory text-editorial-text selection:bg-forest-100">
      {/* Top Editorial Console Navigation */}
      <header className="border-b border-editorial-border bg-white sticky top-0 z-50 shadow-editorial-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <div className="flex items-center gap-3">
              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-editorial-border text-editorial-muted hover:text-editorial-text bg-ivory-100"
                aria-label="Toggle Navigation Drawer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div
                onClick={() => navigate("/")}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {/* Solar Identity Glyphs */}
                <div className="w-9 h-9 bg-forest rounded-xl flex items-center justify-center text-white shadow-editorial-sm group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 text-solar" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-bold tracking-tight text-forest">
                      ENERGY INTELLIGENCE
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-forest-50 text-forest border border-forest-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                      Core Live
                    </span>
                  </div>
                  <p className="text-[11px] text-editorial-muted -mt-0.5">
                    Clean Energy &amp; Climate Intelligence Platform
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {currentDateTime && (
                <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-editorial-muted bg-ivory-100 border border-editorial-border px-3 py-1.5 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-forest" />
                  <span>{currentDateTime}</span>
                </div>
              )}

              <button
                onClick={() => navigate("/")}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-editorial-muted hover:text-forest px-3 py-1.5 rounded-lg border border-editorial-border bg-white hover:bg-ivory-100 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Publication Home</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-editorial-text bg-ivory-100 border border-editorial-border px-3 py-1.5 rounded-lg">
                <div className="w-6 h-6 rounded-md bg-forest text-white font-bold flex items-center justify-center text-[11px]">
                  {user?.username?.charAt(0).toUpperCase() || "O"}
                </div>
                <span className="font-bold hidden sm:inline">{user?.username || "Operator"}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-semibold text-editorial-muted hover:text-[#D9534F] transition-colors px-3 py-1.5 rounded-lg border border-editorial-border bg-white hover:bg-[#FDF2F2]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Slide-over Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-editorial-text/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white border-r border-editorial-border p-5 h-full z-50 flex flex-col justify-between overflow-y-auto shadow-editorial-lg">
            {renderReportsList()}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 w-full py-2.5 text-xs font-bold text-forest bg-forest-50 border border-forest-100 rounded-xl"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar: Minimalist Telemetry Vault */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <div className="editorial-card-elevated p-5 sticky top-24">
              {renderReportsList()}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Editorial Dashboard Header */}
            <div className="mb-6 pb-5 border-b border-editorial-divider">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-forest-50 px-2 py-0.5 rounded border border-forest-100 mb-2 inline-block">
                Energy Intelligence • Facility Telemetry
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-editorial-text">
                Operational Overview
              </h2>
              <p className="text-xs sm:text-sm text-editorial-muted mt-1 max-w-3xl leading-relaxed">
                Continuous facility monitoring, 24-hour forward demand forecasting, unsupervised anomaly detection, and dynamic time-of-use cost arbitrage.
              </p>
            </div>

            {/* Ingestion Dropzone & Realtime Analysis */}
            {(showUpload || (!selectedReportId && !loadingReport)) && (
              <UploadAnalysisPanel onUploadComplete={handleUploadComplete} />
            )}

            {/* Saved Report Loaded View */}
            {selectedReportId && !showUpload && (
              <>
                {loadingReport ? (
                  <div className="editorial-card p-16 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-forest mb-3" />
                    <p className="text-sm font-bold text-editorial-text">
                      Loading Historical Telemetry Report...
                    </p>
                    <p className="text-xs text-editorial-muted mt-1 font-mono">
                      Querying SQLite analysis vault ID #{selectedReportId}
                    </p>
                  </div>
                ) : selectedReportData ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-white border border-editorial-border rounded-xl px-4 py-3 text-xs text-editorial-muted font-mono shadow-editorial-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-forest" />
                        <span className="text-editorial-text font-bold">
                          {(selectedReportData as any).filename || "Saved Telemetry Report"}
                        </span>
                      </div>
                      <button
                        onClick={handleNewUpload}
                        className="text-forest hover:underline font-bold flex items-center gap-1"
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
                  <div className="editorial-card p-12 text-center text-editorial-muted">
                    <p>Failed to retrieve stored report records.</p>
                  </div>
                )}
              </>
            )}

            {/* AI Diagnostics Panel */}
            <AIMetricsPanel />

            {/* Platform Metadata Editorial Footer */}
            <footer className="mt-12 py-6 border-t border-editorial-divider text-center text-xs text-editorial-muted flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>Energy Intelligence System • Clean Energy Analytics &amp; Climate Tech Platform</p>
              <p className="font-mono text-[11px] text-forest font-semibold">
                PyTorch LSTM • Isolation Forest • FastAPI Core
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
