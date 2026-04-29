import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import "./Profile.css";

export default function Profile() {
  const { id } = useParams();

  const { data: resume, isLoading, isError } = useQuery({
    queryKey: ["resume", id],
    queryFn: () => api.get(`/resume/${id}/`).then((r) => r.data),
  });

  if (isLoading) return <div className="profile-loading">Analyzing resume…</div>;
  if (isError) return <div className="profile-loading">Resume not found.</div>;

  const initials = resume.name
    ? resume.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const jobTitle = resume.job_titles?.[0] || "Professional";

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <h1>{resume.name || "Unknown"}</h1>
          <p className="profile-contact">
            {resume.email && <span>✉ {resume.email}</span>}
            {resume.phone && <span>· 📞 {resume.phone}</span>}
          </p>
          {jobTitle && <span className="profile-role">{jobTitle.toUpperCase()}</span>}
        </div>
        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-num">{resume.years_exp ?? 0}</span>
            <span className="stat-label">YEARS EXP.</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{resume.languages?.length ?? 0}</span>
            <span className="stat-label">LANGUAGES</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{resume.projects?.length ?? 0}</span>
            <span className="stat-label">PROJECTS</span>
          </div>
        </div>
      </div>

      {/* Skill Categories */}
      <div className="profile-skills-grid">
        <SkillCard icon="🎓" title="EDUCATION" items={resume.education ? [resume.education] : []} text />
        <SkillCard icon="💻" title="LANGUAGES" items={resume.languages} />
        <SkillCard icon="⚙️" title="FRAMEWORKS" items={resume.frameworks} />
        <SkillCard icon="🔧" title="TOOLS & CLOUD" items={resume.tools} />
        <SkillCard icon="🤝" title="SOFT SKILLS" items={resume.soft_skills} />
      </div>

      {/* Projects */}
      {resume.projects?.length > 0 && (
        <div className="profile-section">
          <h2 className="section-title">📁 DETECTED PROJECTS</h2>
          {resume.projects.map((p, i) => (
            <div key={i} className="project-card">
              <p className="project-desc">{p}</p>
              <div className="project-tags">
                {resume.languages?.slice(0, 3).map((l) => (
                  <span key={l} className="ptag">{l}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Keywords */}
      {resume.keywords?.length > 0 && (
        <div className="profile-section">
          <h2 className="section-title">🔑 TOP KEYWORDS</h2>
          <div className="keywords-wrap">
            {resume.keywords.slice(0, 20).map((k) => (
              <span key={k} className="keyword-tag">{k}</span>
            ))}
          </div>
        </div>
      )}

      <div className="profile-actions">
        <Link to="/resumes" className="btn-back">← Back to Resumes</Link>
        <Link to="/search" className="btn-search-jobs">🔍 Find Matching Jobs</Link>
      </div>
    </div>
  );
}

function SkillCard({ icon, title, items = [], text }) {
  return (
    <div className="skill-card">
      <p className="skill-card-title">{icon} {title}</p>
      {items.length === 0 ? (
        <p className="none-detected">None detected</p>
      ) : text ? (
        <p className="skill-text">{items[0]}</p>
      ) : (
        <div className="skill-tags">
          {items.map((s) => <span key={s} className="stag">{s}</span>)}
        </div>
      )}
    </div>
  );
}
