import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, Zap, ArrowUp, ArrowDown, Activity } from "lucide-react";

export interface ForecastPoint {
  timestamp: string;
  predicted_kwh: number;
}

export interface HistoricalPoint {
  timestamp: string;
  energy_kwh: number;
}

export interface ForecastData {
  forecast: ForecastPoint[];
  historical: HistoricalPoint[];
  summary: {
    forecast_hours: number;
    avg_predicted_kwh: number;
    max_predicted_kwh: number;
    min_predicted_kwh: number;
  };
}

interface ForecastChartProps {
  data?: ForecastData | null;
  formatTime?: (ts: string) => string;
}

export default function ForecastChart({ data, formatTime }: ForecastChartProps) {
  const defaultFormatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:00`;
    } catch {
      return ts;
    }
  };

  const formatter = formatTime || defaultFormatTime;

  if (!data) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <Activity className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-50" />
        <p className="text-slate-400 text-sm">No forecast data available for this report.</p>
      </div>
    );
  }

  const chartData = [
    ...data.historical.map((h) => ({
      time: formatter(h.timestamp),
      historical: h.energy_kwh,
      forecast: null as number | null,
    })),
    ...data.forecast.map((f) => ({
      time: formatter(f.timestamp),
      historical: null as number | null,
      forecast: f.predicted_kwh,
    })),
  ];

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl flex items-center justify-center shadow-glow-cyan">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              Deep Learning Energy Forecast
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                PyTorch LSTM
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Distinguishing verified historical telemetry from recursive neural multi-step predictions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-surface-elevated/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
            <span className="font-medium">Historical Telemetry</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-surface-elevated/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm" />
            <span className="font-medium">24h AI Prediction</span>
          </div>
        </div>
      </div>

      {/* Metric Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Avg Forecast Load</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {data.summary.avg_predicted_kwh.toFixed(1)}
            <span className="text-xs font-normal text-slate-400 ml-1.5">kWh</span>
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Projected Peak</span>
            <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300 tracking-tight">
            {data.summary.max_predicted_kwh.toFixed(1)}
            <span className="text-xs font-normal text-slate-400 ml-1.5">kWh</span>
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Projected Baseline</span>
            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-300 tracking-tight">
            {data.summary.min_predicted_kwh.toFixed(1)}
            <span className="text-xs font-normal text-slate-400 ml-1.5">kWh</span>
          </p>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(8px)",
                color: "#f8fafc",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
              formatter={(val: number, name: string) => [
                `${Number(val).toFixed(2)} kWh`,
                name === "historical" ? "Historical Actual" : "LSTM Predicted",
              ]}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '12px' }} />

            <Area
              type="monotone"
              dataKey="historical"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fill="url(#historicalGrad)"
              name="Historical Data"
              connectNulls={false}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#f59e0b"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 3, fill: "#f59e0b", strokeWidth: 1, stroke: "#ffffff" }}
              name="Predicted Forecast"
              connectNulls={false}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
