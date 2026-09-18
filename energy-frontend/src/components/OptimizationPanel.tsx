import { formatINR } from "../lib/currency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, Clock, ArrowDownRight, Zap } from "lucide-react";

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
      <div className="editorial-card p-12 text-center">
        <Zap className="w-8 h-8 text-forest/40 mx-auto mb-3" />
        <p className="text-sm font-semibold text-editorial-text">No Load Optimization Telemetry</p>
        <p className="text-xs text-editorial-muted mt-1">Upload energy telemetry to run dynamic tariff arbitrage.</p>
      </div>
    );
  }

  const savingsPct =
    data.savings_percentage ??
    (data.original_cost > 0
      ? (data.estimated_savings / data.original_cost) * 100
      : 0);

  const hasHourly = data.hourly_original && Object.keys(data.hourly_original).length > 0;

  const comparisonData = hasHourly
    ? Object.keys(data.hourly_original!)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((hour) => ({
          hour: `${String(hour).padStart(2, "0")}:00`,
          original: data.hourly_original![hour],
          optimized: data.hourly_optimized?.[hour] ?? 0,
        }))
    : [
        { hour: "Current", original: data.original_cost, optimized: 0 },
        { hour: "Optimized", original: 0, optimized: data.optimized_cost },
      ];

  const shiftHours = data.recommended_shift_hours || [1, 2, 3, 4, 5, 23];

  return (
    <div className="editorial-card-elevated p-6 sm:p-7">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-editorial-divider">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
              Tariff Arbitrage
            </span>
            <span className="text-[11px] text-editorial-muted flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-solar" />
              Dynamic TOU Rate Optimization
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-editorial-text">
            Load Shifting &amp; Demand Reduction
          </h3>
          <p className="text-xs text-editorial-muted mt-1 max-w-2xl">
            Simulating automated dispatch scheduling: shifting elastic thermal and process loads from peak to off-peak tariff blocks.
          </p>
        </div>

        {/* Savings Badge */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="bg-solar-50 border border-solar-200 rounded-xl px-4 py-2.5 text-right">
            <span className="text-[10px] uppercase font-bold text-solar-800 tracking-wider block">
              Cost Arbitrage
            </span>
            <span className="text-lg font-bold text-solar-800 font-mono flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4 text-solar" />
              {savingsPct.toFixed(1)}% Reduction
            </span>
          </div>
        </div>
      </div>

      {/* 3 Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="bg-ivory-100 border border-editorial-border rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted block mb-1">
            Current Baseline Tariff Cost
          </span>
          <p className="text-2xl font-bold text-editorial-text tracking-tight font-mono">
            {formatINR(data.original_cost)}
          </p>
          <span className="text-[11px] text-editorial-muted mt-1 block">
            Unmanaged peak tariff exposure
          </span>
        </div>

        <div className="bg-forest-50 border border-forest-100 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 block mb-1">
            AI-Shifted Operating Cost
          </span>
          <p className="text-2xl font-bold text-forest tracking-tight font-mono">
            {formatINR(data.optimized_cost)}
          </p>
          <span className="text-[11px] text-forest-600 mt-1 block font-medium">
            With off-peak rate scheduling
          </span>
        </div>

        <div className="bg-[#FEF9EE] border border-[#F9E2AF] rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-solar-800 block mb-1">
            Projected Annualized Savings
          </span>
          <p className="text-2xl font-bold text-solar-800 tracking-tight font-mono flex items-center gap-1.5">
            <TrendingDown className="w-5 h-5 text-solar" />
            {formatINR(data.estimated_savings)}
          </p>
          <span className="text-[11px] text-solar-700 mt-1 block font-medium">
            Peak demand reduction: {data.peak_reduction_percent?.toFixed(1) ?? 30}%
          </span>
        </div>
      </div>

      {/* Hourly Load Comparison Chart */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-editorial-muted uppercase tracking-wider">
            24-Hour Load Distribution: Baseline vs Shifted
          </span>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-forest" />
              <span className="text-editorial-muted font-medium">Original Profile</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-solar" />
              <span className="text-editorial-muted font-medium">Optimized Profile</span>
            </div>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#E3E4DD" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="hour"
                stroke="#8C958F"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E3E4DD" }}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis
                stroke="#8C958F"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v} kWh`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-editorial-border rounded-xl p-3 shadow-editorial-md text-xs">
                        <p className="font-bold text-editorial-text mb-1">{label}</p>
                        {payload.map((p, i) => (
                          <div key={i} className="flex items-center justify-between gap-4 py-0.5">
                            <span className="text-editorial-muted capitalize">
                              {p.dataKey === "original" ? "Original" : "Optimized"}:
                            </span>
                            <span className="font-bold font-mono text-editorial-text">
                              {Number(p.value).toFixed(2)} kWh
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="original" fill="#173F35" radius={[3, 3, 0, 0]} maxBarSize={16} />
              <Bar dataKey="optimized" fill="#E8A93A" radius={[3, 3, 0, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommended Off-Peak Windows */}
      <div className="mt-6 pt-5 border-t border-editorial-divider">
        <span className="text-xs font-bold text-editorial-text uppercase tracking-wider block mb-2.5">
          Recommended Load-Shifting Dispatch Windows
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {shiftHours.map((h) => (
            <span
              key={h}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-forest-50 text-forest border border-forest-100"
            >
              <Clock className="w-3 h-3 text-solar" />
              {String(h).padStart(2, "0")}:00 &ndash; {String((h + 1) % 24).padStart(2, "0")}:00
            </span>
          ))}
          <span className="text-xs text-editorial-muted ml-2">
            (Lowest TOU grid tariff tier with renewable grid surplus)
          </span>
        </div>
      </div>
    </div>
  );
}
