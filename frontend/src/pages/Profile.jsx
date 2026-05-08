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

  if (isLoading) return <div className="profile-loading">Analyzing resume…</div>;
  if (isError)   return <div className="profile-loading">Resume not found.</div>;

  const initials = resume.name
    ? resume.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const primaryTitle = resume.job_titles?.[0] || "";
  const isPDF = resume.filename?.toLowerCase().endsWith('.pdf');

  const handleResumeChange = (newId) => {
    setShowSelector(false);
    navigate(`/resumes/${newId}/profile`);
  };

  const openInBuilder = () => {
    navigate("/resume-builder", {
      state: {
        fromResume: {
          name:     resume.name     || "",
          email:    resume.email    || "",
          phone:    resume.phone    || "",
          summary:  resume.summary  || "",
          skills:   resume.skills   || [],
          headline: resume.job_titles?.[0] || "",
          experience:     [],
          education:      [],
          certifications: [],
          projects:       [],
        },
        replaceId: resume.id,
      }
    });
  };

  return (
    <div className="profile-page">

      {/* ── Resume Selector Modal ── */}
      {showSelector && (
        <div className="prof-modal-overlay" onClick={() => setShowSelector(false)}>
          <div className="prof-modal" onClick={e => e.stopPropagation()}>
            <div className="prof-modal-header">
              <h3>Switch Resume</h3>
              <button className="prof-modal-close" onClick={() => setShowSelector(false)}>✕</button>
            </div>
            <p className="prof-modal-sub">Select which resume to view the profile for:</p>
            <div className="prof-resume-list">
              {allResumes.map(r => (
                <button
                  key={r.id}
                  className={`prof-resume-item ${r.id === resume.id ? 'active' : ''}`}
                  onClick={() => handleResumeChange(r.id)}
                >
                  <div className="prof-resume-icon">📄</div>
                  <div className="prof-resume-info">
                    <span className="prof-resume-name">{r.filename}</span>
                    <span className="prof-resume-meta">v{r.version} · {fmtDate(r.uploaded_at)}</span>
                  </div>
                  {r.id === resume.id && <span className="prof-resume-active">Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Header card ── */}
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <h1>{resume.name || "Unknown Candidate"}</h1>
          {primaryTitle && <p className="profile-role">{primaryTitle}</p>}
          <div className="profile-contact">
            {resume.email && <span>{resume.email}</span>}
            {resume.phone && <span>{resume.phone}</span>}
          </div>
          {resume.summary && <p className="profile-summary">{resume.summary}</p>}
        </div>
        <div className="profile-header-right">
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-num">{resume.years_exp || 0}</span>
              <span className="stat-label">Yrs Exp</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{resume.skills?.length || 0}</span>
              <span className="stat-label">Skills</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{resume.projects?.length || 0}</span>
              <span className="stat-label">Projects</span>
            </div>
          </div>
          <div className="profile-header-btns">
            {allResumes.length > 1 && (
              <button className="prof-btn-switch" onClick={() => setShowSelector(true)}>
                🔄 Switch Resume
              </button>
            )}
            <button className="prof-btn-builder" onClick={openInBuilder}>
              ✏️ Edit in Builder
            </button>
            {isPDF && resume.file_url && (
              <button className="prof-btn-pdf" onClick={() => setShowPDF(v => !v)}>
                {showPDF ? '✕ Hide PDF' : '📄 View PDF'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── PDF Viewer ── */}
      {showPDF && resume.file_url && (
        <div className="prof-pdf-wrap">
          <div className="prof-pdf-bar">
            <span>📄 {resume.filename}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href={resume.file_url} target="_blank" rel="noreferrer" className="prof-pdf-open">Open in new tab ↗</a>
              <button className="prof-pdf-close" onClick={() => setShowPDF(false)}>✕ Close</button>
            </div>
          </div>
          <iframe
            src={resume.file_url}
            title="Resume PDF"
            className="prof-pdf-frame"
          />
        </div>
      )}

      {/* ── Education + Job Titles ── */}
      <div className="profile-row-2">
        {resume.education && (
          <div className="profile-card">
            <p className="card-label">Education</p>
            <p className="card-value">{resume.education}</p>
          </div>
        )}
        {resume.job_titles?.length > 0 && (
          <div className="profile-card profile-card-flex1">
            <p className="card-label">Detected Roles</p>
            <div className="tag-wrap">
              {resume.job_titles.map((t) => (
                <span key={t} className="tag-role">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Skills grid ── */}
      <div className="profile-skills-grid">
        <SkillSection title="Programming Languages" items={resume.languages} color="blue" />
        <SkillSection title="Frameworks & Libraries" items={resume.frameworks} color="purple" />
        <SkillSection title="Tools & Cloud" items={resume.tools} color="green" />
        <SkillSection title="Soft Skills" items={resume.soft_skills} color="orange" />
      </div>

      {/* ── All Skills combined ── */}
      {resume.skills?.length > 0 && (
        <div className="profile-section">
          <p className="card-label">All Detected Skills ({resume.skills.length})</p>
          <div className="tag-wrap">
            {resume.skills.map((s) => (
              <span key={s} className="tag-skill">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Projects ── */}
      {resume.projects?.length > 0 && (
        <div className="profile-section">
          <p className="card-label">Detected Projects</p>
          {resume.projects.map((p, i) => (
            <div key={i} className="project-card">
              <span className="project-num">{i + 1}</span>
              <p className="project-desc">{p}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Keywords ── */}
      {resume.keywords?.length > 0 && (
        <div className="profile-section">
          <p className="card-label">Top Keywords from Resume</p>
          <div className="tag-wrap">
            {resume.keywords.slice(0, 25).map((k) => (
              <span key={k} className="tag-keyword">{k}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── File info ── */}
      <div className="profile-section profile-meta">
        <span>File: <strong>{resume.filename}</strong></span>
        <span>Version: <strong>v{resume.version}</strong></span>
        <span>Uploaded: <strong>{fmtDate(resume.uploaded_at)}</strong></span>
      </div>

      <div className="profile-actions">
        <Link to="/resumes" className="btn-back">← Back to Resumes</Link>
        <Link to="/search" className="btn-search-jobs">Find Matching Jobs</Link>
      </div>
    </div>
  );
}

function SkillSection({ title, items = [], color }) {
  return (
    <div className={`skill-card skill-card-${color}`}>
      <p className="skill-card-title">{title}</p>
      {items.length === 0 ? (
        <p className="none-detected">None detected</p>
      ) : (
        <div className="skill-tags">
          {items.map((s) => <span key={s} className="stag">{s}</span>)}
        </div>
      )}
    </div>
  );
}
