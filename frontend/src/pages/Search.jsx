import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import LocationInput from "../components/LocationInput";
import "./Search.css";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  try {
    const iso = dateStr.toString().replace(" ", "T");
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60)    return "just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  } catch {
    return "";
  }
}

export default function Search() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ query: "", location: "", resume_id: "", country: "in" });
  const [results, setResults] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [source, setSource] = useState("all");
  const [resumeSkills, setResumeSkills] = useState([]);
  const [minScore, setMinScore] = useState(0);
  const [trustFilter, setTrustFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [autoError, setAutoError] = useState("");
  const [autoLabel, setAutoLabel] = useState("");
  const [skillsUsed, setSkillsUsed] = useState([]);

  const { data: resumes = [] } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get("/resume/").then((r) => r.data),
  });

  const searchMutation = useMutation({
    mutationFn: (data) => api.post("/jobs/search/", data).then((r) => r.data),
    onSuccess: (data) => { setResults(data.results ?? []); setSavedIds(new Set()); setSource("all"); setAutoLabel(""); setSkillsUsed([]); },
  });

  const autoMutation = useMutation({
    mutationFn: (data) => api.post("/jobs/auto-search/", data).then((r) => r.data),
    onSuccess: (data) => {
      setResults(data.results ?? []);
      setAutoLabel(data.query ?? "");
      setSkillsUsed(data.skills_used ?? []);
      setForm((f) => ({ ...f, query: data.query ?? f.query }));
      setSavedIds(new Set());
      setSource("all");
      setMinScore(0);
    },
    onError: (err) => {
      const msg = err.response?.data?.error || "Auto match failed. Please try again.";
      setAutoError(msg);
      setTimeout(() => setAutoError(""), 5000);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (job) => api.post("/jobs/saved/", {
      job_id: job.id, title: job.title ?? "", company: job.company ?? "",
      location: job.location ?? "", url: job.url ?? "",
    }),
    onSuccess: (_, job) => setSavedIds((prev) => new Set([...prev, job.id])),
  });

  const handleResumeChange = (e) => {
    const id = e.target.value;
    setForm((f) => ({ ...f, resume_id: id, query: "" }));
    setResumeSkills([]);
    if (!id) return;
    const resume = resumes.find(r => String(r.id) === String(id));
    if (!resume) return;
    setResumeSkills(resume.skills || []);
    // Build a smart query from resume skills/titles
    const skills = (resume.skills || []).map(s => s.toLowerCase());
    const titles = (resume.job_titles || []).map(t => t.toLowerCase());
    const ROLE_MAP = [
      (["react", "javascript", "typescript", "vue", "angular"], "frontend developer"),
      (["django", "flask", "fastapi", "spring boot", "node.js"], "backend developer"),
      (["javascript", "java", "python", "sql"], "software developer"),
      (["machine learning", "tensorflow", "pytorch", "scikit-learn"], "machine learning engineer"),
      (["pandas", "numpy", "matplotlib"], "data analyst"),
      (["docker", "kubernetes", "aws", "terraform"], "devops engineer"),
      (["android", "kotlin", "swift", "flutter"], "mobile developer"),
      (["sql", "postgresql", "mysql", "mongodb"], "database developer"),
    ];
    let query = "";
    for (const [roleSkills, roleName] of ROLE_MAP) {
      if (roleSkills.some(s => skills.includes(s))) { query = roleName; break; }
    }
    if (!query) {
      const nonGeneric = titles.filter(t => !["intern", "trainee", "associate"].includes(t));
      query = nonGeneric[0] || (skills[0] ? `${skills[0]} developer` : titles[0] || "");
    }
    setForm((f) => ({ ...f, resume_id: id, query }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchMutation.mutate(form);
  };

  const isLoading = searchMutation.isPending || autoMutation.isPending;

  const handleAutoSearch = () => {
    if (!form.resume_id) {
      setAutoError("Please select a resume first.");
      setTimeout(() => setAutoError(""), 3000);
      return;
    }
    setAutoError("");
    setAutoLabel("");
    setSkillsUsed([]);
    setMinScore(0);
    autoMutation.mutate({ resume_id: form.resume_id, location: form.location, country: form.country });
  };

  const filtered = results
    ? (source === "all" ? results : results.filter((j) => j.source === source))
        .filter((j) => (j.match_score ?? 0) >= minScore)
        .filter((j) => trustFilter === "all" || j.trust_label === trustFilter)
        .filter((j) => {
          if (dateFilter === "all" || !j.posted_at) return true;
          const iso = j.posted_at.toString().replace(" ", "T");
          const d = new Date(iso);
          if (isNaN(d.getTime())) return true;
          const days = (Date.now() - d) / 86400000;
          if (dateFilter === "today")  return days <= 1;
          if (dateFilter === "week")   return days <= 7;
          if (dateFilter === "month")  return days <= 30;
          return true;
        })
    : null;

  const sources = results ? [...new Set(results.map((j) => j.source).filter(Boolean))] : [];

  return (
    <div className="portal">
      <div className="portal-hero">
        <h1>Find Your Next Job</h1>
        <p>Auto-match jobs from your resume skills or search manually</p>

        <form className="search-bar" onSubmit={handleSubmit}>
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Job title or keyword"
              value={form.query}
              onChange={(e) => setForm({ ...form, query: e.target.value })}
            />
          </div>
          <div className="search-hint">Leave query blank to search by selected resume.</div>
          <LocationInput
            value={form.location}
            onChange={(val) => setForm({ ...form, location: val })}
            country={form.country}
          />
          <select value={form.resume_id} onChange={handleResumeChange}>
            <option value="">Select resume</option>
            {resumes.map((r) => <option key={r.id} value={r.id}>📄 {r.filename}</option>)}
          </select>
          <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
            <option value="in">🇮🇳 India</option>
            <option value="us">🇺🇸 USA</option>
            <option value="gb">🇬🇧 UK</option>
            <option value="au">🇦🇺 Australia</option>
            <option value="ca">🇨🇦 Canada</option>
            <option value="de">🇩🇪 Germany</option>
            <option value="sg">🇸🇬 Singapore</option>
          </select>
          <button type="submit" className="btn-search" disabled={isLoading}>
            {searchMutation.isPending ? <><span className="spinner" /> Searching…</> : "Search"}
          </button>
        </form>

        {/* Auto match button */}
        <div className="auto-row">
          <button className="btn-auto" onClick={handleAutoSearch} disabled={isLoading}>
            {autoMutation.isPending
              ? <><span className="spinner" /> Matching…</>
              : "⚡ Auto Match Jobs from Resume"}
          </button>
          <span className="auto-hint">Automatically finds jobs matching your resume skills</span>
        </div>
        {autoError && <p className="search-error" style={{ marginTop: "0.5rem" }}>{autoError}</p>}

        {skillsUsed.length > 0 && (
          <div className="skill-chips" style={{ marginTop: "0.5rem" }}>
            <span className="chips-label">⚡ Auto matched using:</span>
            {skillsUsed.map((s) => (
              <span key={s} className="chip chip-active">{s}</span>
            ))}
          </div>
        )}

        {resumeSkills.length > 0 && (
          <div className="skill-chips">
            <span className="chips-label">Your skills — click to add to search:</span>
            {resumeSkills.map((s) => (
              <button
                key={s} type="button"
                className={`chip ${form.query.toLowerCase().includes(s.toLowerCase()) ? "chip-active" : ""}`}
                onClick={() => setForm((f) => ({
                  ...f,
                  query: f.query.toLowerCase().includes(s.toLowerCase())
                    ? f.query
                    : `${f.query} ${s}`.trim()
                }))}
              >{s}</button>
            ))}
          </div>
        )}
      </div>

      {searchMutation.isError && (
        <p className="search-error">Search failed. Please try again.</p>
      )}

      {filtered !== null && (
        <div className="portal-body">
          <aside className="portal-sidebar">
            <div className="sidebar-section">
              <h3>Date Posted</h3>
              {[["all","Any time"],["today","Today"],["week","This week"],["month","This month"]].map(([val, label]) => (
                <button key={val} className={`filter-btn ${dateFilter === val ? "active" : ""}`}
                  onClick={() => setDateFilter(val)}>{label}
                </button>
              ))}
            </div>

            <div className="sidebar-section">
              <h3>Trust Filter</h3>
              {["all", "Verified", "Suspicious", "Fake"].map((t) => (
                <button key={t} className={`filter-btn ${trustFilter === t ? "active" : ""}`}
                  onClick={() => setTrustFilter(t)}>
                  {t === "all" ? "All Jobs" :
                   t === "Verified" ? "✅ Verified" :
                   t === "Suspicious" ? "⚠️ Suspicious" : "🚫 Fake"}
                </button>
              ))}
            </div>

            <div className="sidebar-section">
              <h3>Source</h3>
              {["all", ...sources].map((s) => (
                <button key={s} className={`filter-btn ${source === s ? "active" : ""}`} onClick={() => setSource(s)}>
                  {s === "all" ? `All (${results.length})` : `${s} (${results.filter(j => j.source === s).length})`}
                </button>
              ))}
            </div>

            {form.resume_id && (
              <>
                <div className="sidebar-section">
                  <h3>Min Match Score</h3>
                  <div className="score-filter">
                    <input type="range" min="0" max="80" step="10" value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))} />
                    <span className="score-val">{minScore}%+</span>
                  </div>
                </div>
                <div className="sidebar-section">
                  <h3>Score Guide</h3>
                  <div className="score-legend"><span className="legend-dot" style={{ background: "hsl(84,70%,40%)" }} /> 70–100% Strong</div>
                  <div className="score-legend"><span className="legend-dot" style={{ background: "hsl(48,70%,40%)" }} /> 40–69% Good</div>
                  <div className="score-legend"><span className="legend-dot" style={{ background: "hsl(12,70%,40%)" }} /> 0–39% Weak</div>
                </div>
              </>
            )}
          </aside>

          <main className="portal-main">
            <p className="results-count">
              <strong>{filtered.length}</strong> job{filtered.length !== 1 ? "s" : ""} found
              {form.location && <> in <em>{form.location}</em></>}
              {autoLabel
                ? <> — <em>⚡ matched by skills: {autoLabel}</em></>
                : form.query && <> for <em>"{form.query}"</em></>}
            </p>

            {filtered.length === 0 ? (
              <div className="no-results">No jobs found. Try lowering the match score filter or a different keyword.</div>
            ) : (
              filtered.map((job) => (
                <div key={job.id} className={`job-card ${job.match_score >= 70 ? "strong" : job.match_score >= 40 ? "good" : ""}`}>
                  <div className="job-card-top">
                    <div className="job-info">
                      <h2 className="job-title">{job.title}</h2>
                      <p className="job-company">
                        <span className="company-name">{job.company}</span>
                        {job.location && <><span className="dot">·</span><span className="job-location">📍 {job.location}</span></>}
                        {job.posted_at && <><span className="dot">·</span><span className="job-posted">🕐 {timeAgo(job.posted_at)}</span></>}
                      </p>
                    </div>
                    <div className="job-card-right">
                      {job.match_score !== undefined && (
                        <div className="match-badge" style={{ background: `hsl(${job.match_score * 1.2}, 70%, 40%)` }}>
                          {job.match_score}% match
                        </div>
                      )}
                      {job.source && <span className="source-badge">{job.source}</span>}
                      {job.trust_label && (
                        <span className={`trust-badge trust-${job.trust_label.toLowerCase()}`}>
                          {job.trust_label === "Verified" ? "✅" : job.trust_label === "Suspicious" ? "⚠️" : "🚫"} {job.trust_label}
                        </span>
                      )}
                    </div>
                  </div>

                  {job.description && (
                    <p className="job-desc">{job.description.slice(0, 200)}{job.description.length > 200 ? "…" : ""}</p>
                  )}

                  {job.red_flags?.length > 0 && (
                    <div className="red-flags-row">
                      <span className="flags-label">🚩 Red flags:</span>
                      {job.red_flags.map((f) => <span key={f} className="flag-tag">{f}</span>)}
                    </div>
                  )}

                  {job.matched_skills?.length > 0 && (
                    <div className="skills-row">
                      <span className="skills-label">✅ Matched:</span>
                      {job.matched_skills.map((s) => <span key={s} className="tag tag-match">{s}</span>)}
                    </div>
                  )}
                  {job.missing_skills?.length > 0 && (
                    <div className="skills-row">
                      <span className="skills-label">❌ Missing:</span>
                      {job.missing_skills.slice(0, 5).map((s) => <span key={s} className="tag tag-miss">{s}</span>)}
                      <button
                        className="btn-build-kw"
                        title="Go to Resume Builder and add these missing skills"
                        onClick={() => navigate("/resume-builder", {
                          state: { missingSkills: job.missing_skills, jobTitle: job.title }
                        })}
                      >
                        🏗️ Build Resume with Keywords
                      </button>
                    </div>
                  )}

                  <div className="job-actions">
                    {job.url
                      ? <a href={job.url} target="_blank" rel="noreferrer" className="btn-view">View Job ↗</a>
                      : <span className="btn-view disabled">No link</span>}
                    <button
                      className={`btn-save ${savedIds.has(job.id) ? "saved" : ""}`}
                      onClick={() => !savedIds.has(job.id) && saveMutation.mutate(job)}
                      disabled={savedIds.has(job.id)}
                    >
                      {savedIds.has(job.id) ? "✓ Saved" : "🔖 Save"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </main>
        </div>
      )}

      {filtered === null && !isLoading && (
        <div className="portal-empty">
          <div className="empty-icon">💼</div>
          <h2>Select your resume to get started</h2>
          <p>Click <strong>⚡ Auto Match Jobs from Resume</strong> to instantly find jobs matching your skills.</p>
        </div>
      )}
    </div>
  );
}
