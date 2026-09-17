import { Link } from "react-router-dom";
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Brain,
  Shield,
  Activity,
  ArrowRight,
  Cpu,
  Database,
  Sparkles,
  ChevronRight,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: TrendingUp,
      title: "LSTM Demand Forecasting",
      description: "2-layer PyTorch LSTM neural network with recursive multi-step inference predicting load profiles up to 168 hours ahead.",
      badge: "Deep Learning",
      color: "cyan",
      borderColor: "hover:border-cyan-500/40",
      glowColor: "group-hover:shadow-glow-cyan",
    },
    {
      icon: AlertTriangle,
      title: "Surveillance & Outlier Detection",
      description: "Unsupervised Isolation Forest algorithm calculating continuous severity scores across multidimensional energy features.",
      badge: "Isolation Forest",
      color: "rose",
      borderColor: "hover:border-rose-500/40",
      glowColor: "group-hover:shadow-glow-amber",
    },
    {
      icon: BarChart3,
      title: "Dynamic Tariff Load Shifting",
      description: "Simulates peak-to-off-peak arbitrage with dynamic tariff modeling to eliminate demand surcharges and shave costs.",
      badge: "Cost Arbitrage",
      color: "emerald",
      borderColor: "hover:border-emerald-500/40",
      glowColor: "group-hover:shadow-glow-emerald",
    },
    {
      icon: Brain,
      title: "Sustainability Health Scoring",
      description: "Weighted composite sustainability index calculating carbon footprint in kg CO₂ and automated engineering repair prescriptions.",
      badge: "Composite Index",
      color: "violet",
      borderColor: "hover:border-violet-500/40",
      glowColor: "group-hover:shadow-glow-violet",
    },
  ];

  const specs = [
    { label: "Lookback Context", value: "24-Hour Sliding Window" },
    { label: "Neural Model", value: "Stacked PyTorch LSTM" },
    { label: "Outlier Contamination", value: "5% Calibrated Threshold" },
    { label: "Telemetry Parser", value: "Auto-Column Heuristic Normalizer" },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 relative overflow-hidden bg-grid-pattern selection:bg-cyan-500/30">
      {/* Radial Ambient Orbs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[600px] -left-40 w-[500px] h-[500px] bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[800px] -right-40 w-[500px] h-[500px] bg-emerald-600/10 blur-[130px] pointer-events-none" />

      {/* Top Navigation */}
      <nav className="border-b border-slate-800/80 bg-[#07090e]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-glow-cyan">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Energy Intelligence
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium -mt-0.5">
                  AI-Powered Demand &amp; Anomaly Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-glow-cyan transition-all hover:scale-[1.02] flex items-center gap-1.5"
              >
                <span>Launch Console</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2.5 bg-surface-elevated/80 border border-slate-700/80 rounded-full px-4 py-1.5 mb-8 shadow-inner-glow backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-glow-emerald" />
            <span className="text-xs font-semibold text-slate-300">
              Autonomous AI Grid Intelligence Engine Active
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 sm:mb-8 leading-[1.1]">
            Next-Generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Energy Telemetry &amp; AI
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
            Neural time-series forecasting, unsupervised anomaly detection, and automated load shifting
            engineered for commercial facilities, microgrids, and energy executives.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-glow-cyan transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group text-sm sm:text-base"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-surface-elevated/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-semibold rounded-xl transition-all text-sm sm:text-base backdrop-blur-md flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Explore Live Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Hero Interactive Terminal Mockup */}
        <div className="mt-16 sm:mt-20 max-w-5xl mx-auto">
          <div className="glass-panel-elevated rounded-2xl p-4 sm:p-7 relative border border-slate-700/80 shadow-2xl">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">energy-ai-core: v2.4.0 (active)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LSTM + Isolation Forest Live Pipeline</span>
              </div>
            </div>

            {/* Mock Dashboard Preview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400">Current Facility Load</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  142.8 <span className="text-xs font-normal text-slate-400">kWh</span>
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                  <TrendingUp className="w-3 h-3" /> Nominal Operation
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400">24h Peak Forecast</p>
                <p className="text-xl sm:text-2xl font-black text-cyan-300 mt-0.5">
                  186.4 <span className="text-xs font-normal text-slate-400">kWh</span>
                </p>
                <div className="flex items-center gap-1 text-[10px] text-cyan-400 mt-1">
                  <Activity className="w-3 h-3" /> Recursive LSTM
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400">Surveillance Status</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                  Zero Anomalies
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> Contamination 0.05
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                <p className="text-[11px] text-slate-400">Projected Savings</p>
                <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                  16.8%
                </p>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1">
                  <BarChart3 className="w-3 h-3" /> Load Shifting On
                </div>
              </div>
            </div>

            {/* Visual Waveform preview bar */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Compatible with raw smart meter CSVs &amp; SCADA telemetry dumps</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Historical
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Prediction
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Intelligence Matrix Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" /> Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Commercial Energy Architecture
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Every layer from raw timeseries ingest to neural forecasting and financial load shifting is engineered for speed and mathematical rigor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`glass-panel rounded-2xl p-6 sm:p-8 transition-all duration-300 border border-slate-800/80 ${f.borderColor} ${f.glowColor} group`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-surface-elevated flex items-center justify-center border border-slate-700/60 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed font-normal">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technical Specifications Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
          <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-6 text-center">
            Standard Telemetry Specifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {specs.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                <p className="text-base sm:text-lg font-bold text-white font-mono">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Conversion Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-3xl overflow-hidden glass-panel-elevated border border-cyan-500/30 p-8 sm:p-14 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-600/10 pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              Ready to deploy AI analytics to your energy grid?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-8 font-normal">
              Sign up instantly to access your personal telemetry vault and analyze high-volume energy datasets.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-glow-cyan transition-all hover:scale-[1.02]"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-[#07090e]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-600/30 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="font-semibold text-slate-400">AI Energy Intelligence Platform</span>
          </div>
          <p>Production PyTorch + FastAPI + React Enterprise Architecture</p>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hover:text-slate-400">Login</Link>
            <span>•</span>
            <Link to="/signup" className="hover:text-slate-400">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
