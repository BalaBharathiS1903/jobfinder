import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const me = await login(form.email, form.password);
      navigate(me?.is_superuser ? "/admin-dashboard" : "/home");
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign In</h2>
        <p className="auth-sub">Welcome back to VDart Academy</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>

          <div className="auth-field">
            <div className="auth-field-row">
              <label>Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
            <input
              type="password"
              placeholder="Your password"
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

      </div>
    </div>
  );
}
