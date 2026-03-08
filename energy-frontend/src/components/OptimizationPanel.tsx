import { useState, useEffect } from "react";
import { analyticsAPI } from "../lib/api";
import { formatINR } from "../lib/currency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, TrendingDown, Clock, Lightbulb } from "lucide-react";

interface OptimizationData {
  original_cost: number;
  optimized_cost: number;
  estimated_savings: number;
  savings_percentage: number;
  peak_reduction_percent: number;
  total_consumption_kwh: number;
  peak_consumption_kwh: number;
  off_peak_consumption_kwh: number;
  recommended_shift_hours: number[];
  peak_tariff: number;
  off_peak_tariff: number;
  hourly_original: Record<string, number>;
  hourly_optimized: Record<string, number>;
}

export default function OptimizationPanel() {
  const [data, setData] = useState<OptimizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOptimization();
  }, []);

  const fetchOptimization = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getOptimization();
      setData(res.data);
      setError("");
    } catch (err: any) {
      setError("Failed to load optimization data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare bar chart data
  const chartData = data
    ? Object.keys(data.hourly_original)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((hour) => ({
          hour: `${hour}:00`,
          original: data.hourly_original[hour],
          optimized: data.hourly_optimized[hour],
        }))
    : [];

  const formatCurrency = (value: number) => {
    return formatINR(value);
  };

  const formatHour = (h: number) => {
    if (h === 0) return "12 AM";
    if (h < 12) return `${h} AM`;
    if (h === 12) return "12 PM";
    return `${h - 12} PM`;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-48" />
          <div className="h-64 bg-slate-700/50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Cost Optimization</h3>
          <p className="text-sm text-slate-400">Load Shifting Strategy</p>
        </div>
      </div>

      {error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : data ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700/30 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Original Cost</p>
              <p className="text-xl font-bold text-white">{formatCurrency(data.original_cost)}</p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Optimized Cost</p>
              <p className="text-xl font-bold text-green-400">{formatCurrency(data.optimized_cost)}</p>
            </div>
            <div className="bg-green-900/30 border border-green-700/30 rounded-xl p-4">
              <p className="text-xs text-green-300 mb-1">Estimated Savings</p>
              <p className="text-xl font-bold text-green-400">{formatCurrency(data.estimated_savings)}</p>
              <p className="text-xs text-green-300/70">{data.savings_percentage}% reduction</p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Peak Reduction</p>
              <p className="text-xl font-bold text-amber-400">{data.peak_reduction_percent}%</p>
            </div>
          </div>

          {/* Hourly Comparison Chart */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Hourly Load Comparison</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)} kWh`]}
                  />
                  <Legend />
                  <Bar dataKey="original" fill="#ef4444" name="Original" radius={[2, 2, 0, 0]} opacity={0.7} />
                  <Bar dataKey="optimized" fill="#22c55e" name="Optimized" radius={[2, 2, 0, 0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-medium text-blue-300">Recommendations</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>
                  Shift {data.peak_reduction_percent}% of peak load to off-peak hours:{" "}
                  <span className="text-blue-300 font-medium">
                    {data.recommended_shift_hours.map(formatHour).join(", ")}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  Peak tariff: ${data.peak_tariff}/kWh | Off-peak tariff: ${data.off_peak_tariff}/kWh
                </span>
              </li>
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
