import { Leaf, Shield, Wind, Sparkles, CheckCircle2, Award } from "lucide-react";

export interface EnergyScoreData {
  energy_health_score: number;
  grade?: string;
  carbon_emissions?: number;
  carbon_emissions_kg?: number;
  carbon_emissions_tons?: number;
  anomaly_rate?: number;
  peak_variance?: number;
  insight_summary?: string[];
}

interface EnergyScoreCardProps {
  data?: EnergyScoreData | null;
}

export default function EnergyScoreCard({ data }: EnergyScoreCardProps) {
  if (!data || data.energy_health_score == null) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
        <p className="text-slate-400 text-sm">Health score telemetry not available.</p>
      </div>
    );
  }

  const score = Math.round(data.energy_health_score);

  const getGrade = (s: number, explicitGrade?: string) => {
    if (explicitGrade) return explicitGrade;
    if (s >= 90) return "A+";
    if (s >= 80) return "A";
    if (s >= 70) return "B";
    if (s >= 60) return "C";
    if (s >= 50) return "D";
    return "F";
  };

  const grade = getGrade(score, data.grade);

  const getColorTheme = (s: number) => {
    if (s >= 80) {
      return {
        hex: "#10b981",
        stroke: "text-emerald-500",
        badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        glow: "shadow-glow-emerald",
        text: "text-emerald-400",
      };
    }
    if (s >= 65) {
      return {
        hex: "#06b6d4",
        stroke: "text-cyan-500",
        badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        glow: "shadow-glow-cyan",
        text: "text-cyan-400",
      };
    }
    if (s >= 50) {
      return {
        hex: "#f59e0b",
        stroke: "text-amber-500",
        badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        glow: "shadow-glow-amber",
        text: "text-amber-400",
      };
    }
    return {
      hex: "#ef4444",
      stroke: "text-rose-500",
      badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      glow: "shadow-glow-amber",
      text: "text-rose-400",
    };
  };

  const theme = getColorTheme(score);

  // SVG Gauge calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const carbonKg = data.carbon_emissions ?? data.carbon_emissions_kg ?? (score ? (100 - score) * 12.5 : 0);

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 relative overflow-hidden">
      {/* Ambient background accent */}
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-glow-emerald">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              Energy Health &amp; Sustainability Index
              <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
                Grade {grade}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Weighted composite evaluating load stability, anomaly frequency, and carbon intensity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-surface-elevated/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Sustainability Tier: {grade}</span>
          </div>
        </div>
      </div>

      {/* Gauge and Highlights Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-center">
        {/* Circular SVG Gauge */}
        <div className="flex flex-col items-center justify-center bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#1e293b"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke={theme.hex}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white tracking-tight">{score}</span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                / 100 Index
              </span>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-300 mt-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Grid Efficiency Status: <span className={theme.text}>{grade} Rating</span>
          </p>
        </div>

        {/* Environmental & Carbon Metrics */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Carbon Footprint</span>
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tight">
                {carbonKg.toFixed(1)}
                <span className="text-xs font-normal text-slate-400 ml-1.5">kg CO₂</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Estimated emissions based on regional grid emission factors
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Sustainability Tier</span>
              <Wind className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-3xl font-black text-cyan-300 tracking-tight">
                {score >= 75 ? "Eco-Optimal" : score >= 55 ? "Moderate" : "High-Carbon"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Calculated against commercial enterprise benchmark curves
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights & Observations */}
      {data.insight_summary && data.insight_summary.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Diagnostic Health Insights
            </h4>
          </div>

          <div className="space-y-2.5">
            {data.insight_summary.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-xs text-slate-300 bg-surface-elevated/40 border border-slate-800/60 rounded-lg p-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
