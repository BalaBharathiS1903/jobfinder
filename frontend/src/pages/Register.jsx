import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate("/resumes");
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username" required
            value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password" placeholder="Password (min 8 chars)" required minLength={8}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit" disabled={loading}>{loading ? "Creating…" : "Create Account"}</button>
        </form>
        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
