import { Brain, Target, AlertCircle, TrendingUp, Activity } from "lucide-react";

export default function AIMetricsPanel() {
  const metrics = [
    {
      label: "Forecast Model Accuracy",
      value: "89%",
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-600/10",
    },
    {
      label: "R² Score",
      value: "0.92",
      icon: Target,
      color: "text-purple-400",
      bg: "bg-purple-600/10",
    },
    {
      label: "Anomaly Detection Accuracy",
      value: "94%",
      icon: AlertCircle,
      color: "text-red-400",
      bg: "bg-red-600/10",
    },
    {
      label: "Optimization Efficiency",
      value: "16%",
      icon: Activity,
      color: "text-green-400",
      bg: "bg-green-600/10",
    },
    {
      label: "Average Prediction Error",
      value: "4.1%",
      icon: Brain,
      color: "text-amber-400",
      bg: "bg-amber-600/10",
    },
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mt-12">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-400" />
        AI Model Performance Metrics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`${metric.bg} border border-slate-700/50 rounded-xl p-4 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${metric.color}`} />
                <p className="text-xs text-slate-400">{metric.label}</p>
              </div>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
