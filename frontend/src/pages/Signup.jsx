import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await API.post("/auth/signup", { email, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(", "));
      } else {
        console.error("Signup error:", err);
        setError(`Signup Error: ${err.message || 'Unknown network error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="p-8 shadow-2xl rounded-3xl w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-black mb-6 text-center text-blue-600 dark:text-blue-500 tracking-tight">Sign Up</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-emerald-900/10 border border-green-200 dark:border-emerald-800 rounded-xl text-green-600 dark:text-emerald-400 text-sm font-medium">
            ✅ Account created! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 mt-2"
          >
            {loading ? "Creating account..." : success ? "Account Created!" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-500 dark:text-slate-500 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 dark:text-blue-400 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
