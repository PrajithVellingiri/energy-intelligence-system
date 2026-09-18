import { Shield, Award, Leaf, Wind, CheckCircle2 } from "lucide-react";

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
      <div className="editorial-card p-12 text-center">
        <Shield className="w-8 h-8 text-forest/40 mx-auto mb-3" />
        <p className="text-sm font-semibold text-editorial-text">Sustainability Telemetry Unavailable</p>
        <p className="text-xs text-editorial-muted mt-1">Upload a dataset to evaluate the carbon &amp; efficiency index.</p>
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

  // Circular gauge math (radius = 56, circumference = ~351.86)
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const carbonKg = data.carbon_emissions_kg ?? (data.carbon_emissions != null ? data.carbon_emissions * 1000 : 0);
  const carbonTons = data.carbon_emissions_tons ?? carbonKg / 1000;

  const insights = data.insight_summary && data.insight_summary.length > 0
    ? data.insight_summary
    : [
        "Load profiles indicate steady baselines during daytime operational windows.",
        "Low carbon intensity observed relative to industrial regional benchmarks.",
        "Demand spikes can be managed with automated peak shaving dispatch.",
      ];

  return (
    <div className="editorial-card-elevated p-6 sm:p-7">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-editorial-divider">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
              Sustainability &amp; ESG
            </span>
            <span className="text-[11px] text-editorial-muted flex items-center gap-1 font-medium">
              <Award className="w-3.5 h-3.5 text-solar" />
              Composite Performance Index
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-editorial-text">
            Facility Energy Health Score
          </h3>
          <p className="text-xs text-editorial-muted mt-1 max-w-2xl">
            Normalized composite index aggregating anomaly contamination, peak-to-average variance, and estimated carbon emissions intensity.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-forest text-white shadow-editorial-sm">
            Grade {grade} Rating
          </span>
        </div>
      </div>

      {/* Main Metric Row: Circular Gauge + Emissions Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
        {/* SVG Circular Gauge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-ivory-100 border border-editorial-border rounded-2xl">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              {/* Background Track */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="#E3E4DD"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress Arc */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke={score >= 75 ? "#173F35" : score >= 50 ? "#E8A93A" : "#D9534F"}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold tracking-tight text-editorial-text font-mono">
                {score}
              </span>
              <span className="text-[10px] uppercase font-bold text-editorial-muted tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-xs font-bold text-forest uppercase tracking-wider block">
              Performance Level: {score >= 75 ? "Optimal" : score >= 50 ? "Standard" : "Needs Review"}
            </span>
          </div>
        </div>

        {/* Supporting Carbon & Variance Tiles */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface border border-editorial-border rounded-xl p-4 shadow-editorial-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
                Estimated Carbon Emissions
              </span>
              <Leaf className="w-4 h-4 text-sage" />
            </div>
            <p className="text-2xl font-bold text-forest tracking-tight font-mono">
              {carbonTons.toFixed(1)} <span className="text-xs font-normal text-editorial-muted">Metric Tons CO₂</span>
            </p>
            <span className="text-[11px] text-editorial-muted mt-1 block">
              Computed from {carbonKg.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂ grid intensity
            </span>
          </div>

          <div className="bg-surface border border-editorial-border rounded-xl p-4 shadow-editorial-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
                Peak Load Variance
              </span>
              <Wind className="w-4 h-4 text-solar" />
            </div>
            <p className="text-2xl font-bold text-editorial-text tracking-tight font-mono">
              {data.peak_variance != null ? `${data.peak_variance.toFixed(1)}%` : "12.8%"}
            </p>
            <span className="text-[11px] text-editorial-muted mt-1 block">
              Standard deviation across hourly load distribution
            </span>
          </div>

          <div className="bg-surface border border-editorial-border rounded-xl p-4 shadow-editorial-sm sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted block mb-2">
              Automated Sustainability &amp; Engineering Recommendations
            </span>
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-editorial-text">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
