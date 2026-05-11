import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import "./Auth.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Email is required.");
      return;
    }
    if (!emailRegex.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password/", { email: trimmed });
      navigate(`/reset-password?email=${encodeURIComponent(trimmed)}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/vdart.png" alt="VDart Logo" className="auth-logo" />
        <h2>Forgot Password</h2>
        <p className="auth-sub">Enter your email and reset your password directly on the next page.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Preparing reset…" : "Continue to Reset Page"}
          </button>
        </form>

        <p><Link to="/login">← Back to Sign In</Link></p>
      </div>
    </div>
  );
}
