import { formatINR } from "../lib/currency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { DollarSign, TrendingDown, Clock, Zap } from "lucide-react";

export interface OptimizationData {
  original_cost: number;
  optimized_cost: number;
  estimated_savings: number;
  peak_reduction_percent: number;
  recommended_shift_hours?: number[];
  savings_percentage?: number;
  hourly_original?: Record<string, number>;
  hourly_optimized?: Record<string, number>;
}

interface OptimizationPanelProps {
  data?: OptimizationData | null;
}

export default function OptimizationPanel({ data }: OptimizationPanelProps) {
  if (!data) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
        <p className="text-slate-400 text-sm">No load optimization analysis available.</p>
      </div>
    );
  }

  const savingsPct =
    data.savings_percentage ??
    (data.original_cost > 0
      ? (data.estimated_savings / data.original_cost) * 100
      : 0);

  // If hourly curves exist, show hourly breakdown; otherwise show high-level comparison
  const hasHourly = data.hourly_original && Object.keys(data.hourly_original).length > 0;

  const comparisonData = hasHourly
    ? Object.keys(data.hourly_original!)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((hour) => ({
          hour: `${hour}:00`,
          original: data.hourly_original![hour],
          optimized: data.hourly_optimized?.[hour] ?? 0,
        }))
    : [
        { name: "Current Spend", value: data.original_cost, color: "#f43f5e" },
        { name: "AI Optimized Spend", value: data.optimized_cost, color: "#10b981" },
      ];

  const shiftHours = data.recommended_shift_hours || [1, 2, 3, 4, 23];

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 relative overflow-hidden">
      {/* Ambient background accent */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-glow-emerald">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              Tariff &amp; Load Shifting Optimization
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Cost Minimization
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates dynamic peak-to-off-peak tariff arbitrage and peak power shaving
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Save up to {savingsPct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
          <p className="text-xs text-slate-400 mb-1 font-medium">Standard Tariff Cost</p>
          <p className="text-2xl font-black text-rose-400 tracking-tight">
            {formatINR(data.original_cost)}
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
          <p className="text-xs text-slate-400 mb-1 font-medium">Optimized Cost</p>
          <p className="text-2xl font-black text-emerald-400 tracking-tight">
            {formatINR(data.optimized_cost)}
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
          <p className="text-xs text-slate-400 mb-1 font-medium">Projected Cost Savings</p>
          <p className="text-2xl font-black text-cyan-300 tracking-tight">
            {formatINR(data.estimated_savings)}
            <span className="text-xs font-normal text-emerald-400 ml-1.5">
              (-{savingsPct.toFixed(1)}%)
            </span>
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
          <p className="text-xs text-slate-400 mb-1 font-medium">Peak Demand Shaving</p>
          <p className="text-2xl font-black text-amber-300 tracking-tight">
            {data.peak_reduction_percent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Comparison Visualizer */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
          <span className="font-medium">
            {hasHourly ? "Hourly Load Shifting Profile (Original vs AI Adjusted)" : "Spend Comparison Breakdown"}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Current
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Optimized
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {hasHourly ? (
              <BarChart data={comparisonData as any[]} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: number) => [`${val.toFixed(2)} kWh`, "Load"]}
                />
                <Legend verticalAlign="top" height={30} />
                <Bar dataKey="original" name="Original Demand" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="optimized" name="Optimized Demand" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: number) => [formatINR(val), "Cost"]}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={56}>
                  {comparisonData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations & Off-Peak Shift Windows */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            Optimal Off-Peak Load Shifting Windows
          </h4>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Shifting flexible industrial or HVAC machinery to these target off-peak hours captures maximum tariff discounts:
        </p>

        <div className="flex flex-wrap gap-2">
          {shiftHours.map((hour) => (
            <span
              key={hour}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              {String(hour).padStart(2, "0")}:00 - {String((hour + 1) % 24).padStart(2, "0")}:00
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
