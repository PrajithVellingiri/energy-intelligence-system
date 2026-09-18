import { Link } from "react-router-dom";
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: TrendingUp,
      title: "LSTM Neural Demand Forecasting",
      description:
        "Stacked 2-layer PyTorch neural network with recursive sequence inference projecting 24-hour forward facility load curves with 0.0038 MSE validation accuracy.",
      badge: "Deep Learning",
    },
    {
      icon: AlertTriangle,
      title: "Isolation Forest Surveillance",
      description:
        "Unsupervised multivariate anomaly detection flagging non-linear demand surges, off-peak equipment runaways, and unmetered consumption variances.",
      badge: "Outlier Detection",
    },
    {
      icon: BarChart3,
      title: "Dynamic Tariff Load Shifting",
      description:
        "Algorithmic time-of-use economic dispatch evaluating elastic thermal and machinery loads to shift demand into lowest-cost renewable surplus hours.",
      badge: "Cost Arbitrage",
    },
    {
      icon: Shield,
      title: "Sustainability Health Scoring",
      description:
        "Standardized composite energy index tracking carbon intensity in metric tons CO₂ alongside automated engineering remediation checklists.",
      badge: "ESG Index",
    },
  ];

  const specs = [
    { label: "Neural Model Architecture", value: "Stacked PyTorch LSTM (2 Layers, 64 Hidden Units)" },
    { label: "Sliding Lookback Window", value: "24-Hour Sequential Context Horizon" },
    { label: "Contamination Threshold", value: "5% Calibrated Isolation Forest Sensitivity" },
    { label: "Ingestion Heuristics", value: "Auto-Column Detection & Frequency Normalization (5m–60m)" },
    { label: "API & Inference Engine", value: "Asynchronous FastAPI Core with SQLite Vault" },
    { label: "Mathematical Arbitrage", value: "Dynamic TOU Rate Differential Model" },
  ];

  return (
    <div className="min-h-screen bg-ivory text-editorial-text selection:bg-forest-100">
      {/* Top Editorial Header Navigation */}
      <header className="border-b border-editorial-border bg-white sticky top-0 z-50 shadow-editorial-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-forest rounded-xl flex items-center justify-center text-white shadow-editorial-sm">
                <Zap className="w-5 h-5 text-solar" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-forest">
                    ENERGY INTELLIGENCE
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-forest-50 text-forest border border-forest-100">
                    Climate Analytics
                  </span>
                </div>
                <p className="text-[11px] text-editorial-muted -mt-0.5">
                  AI-Powered Demand Forecasting &amp; Anomaly Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-xs sm:text-sm font-bold text-editorial-muted hover:text-forest transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-forest hover:bg-forest-700 rounded-xl shadow-editorial transition-all flex items-center gap-2"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-16 sm:pt-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-[11px] uppercase font-bold tracking-widest text-forest mb-4">
            <span className="w-2 h-2 rounded-full bg-solar" />
            Solar Editorial • Time-Series Intelligence
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-editorial-text leading-[1.15]">
            Predictive Load Intelligence for Sustainable Industrial Facilities
          </h1>

          <p className="mt-4 text-sm sm:text-base text-editorial-muted leading-relaxed max-w-2xl">
            A publication-grade clean energy analytics platform combining deep neural sequence forecasting, continuous anomaly surveillance, and automated peak-tariff arbitrage.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="px-7 py-3.5 text-sm font-bold text-white bg-forest hover:bg-forest-700 rounded-xl shadow-editorial transition-all flex items-center gap-2"
            >
              <span>Access Telemetry Vault</span>
              <ArrowRight className="w-4 h-4 text-solar" />
            </Link>

            <a
              href="#specifications"
              className="px-6 py-3.5 text-sm font-bold text-forest bg-white hover:bg-ivory-100 border border-forest-200 rounded-xl transition-all shadow-editorial-sm"
            >
              Technical Specifications
            </a>
          </div>
        </div>

        {/* Editorial Data Presentation Showcase Card */}
        <div className="editorial-card-elevated p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-editorial-divider">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-forest-50 px-2 py-0.5 rounded border border-forest-100 block mb-1">
                Live Data Snapshot
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-editorial-text tracking-tight">
                Benchmark Facility Telemetry • 17,521 Hourly Records
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-editorial-muted bg-ivory-100 border border-editorial-border px-3 py-1.5 rounded-lg self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-forest" />
              <span>Model Status: Calibrated (Loss: 0.0038 MSE)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-ivory-100 border border-editorial-border rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted block mb-1">
                Current Consumption
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-editorial-text tracking-tight font-mono">
                48.2 <span className="text-xs font-normal text-editorial-muted">MWh</span>
              </p>
              <span className="text-[11px] text-forest font-semibold mt-1 block">
                &darr; 6.4% from baseline
              </span>
            </div>

            <div className="bg-forest-50 border border-forest-100 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 block mb-1">
                LSTM Forecast Accuracy
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-forest tracking-tight font-mono">
                94.7%
              </p>
              <span className="text-[11px] text-forest-600 font-medium mt-1 block">
                24-Hour Horizon Fit
              </span>
            </div>

            <div className="bg-[#FEF9EE] border border-[#F9E2AF] rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-solar-800 block mb-1">
                Demand Arbitrage
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-solar-800 tracking-tight font-mono">
                13.3%
              </p>
              <span className="text-[11px] text-solar-700 font-medium mt-1 block">
                Peak Load Shifted
              </span>
            </div>

            <div className="bg-sage-50 border border-sage-200 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sage-800 block mb-1">
                Facility Health Rating
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-sage-800 tracking-tight font-mono">
                Grade B
              </p>
              <span className="text-[11px] text-sage-700 font-medium mt-1 block">
                Composite ESG Index
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="py-16 sm:py-20 border-t border-editorial-divider bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-forest-50 px-2 py-0.5 rounded border border-forest-100 mb-2 inline-block">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-editorial-text">
              Engineered for Industrial Energy Operations
            </h2>
            <p className="text-xs sm:text-sm text-editorial-muted mt-1 leading-relaxed">
              Replacing decorative dashboards with publication-grade data modeling, strict validation pipelines, and prescriptive engineering fixes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="editorial-card p-6 sm:p-8 hover:border-forest-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-ivory-100 border border-editorial-border rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-forest" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-ivory-100 text-editorial-muted border border-editorial-border">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-editorial-text tracking-tight mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-editorial-divider flex items-center justify-between text-xs text-forest font-bold">
                    <span>Verified Production Pipeline</span>
                    <ArrowRight className="w-3.5 h-3.5 text-solar" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Specifications Section */}
      <section id="specifications" className="py-16 sm:py-20 border-t border-editorial-divider bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-forest-50 px-2 py-0.5 rounded border border-forest-100 mb-2 inline-block">
              System Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-editorial-text">
              Algorithmic &amp; Architectural Specifications
            </h2>
            <p className="text-xs sm:text-sm text-editorial-muted mt-1">
              Scientific parameters governing time-series ingest, feature scaling, neural convergence, and rate optimization.
            </p>
          </div>

          <div className="editorial-card-elevated overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-editorial-divider bg-ivory-100/60 text-[11px] uppercase tracking-wider text-editorial-muted font-bold">
                  <th className="py-3.5 px-6">Pipeline Component</th>
                  <th className="py-3.5 px-6">Implementation Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-divider text-xs sm:text-sm">
                {specs.map((item, idx) => (
                  <tr key={idx} className="hover:bg-ivory-50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-editorial-text">
                      {item.label}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-forest">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 sm:py-20 border-t border-editorial-divider bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-ivory-100 border border-editorial-border rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-forest-50 px-2 py-0.5 rounded border border-forest-100 mb-2 inline-block">
                Start Telemetry Evaluation
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-editorial-text">
                Ready to Ingest Facility Energy Readings?
              </h2>
              <p className="text-xs sm:text-sm text-editorial-muted mt-2 leading-relaxed">
                Connect live smart meters or drag &amp; drop standard CSV logs to generate instantaneous 24-hour neural forecasts and anomaly audit reports.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-forest hover:bg-forest-700 rounded-xl shadow-editorial transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Create Operator Account</span>
                <ArrowRight className="w-4 h-4 text-solar" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-forest bg-white hover:bg-ivory-50 border border-editorial-border rounded-xl shadow-editorial-sm transition-all text-center"
              >
                Demo Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="py-10 border-t border-editorial-divider bg-ivory text-xs text-editorial-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-forest flex items-center justify-center text-white text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-solar" />
            </div>
            <span className="font-bold text-editorial-text">ENERGY INTELLIGENCE</span>
            <span>• Editorial Analytics &amp; Climate Platform</span>
          </div>

          <p className="font-mono text-[11px]">
            PyTorch LSTM • Isolation Forest • FastAPI Core • Manrope Editorial
          </p>
        </div>
      </footer>
    </div>
  );
}
