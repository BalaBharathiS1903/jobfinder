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

  const handleLogout = () => { setOpen(false); logout(); navigate("/login"); };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  const NavIcon = {
    home:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    shield:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    file:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    search:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    bookmark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
    chart:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    edit:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    user:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    book:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    activity: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    caret:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11"><polyline points="6 9 12 15 18 9"/></svg>,
  };

  return (
    <nav className="navbar">
      <Link to={user ? "/home" : "/login"} className="navbar-brand">
        <Logo size={36} />
      </Link>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/home" className="nav-icon-link">{NavIcon.home} Home</Link>
            {user?.is_superuser && <Link to="/admin-dashboard" className="nav-icon-link">{NavIcon.shield} Admin</Link>}
            {!user?.is_superuser && <Link to="/resumes" className="nav-icon-link">{NavIcon.file} Resumes</Link>}
            {!user?.is_superuser && <Link to="/search" className="nav-icon-link">{NavIcon.search} Search Jobs</Link>}
            {!user?.is_superuser && <Link to="/saved" className="nav-icon-link">{NavIcon.bookmark} Saved Jobs</Link>}
            {!user?.is_superuser && <Link to="/resume-analyzer" className="nav-icon-link">{NavIcon.chart} Resume Analyzer</Link>}
            {!user?.is_superuser && <Link to="/resume-builder" className="nav-icon-link">{NavIcon.edit} Resume Builder</Link>}
            {!user?.is_superuser && <Link to="/my-profile" className="nav-icon-link">{NavIcon.user} My Profile</Link>}
            {!user?.is_superuser && <Link to="/prep" className="nav-icon-link">{NavIcon.book} Prep Hub</Link>}

            {/* User avatar dropdown */}
            <div className="nav-user-wrap" ref={dropRef}>
              <button className="nav-avatar" onClick={() => setOpen((o) => !o)}>
                {initials}
                <span className="nav-username">{user.username}</span>
                <span className="nav-caret">{NavIcon.caret}</span>
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
                        <span className="drop-filename"><span className="drop-icon">{NavIcon.file}</span> {latestResume.filename}</span>
                        {latestResume.name && <span className="drop-rname">Name: {latestResume.name}</span>}
                        {latestResume.email && <span className="drop-rname">Email: {latestResume.email}</span>}
                        {latestResume.phone && <span className="drop-rname">Phone: {latestResume.phone}</span>}
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
                        {NavIcon.user} View Candidate Profile
                      </Link>
                    )}
                    <Link to="/resumes" className="drop-link" onClick={() => setOpen(false)}>{NavIcon.file} My Resumes</Link>
                    <Link to="/search" className="drop-link" onClick={() => setOpen(false)}>{NavIcon.search} Search Jobs</Link>
                    <Link to="/saved" className="drop-link" onClick={() => setOpen(false)}>{NavIcon.bookmark} Saved Jobs</Link>
                  </div>

                  <div className="drop-divider" />
                  <button className="drop-logout" onClick={handleLogout}>{NavIcon.logout} Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="btn-nav">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
