import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import "./Auth.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/validate-default-reset-email/", { email: trimmed });
      navigate(`/reset-password?mode=default&email=${encodeURIComponent(trimmed)}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to validate email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/vdart.png" alt="VDart Logo" className="auth-logo" />
        <h2>Forgot Password</h2>
        <p className="auth-sub">Enter your email first. After validation, you can update your password.</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-info">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setMessage("");
              }}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Validating..." : "Continue"}
          </button>
        </form>

        <p><Link to="/login">Back to Sign In</Link></p>
      </div>
    </div>
  );
}
