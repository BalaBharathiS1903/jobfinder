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
      const { data } = await api.post("/auth/forgot-password/", { email: trimmed });
      if (data?.reset_token) {
        navigate(`/reset-password?token=${encodeURIComponent(data.reset_token)}`);
        return;
      }
      setMessage(data?.detail || "If that email exists, a password reset link has been sent.");
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
        <p className="auth-sub">Enter your email and we will send a reset link.</p>

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
            {loading ? "Sending reset link..." : "Send Reset Link"}
          </button>
        </form>

        <p><Link to="/login">Back to Sign In</Link></p>
      </div>
    </div>
  );
}
