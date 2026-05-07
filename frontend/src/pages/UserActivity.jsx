import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import "./UserActivity.css";

const COURSE_NAMES = {
  python: "Python Basics", webdev: "Web Development", datascience: "Data Science",
  django: "Django REST API", javascript: "JavaScript Advanced", sql: "SQL & Databases",
  git: "Git & DevOps", java: "Java Fundamentals", typescript: "TypeScript",
  go: "Go (Golang)", rust: "Rust", kotlin: "Kotlin", cpp: "C/C++",
  php: "PHP & Laravel", ruby: "Ruby & Rails", swift: "Swift & iOS",
};

const Icon = {
  file:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  search:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bookmark:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  book:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  cert:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  clock:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="ua-stat-card">
      <span className="ua-stat-icon" style={{ color }}>{icon}</span>
      <span className="ua-stat-val" style={{ color }}>{value}</span>
      <span className="ua-stat-label">{label}</span>
      {sub && <span className="ua-stat-sub">{sub}</span>}
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="ua-section">
      <div className="ua-section-header">
        <span className="ua-section-icon">{icon}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function UserActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-activity"],
    queryFn: () => api.get("/auth/my-activity/").then(r => r.data),
  });

  if (isLoading) return <div className="ua-loading">Loading your activity…</div>;
  if (!data) return null;

  const resumeUsedPct = Math.round((data.resume_count / data.limits.resume_upload_limit) * 100);
  const jobUsedPct = data.limits.job_search_limit > 0
    ? Math.round((data.job_search_today / data.limits.job_search_limit) * 100)
    : 0;

  return (
    <div className="ua-page">
      <div className="ua-header">
        <h1>My Activity</h1>
        <p>Your usage, history and progress at a glance</p>
      </div>

      {/* Stats */}
      <div className="ua-stats">
        <StatCard icon={Icon.file}     label="Resumes Uploaded"   value={data.resume_count}        sub={`Limit: ${data.limits.resume_upload_limit}`}       color="#2563EB" />
        <StatCard icon={Icon.search}   label="Total Job Searches" value={data.job_search_total}    sub={`Today: ${data.job_search_today} / ${data.limits.job_search_limit}`} color="#059669" />
        <StatCard icon={Icon.bookmark} label="Saved Jobs"         value={data.saved_jobs_count}    color="#D97706" />
        <StatCard icon={Icon.cert}     label="Certificates"       value={data.certificates.length} color="#7C3AED" />
      </div>

      {/* Usage bars */}
      <div className="ua-usage-row">
        <div className="ua-usage-card">
          <div className="ua-usage-top">
            <span>Resume Uploads</span>
            <span>{data.resume_count} / {data.limits.resume_upload_limit}</span>
          </div>
          <div className="ua-bar-bg">
            <div className="ua-bar-fill" style={{ width: `${Math.min(resumeUsedPct, 100)}%`, background: resumeUsedPct >= 100 ? "#DC2626" : "#2563EB" }} />
          </div>
        </div>
        <div className="ua-usage-card">
          <div className="ua-usage-top">
            <span>Job Searches Today</span>
            <span>{data.job_search_today} / {data.limits.job_search_limit}</span>
          </div>
          <div className="ua-bar-bg">
            <div className="ua-bar-fill" style={{ width: `${Math.min(jobUsedPct, 100)}%`, background: jobUsedPct >= 100 ? "#DC2626" : "#059669" }} />
          </div>
        </div>
      </div>

      {/* Resumes */}
      <Section icon={Icon.file} title="Resume History">
        {data.resumes.length === 0 ? (
          <p className="ua-empty">No resumes uploaded yet.</p>
        ) : (
          <div className="ua-table-wrap">
            <table className="ua-table">
              <thead><tr><th>Filename</th><th>Version</th><th>Reparsed</th><th>Skills</th><th>Uploaded</th></tr></thead>
              <tbody>
                {data.resumes.map((r) => (
                  <tr key={r.id}>
                    <td className="ua-filename">{r.filename}</td>
                    <td><span className="ua-badge ua-badge-blue">v{r.version}</span></td>
                    <td>{r.version_count > 0 ? <span className="ua-badge ua-badge-gray">{r.version_count}x</span> : "—"}</td>
                    <td>
                      <div className="ua-skill-tags">
                        {(r.skills || []).slice(0, 5).map((s, i) => <span key={i} className="ua-skill">{s}</span>)}
                        {(r.skills || []).length > 5 && <span className="ua-skill ua-skill-more">+{r.skills.length - 5}</span>}
                      </div>
                    </td>
                    <td className="ua-date">{new Date(r.uploaded_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Job Search History */}
      <Section icon={Icon.search} title="Job Search History">
        {data.job_searches.length === 0 ? (
          <p className="ua-empty">No job searches yet.</p>
        ) : (
          <div className="ua-table-wrap">
            <table className="ua-table">
              <thead><tr><th>Query</th><th>Location</th><th>Date</th></tr></thead>
              <tbody>
                {data.job_searches.map((s) => (
                  <tr key={s.id}>
                    <td className="ua-bold">{s.query}</td>
                    <td className="ua-muted">{s.location || "—"}</td>
                    <td className="ua-date">
                      <span className="ua-clock">{Icon.clock}</span>
                      {new Date(s.searched_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Saved Jobs */}
      <Section icon={Icon.bookmark} title="Saved Jobs">
        {data.saved_jobs.length === 0 ? (
          <p className="ua-empty">No saved jobs yet.</p>
        ) : (
          <div className="ua-table-wrap">
            <table className="ua-table">
              <thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Saved</th></tr></thead>
              <tbody>
                {data.saved_jobs.map((j) => (
                  <tr key={j.id}>
                    <td className="ua-bold">
                      {j.url ? <a href={j.url} target="_blank" rel="noreferrer">{j.title}</a> : j.title}
                    </td>
                    <td className="ua-muted">{j.company}</td>
                    <td className="ua-muted">{j.location || "—"}</td>
                    <td className="ua-date">{new Date(j.saved_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Course Progress */}
      <Section icon={Icon.book} title="Course Progress">
        {data.course_progress.length === 0 ? (
          <p className="ua-empty">No courses started yet.</p>
        ) : (
          <div className="ua-courses-grid">
            {data.course_progress.map((cp) => {
              const pct = Math.round((cp.completed_lessons / 20) * 100);
              const hasCert = data.certificates.some(c => c.course_id === cp.course_id);
              return (
                <div key={cp.course_id} className="ua-course-card">
                  <div className="ua-course-top">
                    <span className="ua-course-name">{COURSE_NAMES[cp.course_id] || cp.course_id}</span>
                    {hasCert && <span className="ua-cert-badge">{Icon.cert} Certified</span>}
                  </div>
                  <div className="ua-course-meta">{cp.completed_lessons} / 20 lessons</div>
                  <div className="ua-bar-bg">
                    <div className="ua-bar-fill" style={{ width: `${pct}%`, background: pct === 100 ? "#7C3AED" : "#2563EB" }} />
                  </div>
                  <span className="ua-pct">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Certificates */}
      {data.certificates.length > 0 && (
        <Section icon={Icon.cert} title="Certificates Earned">
          <div className="ua-certs-grid">
            {data.certificates.map((c) => (
              <div key={c.cert_id} className="ua-cert-card">
                <span className="ua-cert-icon">{Icon.cert}</span>
                <div>
                  <p className="ua-cert-course">{COURSE_NAMES[c.course_id] || c.course_id}</p>
                  <p className="ua-cert-id">ID: {c.cert_id}</p>
                  <p className="ua-cert-date">Completed: {c.completed_on}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
