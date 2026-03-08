import { useState, useEffect } from "react";
import { analyticsAPI } from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Zap, ArrowUp, ArrowDown } from "lucide-react";

interface ForecastData {
  forecast: Array<{ timestamp: string; predicted_kwh: number }>;
  historical: Array<{ timestamp: string; energy_kwh: number }>;
  summary: {
    forecast_hours: number;
    avg_predicted_kwh: number;
    max_predicted_kwh: number;
    min_predicted_kwh: number;
  };
}

export default function ForecastChart() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [hours, setHours] = useState(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchForecast();
  }, [hours]);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getForecast(hours);
      setData(res.data);
      setError("");
    } catch (err: any) {
      setError("Failed to load forecast data");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
  };

  // Combine historical and forecast for chart
  const chartData = data
    ? [
        ...data.historical.map((h) => ({
          time: formatTime(h.timestamp),
          actual: h.energy_kwh,
          forecast: null as number | null,
        })),
        ...data.forecast.map((f) => ({
          time: formatTime(f.timestamp),
          actual: null as number | null,
          forecast: f.predicted_kwh,
        })),
      ]
    : [];

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
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Energy Forecast</h3>
            <p className="text-sm text-slate-400">LSTM Neural Network Prediction</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[24, 48, 72].map((h) => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                hours === h
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : (
        <>
          {/* Summary Cards */}
          {data && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-700/30 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Zap className="w-3 h-3" />
                  Average
                </div>
                <p className="text-white font-semibold text-lg">
                  {data.summary.avg_predicted_kwh} <span className="text-xs text-slate-400">kWh</span>
                </p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <ArrowUp className="w-3 h-3 text-red-400" />
                  Peak
                </div>
                <p className="text-white font-semibold text-lg">
                  {data.summary.max_predicted_kwh} <span className="text-xs text-slate-400">kWh</span>
                </p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <ArrowDown className="w-3 h-3 text-green-400" />
                  Low
                </div>
                <p className="text-white font-semibold text-lg">
                  {data.summary.min_predicted_kwh} <span className="text-xs text-slate-400">kWh</span>
                </p>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Historical"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Forecast"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
