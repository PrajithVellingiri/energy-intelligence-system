import { Link } from "react-router-dom";
import { Zap, TrendingUp, AlertTriangle, BarChart3, Brain, Shield, Activity, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: TrendingUp,
      title: "Energy Forecasting",
      description: "LSTM-powered predictions for accurate energy demand forecasting up to 168 hours ahead.",
      color: "blue",
    },
    {
      icon: AlertTriangle,
      title: "Anomaly Detection",
      description: "Real-time identification of unusual consumption patterns using Isolation Forest algorithms.",
      color: "red",
    },
    {
      icon: BarChart3,
      title: "Load Optimization",
      description: "Smart load shifting recommendations to reduce peak demand and optimize energy costs.",
      color: "green",
    },
    {
      icon: Brain,
      title: "AI-Driven Insights",
      description: "Intelligent analytics and actionable recommendations powered by advanced machine learning.",
      color: "purple",
    },
  ];

  const highlights = [
    "AI-powered predictions with 89% accuracy",
    "Real-time analytics and monitoring",
    "Smart optimization recommendations",
    "Energy efficiency improvements up to 16%",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Energy Intelligence</h1>
                <p className="text-xs text-slate-400 -mt-0.5">AI-Powered Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-2 mb-6">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Advanced AI Technology</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            AI-Powered Energy
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Intelligence Platform
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            Forecast demand, detect anomalies, and optimize energy consumption
            <br />
            with intelligent analytics powered by cutting-edge machine learning.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/20 flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all border border-slate-700"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-slate-400">
            Comprehensive energy analytics powered by advanced AI models
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: "bg-blue-600/10 border-blue-600/20 text-blue-400",
              red: "bg-red-600/10 border-red-600/20 text-red-400",
              green: "bg-green-600/10 border-green-600/20 text-green-400",
              purple: "bg-purple-600/10 border-purple-600/20 text-purple-400",
            }[feature.color];

            return (
              <div
                key={feature.title}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:shadow-xl hover:shadow-slate-900/50 transition-all hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 ${colorClasses} border rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quality Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 border border-blue-700/30 rounded-2xl p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Our Platform?</h2>
            <p className="text-slate-300">
              Industry-leading accuracy and performance metrics
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-xl p-4"
              >
                <div className="w-8 h-8 bg-green-600/20 border border-green-600/30 rounded-lg flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-slate-200">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Energy Consumption?
          </h2>
          <p className="text-slate-400 mb-8">
            Join thousands of users leveraging AI for smarter energy management
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/20"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-slate-500">
            AI Energy Intelligence Platform | Powered by LSTM, Isolation Forest & Advanced Analytics
          </p>
        </div>
      </footer>
    </div>
  );
}
