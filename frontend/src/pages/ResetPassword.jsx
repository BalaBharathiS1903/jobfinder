import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import "./Auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    token: searchParams.get("token") || "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [general, setGeneral] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setGeneral("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.token.trim()) errs.token = "Token is required.";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setGeneral("");
    try {
      await api.post("/auth/reset-password/", {
        token: form.token.trim(),
        password: form.password,
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setGeneral(err.response?.data?.error || "Reset failed. Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-success">
          <p className="success-title">Password Reset!</p>
          <p className="success-desc">Your password has been updated. Redirecting to login…</p>
          <Link to="/login" className="btn-primary">Go to Sign In</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-sub">Enter your reset token and choose a new password</p>

        {general && <div className="auth-error">{general}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Reset Token</label>
            <input
              placeholder="Paste your reset token"
              value={form.token}
              onChange={(e) => set("token", e.target.value)}
              className={errors.token ? "input-error" : ""}
            />
            {errors.token && <span className="field-error">{errors.token}</span>}
          </div>

          <div className="auth-field">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="auth-field">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat new password"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              className={errors.confirm ? "input-error" : ""}
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>

        <p><Link to="/login">← Back to Sign In</Link></p>
      </div>
    </div>
  );
}
