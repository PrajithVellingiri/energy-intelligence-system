import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { authAPI } from "../lib/api";
import { Zap, Mail, Lock, User, ArrowRight, Home, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.signup({ email, username, password });
      login(res.data.access_token, {
        username: res.data.username,
        email: res.data.email,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try a different email/username.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4 sm:p-6 relative">
      {/* Return to Home link */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold text-editorial-muted hover:text-forest transition-colors px-3 py-2 rounded-xl bg-white border border-editorial-border shadow-editorial-sm"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Return Home</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Editorial Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-forest rounded-2xl mb-3 shadow-editorial-sm text-white">
            <Zap className="w-6 h-6 text-solar" />
          </div>
          <h1 className="text-2xl font-bold text-editorial-text tracking-tight">
            ENERGY INTELLIGENCE
          </h1>
          <p className="text-xs text-editorial-muted mt-1">
            Create Facility Operator Account
          </p>
        </div>

        {/* Form Card */}
        <div className="editorial-card-elevated p-7 sm:p-8">
          <div className="mb-6 pb-4 border-b border-editorial-divider">
            <h2 className="text-lg font-bold text-editorial-text">Operator Registration</h2>
            <p className="text-xs text-editorial-muted mt-0.5">Deploy analytics and telemetry ingestion vault</p>
          </div>

          {error && (
            <div className="bg-[#FDF2F2] border border-[#F5C6CB] text-[#9C2B2B] px-3.5 py-2.5 rounded-xl mb-5 text-xs flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#D9534F] mt-1 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1.5">
                Username / Operator ID
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-ivory-50 border border-editorial-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-editorial-text placeholder-editorial-muted/70 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-all"
                  placeholder="e.g. grid_operator"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-ivory-50 border border-editorial-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-editorial-text placeholder-editorial-muted/70 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-all"
                  placeholder="name@organization.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted">
                  Account Password
                </label>
                <span className="text-[11px] text-editorial-muted">Min 6 chars</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-ivory-50 border border-editorial-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-editorial-text placeholder-editorial-muted/70 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-editorial-muted hover:text-editorial-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-forest hover:bg-forest-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-editorial transition-all flex items-center justify-center gap-2 text-sm mt-6"
            >
              <span>{loading ? "Registering Operator..." : "Create Account &amp; Access Vault"}</span>
              <ArrowRight className="w-4 h-4 text-solar" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-editorial-muted">
            Already have an active account?{" "}
            <Link to="/login" className="text-forest font-bold hover:underline">
              Sign in here
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-editorial-muted mt-6">
          <ShieldCheck className="w-3.5 h-3.5 text-forest" />
          <span>Secure Operator Registration</span>
        </div>
      </div>
    </div>
  );
}
