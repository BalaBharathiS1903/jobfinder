import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import "./Auth.css";

const DEFAULT_PASSWORD = "vdart@#12345";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDefaultMode = searchParams.get("mode") === "default";
  const [form, setForm] = useState({
    token: searchParams.get("token") || "",
    email: searchParams.get("email") || "",
    defaultPassword: DEFAULT_PASSWORD,
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
    const trimmedToken = form.token.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    if (isDefaultMode) {
      if (!trimmedEmail) errs.email = "Email is required.";
      if (!form.defaultPassword) errs.defaultPassword = "Default password is required.";
    } else if (!trimmedToken) {
      errs.token = "Reset token is required.";
    }
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setGeneral("");
    try {
      if (isDefaultMode) {
        await api.post("/auth/default-password-reset/", {
          email: trimmedEmail,
          default_password: form.defaultPassword,
          new_password: form.password,
        });
      } else {
        await api.post("/auth/reset-password/", {
          token: trimmedToken,
          password: form.password,
        });
      }
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const apiError = err.response?.data?.error;
      setGeneral(Array.isArray(apiError) ? apiError.join(" ") : apiError || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/vdart.png" alt="VDart Logo" className="auth-logo" />
        <div className="auth-success">
          <p className="success-title">Password Reset</p>
          <p className="success-desc">Your password has been updated. Redirecting to login...</p>
          <Link to="/login" className="btn-primary">Go to Sign In</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/vdart.png" alt="VDart Logo" className="auth-logo" />
        <h2>Reset Password</h2>
        <p className="auth-sub">
          {isDefaultMode
            ? "Use the default password and choose a new password."
            : "Paste your reset token and choose a new password."}
        </p>
        {isDefaultMode && (
          <div className="auth-default-password">
            <span>Default password</span>
            <code>{DEFAULT_PASSWORD}</code>
          </div>
        )}

        {general && <div className="auth-error">{general}</div>}

        <form onSubmit={handleSubmit}>
          {isDefaultMode ? (
            <>
              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="auth-field">
                <label>Default Password</label>
                <input
                  type="text"
                  value={form.defaultPassword}
                  onChange={(e) => set("defaultPassword", e.target.value)}
                  className={errors.defaultPassword ? "input-error" : ""}
                />
                {errors.defaultPassword && <span className="field-error">{errors.defaultPassword}</span>}
              </div>
            </>
          ) : (
            <div className="auth-field">
              <label>Reset Token</label>
              <input
                type="text"
                placeholder="Token from your reset link"
                value={form.token}
                onChange={(e) => set("token", e.target.value)}
                className={errors.token ? "input-error" : ""}
                autoComplete="one-time-code"
              />
              {errors.token && <span className="field-error">{errors.token}</span>}
            </div>
          )}

          <div className="auth-field">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className={errors.password ? "input-error" : ""}
              autoComplete="new-password"
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
              autoComplete="new-password"
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p><Link to="/login">Back to Sign In</Link></p>
      </div>
    </div>
  );
}
