import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { fmtDate } from "../lib/date";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

export default function ProfileView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [editingLinks, setEditingLinks] = useState(false);
  const [linkForm, setLinkForm] = useState({});

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["myprofile"],
    queryFn: () => api.get("/profile/").then(r => r.data),
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["my-activity"],
    queryFn: () => api.get("/auth/my-activity/").then(r => r.data),
  });

  // Initialize link form when profile loads
  const handleEditLinks = () => {
    setLinkForm({
      website: profile?.website || "",
      linkedin: profile?.linkedin || "",
      github: profile?.github || "",
      leetcode: profile?.leetcode || "",
    });
    setEditingLinks(true);
  };

  const handleSaveLinks = async () => {
    try {
      await api.put("/profile/", linkForm);
      refetchProfile();
      setEditingLinks(false);
      alert("Links updated successfully!");
    } catch (err) {
      alert("Failed to update links: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  if (profileLoading) return <div className="gp-loading"><div className="gp-spinner" /><p>Loading your profile…</p></div>;

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const resumeUsedPct = activity ? Math.round((activity.resume_count / activity.limits.resume_upload_limit) * 100) : 0;
  const jobUsedPct = activity && activity.limits.job_search_limit > 0
    ? Math.round((activity.job_search_today / activity.limits.job_search_limit) * 100)
    : 0;

  return (
    <div className="gp-page">
      <div className="gp-layout">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="gp-sidebar">
          <div className="gp-avatar-wrap">
            <div className="gp-avatar">{initials}</div>
          </div>

          <h1 className="gp-name">{profile?.full_name || "User"}</h1>
          {profile?.headline && <p className="gp-username">@{profile.headline}</p>}

          {profile?.summary && <p className="gp-bio">{profile.summary}</p>}

          <div className="gp-sidebar-actions">
            {activeTab === "profile" && (
              <Link to="/my-profile" className="gp-btn-primary">✏️ Edit Profile</Link>
            )}
          </div>

          <div className="gp-sidebar-stats">
            <div className="gp-stat-row">
              <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M14 2H2v11.25c0 .138.112.25.25.25h11.5a.25.25 0 0 0 .25-.25V2Zm-6.5 6.5h-1v-1h1v1Zm0-2.5h-1V4.5h1V6Zm2.5 2.5h-1v-1h1v1Zm0-2.5h-1V4.5h1V6Zm-5 2.5h-1v-1h1v1Zm0-2.5h-1V4.5h1V6Z"/></svg>
              <span><strong>{activity?.resume_count || 0}</strong> resumes uploaded</span>
            </div>
            <div className="gp-stat-row">
              <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span><strong>{activity?.job_search_total || 0}</strong> job searches</span>
            </div>
            <div className="gp-stat-row">
              <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              <span><strong>{activity?.saved_jobs_count || 0}</strong> saved jobs</span>
            </div>
          </div>

          <div className="gp-sidebar-meta">
            {profile?.email && (
              <div className="gp-meta-row">
                <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z"/></svg>
                <span>{profile.email}</span>
              </div>
            )}
            {profile?.phone && (
              <div className="gp-meta-row">
                <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M1.5 1.75v2.5c0 5.523 4.477 10 10 10h2.5a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v.5a6.5 6.5 0 0 1-6.5-6.5h.5a.75.75 0 0 0 .75-.75v-2.5A.75.75 0 0 0 4.25 1h-2.5a.75.75 0 0 0-.25.75Z"/></svg>
                <span>{profile.phone}</span>
              </div>
            )}
            {profile?.location && (
              <div className="gp-meta-row">
                <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
                <span>{profile.location}</span>
              </div>
            )}
          </div>

          {profile?.skills?.length > 0 && (
            <div className="gp-sidebar-section">
              <h4>Top Skills</h4>
              <div className="gp-tag-wrap">
                {profile.skills.slice(0, 5).map((s, i) => {
                  const name = typeof s === "object" ? s.name : s;
                  return <span key={i} className="gp-tag">{name}</span>;
                })}
              </div>
            </div>
          )}

          <div className="gp-sidebar-actions" style={{ marginTop: "1rem" }}>
            <Link to="/resumes" className="gp-btn-secondary">← Back to Resumes</Link>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="gp-main">
          {/* Tab Navigation */}
          <div className="gp-tabs">
            <button
              className={`gp-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              My Profile
            </button>
            <button
              className={`gp-tab ${activeTab === "activity" ? "active" : ""}`}
              onClick={() => setActiveTab("activity")}
            >
              My Activity
            </button>
          </div>

          {activeTab === "profile" && (
            <>
              {/* Hi there banner */}
              <div className="gp-hi-banner">
                <span className="gp-hi-wave">👋</span>
                <div>
                  <h2>Hi there, I'm {profile?.full_name?.split(" ")[0] || "there"}</h2>
                  {profile?.summary && <p>{profile.summary}</p>}
                </div>
              </div>

              {/* Personal Info */}
              {profile && (
                <div className="gp-content-section">
                  <h3><span className="gp-section-icon">👤</span> Personal Information</h3>
                  <div className="gp-personal-grid">
                    {profile.full_name && <div><strong>Name:</strong> {profile.full_name}</div>}
                    {profile.headline && <div><strong>Headline:</strong> {profile.headline}</div>}
                    {profile.email && <div><strong>Email:</strong> {profile.email}</div>}
                    {profile.phone && <div><strong>Phone:</strong> {profile.phone}</div>}
                    {profile.location && <div><strong>Location:</strong> {profile.location}</div>}
                    {profile.website && <div><strong>Website:</strong> <a href={profile.website} target="_blank" rel="noreferrer">{profile.website}</a></div>}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {profile && (
                <div className="gp-content-section">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                    <h3 style={{ margin: 0 }}><span className="gp-section-icon">🔗</span> Social Links</h3>
                    <button 
                      onClick={handleEditLinks}
                      className="gp-btn-primary"
                      style={{ padding: "0.3rem 0.7rem", fontSize: "0.75rem", marginRight: 0 }}
                    >
                      ✏️ Edit Links
                    </button>
                  </div>
                  <div className="gp-social-links">
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noreferrer" className="gp-social-link">
                        🌐 Website
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noreferrer" className="gp-social-link">
                        💼 LinkedIn
                      </a>
                    )}
                    {profile.github && (
                      <a href={profile.github} target="_blank" rel="noreferrer" className="gp-social-link">
                        🐙 GitHub
                      </a>
                    )}
                    {profile.leetcode && (
                      <a href={profile.leetcode} target="_blank" rel="noreferrer" className="gp-social-link">
                        💻 LeetCode
                      </a>
                    )}
                    {!profile.website && !profile.linkedin && !profile.github && !profile.leetcode && (
                      <p className="gp-empty-state">No social links added yet. Click "Edit Links" to add some!</p>
                    )}
                  </div>
                </div>
              )}

              {/* Edit Links Modal */}
              {editingLinks && (
                <div className="gp-overlay" onClick={() => setEditingLinks(false)}>
                  <div className="gp-modal" onClick={e => e.stopPropagation()}>
                    <div className="gp-modal-head">
                      <h3>Edit Social Links</h3>
                      <button onClick={() => setEditingLinks(false)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <div className="gp-field" style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.875rem", fontWeight: "600" }}>Website</label>
                        <input 
                          type="url"
                          value={linkForm.website || ""} 
                          onChange={e => setLinkForm(f => ({...f, website: e.target.value}))}
                          placeholder="https://yourwebsite.com"
                          style={{ width: "100%", padding: "0.5rem", border: "1px solid #d0d7de", borderRadius: "6px", fontSize: "0.875rem" }}
                        />
                      </div>
                      <div className="gp-field" style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.875rem", fontWeight: "600" }}>LinkedIn</label>
                        <input 
                          type="url"
                          value={linkForm.linkedin || ""} 
                          onChange={e => setLinkForm(f => ({...f, linkedin: e.target.value}))}
                          placeholder="https://linkedin.com/in/yourprofile"
                          style={{ width: "100%", padding: "0.5rem", border: "1px solid #d0d7de", borderRadius: "6px", fontSize: "0.875rem" }}
                        />
                      </div>
                      <div className="gp-field" style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.875rem", fontWeight: "600" }}>GitHub</label>
                        <input 
                          type="url"
                          value={linkForm.github || ""} 
                          onChange={e => setLinkForm(f => ({...f, github: e.target.value}))}
                          placeholder="https://github.com/yourprofile"
                          style={{ width: "100%", padding: "0.5rem", border: "1px solid #d0d7de", borderRadius: "6px", fontSize: "0.875rem" }}
                        />
                      </div>
                      <div className="gp-field" style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.875rem", fontWeight: "600" }}>LeetCode</label>
                        <input 
                          type="url"
                          value={linkForm.leetcode || ""} 
                          onChange={e => setLinkForm(f => ({...f, leetcode: e.target.value}))}
                          placeholder="https://leetcode.com/yourprofile"
                          style={{ width: "100%", padding: "0.5rem", border: "1px solid #d0d7de", borderRadius: "6px", fontSize: "0.875rem" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                        <button 
                          onClick={() => setEditingLinks(false)}
                          className="gp-btn-secondary"
                          style={{ flex: 1 }}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSaveLinks}
                          className="gp-btn-primary"
                          style={{ flex: 1 }}
                        >
                          💾 Save Links
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {profile?.skills?.length > 0 && (
                <div className="gp-content-section">
                  <h3><span className="gp-section-icon">⚡</span> Skills</h3>
                  <div className="gp-all-skills">
                    {profile.skills.map((s, i) => {
                      const name = typeof s === "object" ? s.name : s;
                      const level = typeof s === "object" ? s.level : null;
                      return (
                        <span key={i} className="gp-skill-pill">
                          {name}{level ? <em style={{fontSize:"0.7rem",opacity:0.7,marginLeft:"0.3rem"}}>{level}</em> : null}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Experience */}
              {profile?.experience?.length > 0 && (
                <div className="gp-content-section">
                  <h3><span className="gp-section-icon">💼</span> Experience</h3>
                  <div className="gp-experience-list">
                    {profile.experience.map((exp, i) => (
                      <div key={i} className="gp-exp-item">
                        <h4>{exp.title} at {exp.company}</h4>
                        <p>{exp.start_date} - {exp.end_date || "Present"}</p>
                        {exp.description && <p>{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profile?.education?.length > 0 && (
                <div className="gp-content-section">
                  <h3><span className="gp-section-icon">🎓</span> Education</h3>
                  <div className="gp-education-list">
                    {profile.education.map((edu, i) => (
                      <div key={i} className="gp-edu-item">
                        <h4>{edu.degree} in {edu.field}</h4>
                        <p>{edu.institution}, {edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "activity" && (
            activityLoading ? (
              <div className="gp-loading" style={{padding:"3rem",textAlign:"center"}}><div className="gp-spinner" /><p>Loading activity…</p></div>
            ) : !activity ? (
              <p style={{padding:"2rem",color:"var(--muted)",textAlign:"center"}}>No activity data available.</p>
            ) : (
            <>
              {/* Activity Stats */}
              <div className="gp-content-section">
                <h3><span className="gp-section-icon">📊</span> Activity Overview</h3>
                <div className="gp-activity-stats">
                  <div className="gp-stat-card">
                    <span className="gp-stat-icon">📄</span>
                    <span className="gp-stat-val">{activity.resume_count}</span>
                    <span className="gp-stat-label">Resumes Uploaded</span>
                  </div>
                  <div className="gp-stat-card">
                    <span className="gp-stat-icon">🔍</span>
                    <span className="gp-stat-val">{activity.job_search_total}</span>
                    <span className="gp-stat-label">Job Searches</span>
                  </div>
                  <div className="gp-stat-card">
                    <span className="gp-stat-icon">💾</span>
                    <span className="gp-stat-val">{activity.saved_jobs_count}</span>
                    <span className="gp-stat-label">Saved Jobs</span>
                  </div>
                  <div className="gp-stat-card">
                    <span className="gp-stat-icon">🏆</span>
                    <span className="gp-stat-val">{activity.certificates.length}</span>
                    <span className="gp-stat-label">Certificates</span>
                  </div>
                </div>
              </div>

              {/* Usage */}
              <div className="gp-content-section">
                <h3><span className="gp-section-icon">📈</span> Usage Limits</h3>
                <div className="gp-usage-bars">
                  <div className="gp-usage-item">
                    <div className="gp-usage-label">Resume Uploads: {activity.resume_count} / {activity.limits.resume_upload_limit}</div>
                    <div className="gp-bar-bg">
                      <div className="gp-bar-fill" style={{ width: `${Math.min(resumeUsedPct, 100)}%`, background: resumeUsedPct >= 100 ? "#DC2626" : "#2563EB" }} />
                    </div>
                  </div>
                  <div className="gp-usage-item">
                    <div className="gp-usage-label">Job Searches Today: {activity.job_search_today} / {activity.limits.job_search_limit}</div>
                    <div className="gp-bar-bg">
                      <div className="gp-bar-fill" style={{ width: `${Math.min(jobUsedPct, 100)}%`, background: jobUsedPct >= 100 ? "#DC2626" : "#059669" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Resumes */}
              {activity.resumes?.length > 0 && (
                <div className="gp-content-section">
                  <h3><span className="gp-section-icon">📄</span> Recent Resumes</h3>
                  <div className="gp-recent-list">
                    {activity.resumes.slice(0, 5).map(r => (
                      <div key={r.id} className="gp-recent-item">
                        <span className="gp-recent-name">{r.filename}</span>
                        <span className="gp-recent-meta">v{r.version} · {fmtDate(r.uploaded_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Job Searches */}
              {activity.job_searches?.length > 0 && (
                <div className="gp-content-section">
                  <h3><span className="gp-section-icon">🔍</span> Recent Job Searches</h3>
                  <div className="gp-recent-list">
                    {activity.job_searches.slice(0, 5).map(s => (
                      <div key={s.id} className="gp-recent-item">
                        <span className="gp-recent-name">{s.query}</span>
                        <span className="gp-recent-meta">{s.location || "Any location"} · {fmtDate(s.searched_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ))}
        </main>
      </div>
    </div>
  );
}