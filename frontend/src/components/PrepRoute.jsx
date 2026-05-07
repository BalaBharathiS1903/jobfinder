import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrepRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.has_prep_access && !user.is_superuser) {
    return (
      <div style={{ maxWidth: 480, margin: "6rem auto", padding: "2rem", textAlign: "center", background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "1rem" }}>
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111", margin: "0 0 0.5rem" }}>Access Restricted</h2>
        <p style={{ color: "#6B7280", fontSize: "0.9rem", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
          You don't have access to the Prep Hub yet. Please contact your administrator to request access.
        </p>
        <a href="/home" style={{ display: "inline-block", padding: "0.6rem 1.5rem", background: "#2563EB", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
          Back to Home
        </a>
      </div>
    );
  }
  return children;
}
