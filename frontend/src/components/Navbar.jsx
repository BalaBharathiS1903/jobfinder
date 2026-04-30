import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Logo from "./Logo";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropRef = useRef();

  const { data: resumes = [] } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get("/resume/").then((r) => r.data),
    enabled: !!user,
  });

  const latestResume = resumes[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { setOpen(false); logout(); navigate("/"); };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <Logo size={36} />
      </Link>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/resumes">Resumes</Link>
            <Link to="/search">Search Jobs</Link>
            <Link to="/saved">Saved Jobs</Link>
            <Link to="/resume-analyzer">Resume Analyzer</Link>
            <Link to="/my-profile">My Profile</Link>

            {/* User avatar dropdown */}
            <div className="nav-user-wrap" ref={dropRef}>
              <button className="nav-avatar" onClick={() => setOpen((o) => !o)}>
                {initials}
                <span className="nav-username">{user.username}</span>
                <span className="nav-caret">{open ? "▲" : "▼"}</span>
              </button>

              {open && (
                <div className="user-dropdown">
                  {/* Profile header */}
                  <div className="drop-header">
                    <div className="drop-avatar">{initials}</div>
                    <div>
                      <p className="drop-name">{user.username}</p>
                      <p className="drop-email">{user.email}</p>
                    </div>
                  </div>

                  <div className="drop-divider" />

                  {/* Resume info */}
                  {latestResume && (
                    <>
                      <div className="drop-resume-info">
                        <span className="drop-label">Latest Resume</span>
                        <span className="drop-filename">📄 {latestResume.filename}</span>
                        {latestResume.name && <span className="drop-rname">👤 {latestResume.name}</span>}
                        {latestResume.email && <span className="drop-rname">✉ {latestResume.email}</span>}
                        {latestResume.phone && <span className="drop-rname">📞 {latestResume.phone}</span>}
                        {latestResume.skills?.length > 0 && (
                          <div className="drop-skills">
                            {latestResume.skills.slice(0, 5).map((s) => (
                              <span key={s} className="drop-skill-tag">{s}</span>
                            ))}
                            {latestResume.skills.length > 5 && (
                              <span className="drop-skill-more">+{latestResume.skills.length - 5}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="drop-divider" />
                    </>
                  )}

                  {/* Quick links */}
                  <div className="drop-links">
                    {latestResume && (
                      <Link to={`/resumes/${latestResume.id}/profile`} className="drop-link" onClick={() => setOpen(false)}>
                        🧑‍💼 View Candidate Profile
                      </Link>
                    )}
                    <Link to="/resumes" className="drop-link" onClick={() => setOpen(false)}>📄 My Resumes</Link>
                    <Link to="/search" className="drop-link" onClick={() => setOpen(false)}>🔍 Search Jobs</Link>
                    <Link to="/saved" className="drop-link" onClick={() => setOpen(false)}>🔖 Saved Jobs</Link>
                  </div>

                  <div className="drop-divider" />
                  <button className="drop-logout" onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/login" className="btn-nav">Sign In</Link>
            <Link to="/register" className="btn-nav btn-nav-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
