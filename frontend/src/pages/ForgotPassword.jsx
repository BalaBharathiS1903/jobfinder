import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToken("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password/", { email });
      if (data.token) {
        setToken(data.token);
      } else {
        setError(data.detail || "If that email exists, a reset token has been generated.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate reset token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-sub">Enter your email to get a password reset token</p>

        {error && <div className="auth-error">{error}</div>}

        {token ? (
          <div className="auth-success">
            <p className="success-title">Reset Token Generated</p>
            <p className="success-desc">Copy this token and use it on the reset page:</p>
            <div className="token-box">
              <code>{token}</code>
              <button
                className="btn-copy"
                onClick={() => {
                  navigator.clipboard.writeText(token);
                  alert("Token copied to clipboard!");
                }}
              >
                Copy
              </button>
            </div>
            <Link to={`/reset-password?token=${token}`} className="btn-primary">
              Reset Password →
            </Link>
          </div>
        ) : (
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
              {loading ? "Generating token…" : "Get Reset Token"}
            </button>
          </form>
        )}

        <p><Link to="/login">← Back to Sign In</Link></p>
      </div>
    </div>
  );
}
