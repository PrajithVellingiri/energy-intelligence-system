import { useState, useEffect } from "react";
import { analyticsAPI } from "../lib/api";
import { Leaf, AlertCircle, BarChart3, Wind } from "lucide-react";

interface EnergyScoreData {
  energy_health_score: number;
  grade: string;
  anomaly_rate: number;
  peak_variance: number;
  carbon_intensity: number;
  carbon_emissions_kg: number;
  carbon_emissions_tons: number;
  total_consumption_kwh: number;
  avg_hourly_kwh: number;
  insight_summary: string[];
  metrics: {
    anomaly_weight: number;
    peak_variance_weight: number;
    carbon_weight: number;
  };
}

export default function EnergyScoreCard() {
  const [data, setData] = useState<EnergyScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchScore();
  }, []);

  const fetchScore = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getEnergyScore();
      setData(res.data);
      setError("");
    } catch (err: any) {
      setError("Failed to load energy score");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return { bg: "bg-green-500", text: "text-green-400", ring: "ring-green-500/30" };
    if (grade === "B") return { bg: "bg-blue-500", text: "text-blue-400", ring: "ring-blue-500/30" };
    if (grade === "C") return { bg: "bg-yellow-500", text: "text-yellow-400", ring: "ring-yellow-500/30" };
    if (grade === "D") return { bg: "bg-orange-500", text: "text-orange-400", ring: "ring-orange-500/30" };
    return { bg: "bg-red-500", text: "text-red-400", ring: "ring-red-500/30" };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#eab308";
    return "#ef4444";
  };

  // SVG circular progress
  const CircularProgress = ({ score }: { score: number }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = getScoreColor(score);

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width="160" height="160" className="-rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#334155"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-48" />
          <div className="h-40 bg-slate-700/50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center">
          <Leaf className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Energy Health Score</h3>
          <p className="text-sm text-slate-400">Overall Sustainability Rating</p>
        </div>
      </div>

      {error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : data ? (
        <>
          {/* Score Display */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <CircularProgress score={data.energy_health_score} />
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl text-2xl font-bold ring-4 ${
                  getGradeColor(data.grade).ring
                }`}
                style={{ color: getScoreColor(data.energy_health_score) }}
              >
                {data.grade}
              </div>
              <p className="text-xs text-slate-400 mt-2">Grade</p>
            </div>
          </div>

          {/* Metric Breakdown */}
          <div className="space-y-3 mb-6">
            <MetricBar
              label="Anomaly Rate"
              value={data.anomaly_rate}
              maxValue={100}
              color="#ef4444"
              icon={<AlertCircle className="w-3.5 h-3.5" />}
              suffix="%"
            />
            <MetricBar
              label="Peak Variance"
              value={data.peak_variance}
              maxValue={100}
              color="#f59e0b"
              icon={<BarChart3 className="w-3.5 h-3.5" />}
              suffix="%"
            />
            <MetricBar
              label="Carbon Intensity"
              value={data.carbon_intensity}
              maxValue={100}
              color="#8b5cf6"
              icon={<Wind className="w-3.5 h-3.5" />}
              suffix="%"
            />
          </div>

          {/* Carbon & Consumption Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-700/30 rounded-xl p-3">
              <p className="text-xs text-slate-400">CO2 Emissions</p>
              <p className="text-lg font-bold text-white">{data.carbon_emissions_tons} <span className="text-xs text-slate-400">tons</span></p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-3">
              <p className="text-xs text-slate-400">Avg Hourly</p>
              <p className="text-lg font-bold text-white">{data.avg_hourly_kwh} <span className="text-xs text-slate-400">kWh</span></p>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">AI Insights</h4>
            {data.insight_summary.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function MetricBar({
  label,
  value,
  maxValue,
  color,
  icon,
  suffix = "",
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  icon: React.ReactNode;
  suffix?: string;
}) {
  const pct = Math.min((value / maxValue) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span style={{ color }}>{icon}</span>
          {label}
        </div>
        <span className="text-xs font-medium text-white">
          {value.toFixed(1)}{suffix}
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
