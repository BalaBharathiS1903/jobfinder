import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [general, setGeneral] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setGeneral("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneral("");
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate("/resumes");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        // Field-level errors from DRF
        const fieldErrors = {};
        let hasField = false;
        ["username", "email", "password"].forEach((f) => {
          if (data[f]) {
            fieldErrors[f] = Array.isArray(data[f]) ? data[f][0] : data[f];
            hasField = true;
          }
        });
        if (hasField) {
          setErrors(fieldErrors);
        } else {
          // non_field_errors or detail
          const msg = data.non_field_errors?.[0] || data.detail || data.error ||
            Object.values(data).flat().join(" ") || "Registration failed.";
          setGeneral(msg);
        }
      } else {
        setGeneral("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-sub">Join VDart Academy — it's free</p>

        {general && <div className="auth-error">{general}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Username</label>
            <input
              placeholder="e.g. johndoe"
              required
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              className={errors.username ? "input-error" : ""}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
