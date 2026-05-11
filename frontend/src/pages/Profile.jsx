import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { fmtDate } from "../lib/date";
import "./Profile.css";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPDF, setShowPDF] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  const { data: resume, isLoading, isError } = useQuery({
    queryKey: ["resume", id],
    queryFn: () => api.get(`/resume/${id}/`).then((r) => r.data),
  });

  const { data: allResumes = [] } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get("/resume/").then(r => r.data),
  });

  if (isLoading) return <div className="gp-loading"><div className="gp-spinner" /><p>Analyzing resume…</p></div>;
  if (isError)   return <div className="gp-loading"><p>Resume not found.</p></div>;

  const initials = resume.name
    ? resume.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const isPDF = resume.filename?.toLowerCase().endsWith(".pdf");

  const handleResumeChange = (newId) => { setShowSelector(false); navigate(`/resumes/${newId}/profile`); };

  const openInBuilder = () => {
    navigate("/resume-builder", {
      state: {
        fromResume: {
          name: resume.name || "", email: resume.email || "", phone: resume.phone || "",
          summary: resume.summary || "", skills: resume.skills || [],
          headline: resume.job_titles?.[0] || "",
          experience: [], education: [], certifications: [], projects: [],
        },
        replaceId: resume.id,
      }
    });
  };

  const allSkillSections = [
    { label: "Programming Languages", items: resume.languages,  color: "#2563EB", bg: "#EFF6FF" },
    { label: "Frameworks & Libraries", items: resume.frameworks, color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Tools & Cloud",          items: resume.tools,      color: "#059669", bg: "#F0FDF4" },
    { label: "Soft Skills",            items: resume.soft_skills,color: "#D97706", bg: "#FFFBEB" },
  ].filter(s => s.items?.length > 0);

  return (
    <div className="gp-page">

      {/* Resume Selector Modal */}
      {showSelector && (
        <div className="gp-overlay" onClick={() => setShowSelector(false)}>
          <div className="gp-modal" onClick={e => e.stopPropagation()}>
            <div className="gp-modal-head">
              <h3>Switch Resume</h3>
              <button onClick={() => setShowSelector(false)}>✕</button>
            </div>
            <p className="gp-modal-sub">Select which resume to view:</p>
            <div className="gp-modal-list">
              {allResumes.map(r => (
                <button key={r.id} className={`gp-modal-item ${r.id === resume.id ? "active" : ""}`} onClick={() => handleResumeChange(r.id)}>
                  <span className="gp-modal-icon">📄</span>
                  <div>
                    <span className="gp-modal-name">{r.filename}</span>
                    <span className="gp-modal-meta">v{r.version} · {fmtDate(r.uploaded_at)}</span>
                  </div>
                  {r.id === resume.id && <span className="gp-modal-cur">Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="gp-layout">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="gp-sidebar">
          <div className="gp-avatar-wrap">
            <div className="gp-avatar">{initials}</div>
          </div>

          <h1 className="gp-name">{resume.name || "Unknown Candidate"}</h1>
          {resume.job_titles?.[0] && <p className="gp-username">@{resume.job_titles[0]}</p>}

          {resume.summary && <p className="gp-bio">{resume.summary}</p>}

          <div className="gp-sidebar-actions">
            <button className="gp-btn-primary" onClick={openInBuilder}>✏️ Edit in Builder</button>
            {allResumes.length > 1 && (
              <button className="gp-btn-secondary" onClick={() => setShowSelector(true)}>🔄 Switch Resume</button>
            )}
            {isPDF && resume.file_url && (
              <button className="gp-btn-secondary" onClick={() => setShowPDF(v => !v)}>
                {showPDF ? "✕ Hide PDF" : "📄 View PDF"}
              </button>
            )}
          </div>

          <div className="gp-sidebar-stats">
            <div className="gp-stat-row">
              <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
              <span><strong>{resume.skills?.length || 0}</strong> skills detected</span>
            </div>
            <div className="gp-stat-row">
              <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v8.5a.25.25 0 0 1-.25.25h-6.5a.75.75 0 0 0-.53.22L4.5 14.44v-2.19a.75.75 0 0 0-.75-.75h-2a.25.25 0 0 1-.25-.25v-8.5Z"/></svg>
              <span><strong>{resume.projects?.length || 0}</strong> projects</span>
            </div>
            {resume.years_exp > 0 && (
              <div className="gp-stat-row">
                <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Z"/></svg>
                <span><strong>{resume.years_exp}</strong> yrs experience</span>
              </div>
            )}
          </div>

          <div className="gp-sidebar-meta">
            {resume.email && (
              <div className="gp-meta-row">
                <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z"/></svg>
                <span>{resume.email}</span>
              </div>
            )}
            {resume.phone && (
              <div className="gp-meta-row">
                <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M1.5 1.75v2.5c0 5.523 4.477 10 10 10h2.5a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v.5a6.5 6.5 0 0 1-6.5-6.5h.5a.75.75 0 0 0 .75-.75v-2.5A.75.75 0 0 0 4.25 1h-2.5a.75.75 0 0 0-.25.75Z"/></svg>
                <span>{resume.phone}</span>
              </div>
            )}
            <div className="gp-meta-row">
              <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M14 2H2v11.25c0 .138.112.25.25.25h11.5a.25.25 0 0 0 .25-.25V2Zm-6.5 6.5h-1v-1h1v1Zm0-2.5h-1V4.5h1V6Zm2.5 2.5h-1v-1h1v1Zm0-2.5h-1V4.5h1V6Zm-5 2.5h-1v-1h1v1Zm0-2.5h-1V4.5h1V6Z"/></svg>
              <span>v{resume.version} · {fmtDate(resume.uploaded_at)}</span>
            </div>
          </div>

          {resume.job_titles?.length > 0 && (
            <div className="gp-sidebar-section">
              <h4>Detected Roles</h4>
              <div className="gp-tag-wrap">
                {resume.job_titles.map(t => <span key={t} className="gp-tag-role">{t}</span>)}
              </div>
            </div>
          )}

          {resume.education && (
            <div className="gp-sidebar-section">
              <h4>Education</h4>
              <p className="gp-sidebar-text">{resume.education}</p>
            </div>
          )}

          <div className="gp-sidebar-actions" style={{ marginTop: "1rem" }}>
            <Link to="/resumes" className="gp-btn-secondary">← Back to Resumes</Link>
            <Link to="/search" className="gp-btn-primary">Find Matching Jobs</Link>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="gp-main">

          {/* PDF Viewer */}
          {showPDF && resume.file_url && (
            <div className="gp-pdf-wrap">
              <div className="gp-pdf-bar">
                <span>📄 {resume.filename}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a href={resume.file_url} target="_blank" rel="noreferrer" className="gp-pdf-open">Open ↗</a>
                  <button className="gp-pdf-close" onClick={() => setShowPDF(false)}>✕ Close</button>
                </div>
              </div>
              <iframe src={resume.file_url} title="Resume PDF" className="gp-pdf-frame" />
            </div>
          )}

          {/* Hi there banner */}
          <div className="gp-hi-banner">
            <span className="gp-hi-wave">👋</span>
            <div>
              <h2>Hi there, I'm {resume.name?.split(" ")[0] || "there"}</h2>
              {resume.summary && <p>{resume.summary}</p>}
            </div>
          </div>

          {/* Tech Stack / Skills */}
          {resume.skills?.length > 0 && (
            <div className="gp-content-section">
              <h3><span className="gp-section-icon">⚡</span> Tech Stack</h3>
              <div className="gp-skill-groups">
                {allSkillSections.map(sec => (
                  <div key={sec.label} className="gp-skill-group">
                    <span className="gp-skill-group-label" style={{ color: sec.color }}>{sec.label}</span>
                    <div className="gp-skill-tags">
                      {sec.items.map(s => (
                        <span key={s} className="gp-skill-badge" style={{ background: sec.bg, color: sec.color, borderColor: sec.color + "33" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
                {/* All skills fallback if no categorized */}
                {allSkillSections.length === 0 && (
                  <div className="gp-skill-tags">
                    {resume.skills.map(s => <span key={s} className="gp-skill-badge">{s}</span>)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All skills combined */}
          {resume.skills?.length > 0 && (
            <div className="gp-content-section">
              <h3><span className="gp-section-icon">🛠️</span> All Skills <span className="gp-count-badge">{resume.skills.length}</span></h3>
              <div className="gp-all-skills">
                {resume.skills.map(s => <span key={s} className="gp-skill-pill">{s}</span>)}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.projects?.length > 0 && (
            <div className="gp-content-section">
              <h3><span className="gp-section-icon">📌</span> Projects</h3>
              <div className="gp-projects">
                {resume.projects.map((p, i) => (
                  <div key={i} className="gp-project-card">
                    <div className="gp-project-num">{i + 1}</div>
                    <p>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {resume.keywords?.length > 0 && (
            <div className="gp-content-section">
              <h3><span className="gp-section-icon">🔑</span> Top Keywords</h3>
              <div className="gp-keywords">
                {resume.keywords.slice(0, 25).map(k => <span key={k} className="gp-keyword">{k}</span>)}
              </div>
            </div>
          )}

          {/* Socials placeholder row */}
          <div className="gp-content-section gp-socials-row">
            <h3><span className="gp-section-icon">📬</span> Contact</h3>
            <div className="gp-contact-chips">
              {resume.email && <a href={`mailto:${resume.email}`} className="gp-contact-chip gp-chip-email">✉ {resume.email}</a>}
              {resume.phone && <span className="gp-contact-chip gp-chip-phone">📞 {resume.phone}</span>}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
