import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { fmtDate } from "../lib/date";
import "./Profile.css";

export default function Profile() {
  const { id } = useParams();

  const { data: resume, isLoading, isError } = useQuery({
    queryKey: ["resume", id],
    queryFn: () => api.get(`/resume/${id}/`).then((r) => r.data),
  });

  if (isLoading) return <div className="profile-loading">Analyzing resume…</div>;
  if (isError)   return <div className="profile-loading">Resume not found.</div>;

  const initials = resume.name
    ? resume.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const primaryTitle = resume.job_titles?.[0] || "";

  return (
    <div className="profile-page">

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
      </div>

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
