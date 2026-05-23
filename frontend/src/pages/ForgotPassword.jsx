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
      const res = await api.post("/auth/forgot-password/", { email: trimmed });
      const details = [res.data?.detail || "If that email exists, a reset link has been sent."];
      if (res.data?.reset_token) {
        details.push(`Debug token: ${res.data.reset_token}`);
      }
      setMessage(details.join(" "));
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/vdart.png" alt="VDart Logo" className="auth-logo" />
        <h2>Forgot Password</h2>
        <p className="auth-sub">Enter your email and we’ll send a password reset link or token.</p>

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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p>
            <Link to="/reset-password">Have a token already? Reset password</Link>
          </p>
        )}
        <p><Link to="/login">Back to Sign In</Link></p>
      </div>
    </div>
  );
}
