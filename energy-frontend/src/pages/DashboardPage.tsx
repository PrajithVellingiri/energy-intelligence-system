import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { analyticsAPI } from "../lib/api";
import UploadAnalysisPanel from "../components/UploadAnalysisPanel";
import AIMetricsPanel from "../components/AIMetricsPanel";
import {
  Zap,
  LogOut,
  User,
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
    fetchReports();
  }, [fetchReports]);

  const handleSelectReport = async (id: number) => {
    if (id === selectedReportId) return;
    setSelectedReportId(id);
    setShowUpload(false);
    setLoadingReport(true);
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
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
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
  };

  const handleUploadComplete = () => {
    // Refresh the report list after a new upload
    fetchReports();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const gradeColor = (grade: string | null) => {
    if (!grade) return "text-slate-400";
    if (grade.startsWith("A")) return "text-green-400";
    if (grade === "B") return "text-blue-400";
    if (grade === "C") return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Energy Intelligence</h1>
                <p className="text-xs text-slate-400 -mt-0.5">AI-Powered Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <User className="w-4 h-4" />
                <span>{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar: Report History */}
          <aside className="lg:w-80 shrink-0">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 sticky top-24 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Your Reports
                </h2>
                <button
                  onClick={handleNewUpload}
                  className="flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors bg-purple-600/10 hover:bg-purple-600/20 px-3 py-1.5 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Upload
                </button>
              </div>

              {loadingReports ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No reports yet</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Upload a CSV to create your first report
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
                  {reports.map((r) => (
                    <div
                      key={r.id}
                      className={`group relative rounded-xl p-3 cursor-pointer transition-all shadow-md hover:shadow-lg ${
                        selectedReportId === r.id
                          ? "bg-purple-600/20 border border-purple-600/40"
                          : "bg-slate-700/30 border border-transparent hover:bg-slate-700/50 hover:border-slate-600"
                      }`}
                      onClick={() => handleSelectReport(r.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {r.filename}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(r.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {r.health_grade && (
                            <span
                              className={`text-xs font-bold ${gradeColor(r.health_grade)}`}
                            >
                              {r.health_grade}
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        {r.total_records != null && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {r.total_records.toLocaleString()}
                          </span>
                        )}
                        {r.health_score != null && (
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {r.health_score.toFixed(0)}
                          </span>
                        )}
                        {r.anomaly_count != null && r.anomaly_count > 0 && (
                          <span className="flex items-center gap-1 text-amber-400">
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
                        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-600/20 text-slate-500 hover:text-red-400"
                        title="Delete report"
                      >
                        {deletingId === r.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Show upload panel when: no reports, or user clicked "New Upload" */}
            {(showUpload || (!selectedReportId && !loadingReport)) && (
              <>
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border border-blue-700/30 rounded-2xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600/30 rounded-xl flex items-center justify-center shrink-0">
                      <Upload className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">
                        {reports.length > 0
                          ? "Upload New Report"
                          : `Welcome${user?.username ? `, ${user.username}` : ""}`}
                      </h2>
                      <p className="text-sm text-slate-300">
                        Upload a CSV file with your energy consumption data to get AI-powered
                        analytics, forecasting, anomaly detection, and optimization
                        recommendations.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          CSV format with timestamp &amp; energy columns
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" />
                          Auto-detects column types
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <UploadAnalysisPanel onUploadComplete={handleUploadComplete} />
              </>
            )}

            {/* Show a saved report */}
            {selectedReportId && !showUpload && (
              <>
                {loadingReport ? (
                  <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  </div>
                ) : selectedReportData ? (
                  <UploadAnalysisPanel
                    savedReport={selectedReportData}
                    onUploadComplete={handleUploadComplete}
                  />
                ) : (
                  <div className="text-center py-24 text-slate-500">
                    <p>Failed to load report.</p>
                  </div>
                )}
              </>
            )}

            {/* AI Metrics Panel */}
            <AIMetricsPanel />

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-slate-500">
              <p>
                AI Energy Intelligence Platform | Powered by LSTM, Isolation Forest &amp;
                Advanced Analytics
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
