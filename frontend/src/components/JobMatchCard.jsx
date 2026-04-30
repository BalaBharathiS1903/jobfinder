import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

export default function JobMatchCard({ job }) {
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: () => api.post("/jobs/saved/", {
      job_id: job.id, title: job.title, company: job.company,
      location: job.location, url: job.url, source: job.source,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-jobs"] }),
  });

  const score = job.match_score ?? 0;
  const color = score >= 70 ? "#059669" : score >= 40 ? "#D97706" : "#6B7280";

  return (
    <div className="jmc-card">
      <div className="jmc-score-ring" style={{ "--score-color": color }}>
        <svg viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${score} 100`} strokeLinecap="round"
            transform="rotate(-90 18 18)" />
        </svg>
        <span style={{ color }}>{score}%</span>
      </div>

      <div className="jmc-body">
        <div className="jmc-title-row">
          <strong>{job.title}</strong>
          {job.trust_level && (
            <span className={`jmc-trust jmc-trust-${job.trust_level}`}>{job.trust_level}</span>
          )}
        </div>
        <p className="jmc-meta">{job.company}{job.location ? ` · ${job.location}` : ""}</p>

        {job.matched_skills?.length > 0 && (
          <div className="jmc-skills">
            {job.matched_skills.map(s => <span key={s} className="jmc-skill matched">{s}</span>)}
            {job.missing_skills?.slice(0, 3).map(s => <span key={s} className="jmc-skill missing">{s}</span>)}
          </div>
        )}
      </div>

      <div className="jmc-actions">
        <a href={job.url} target="_blank" rel="noreferrer" className="jmc-btn-view">View</a>
        <button className="jmc-btn-save" onClick={() => save.mutate()} disabled={save.isPending || save.isSuccess}>
          {save.isSuccess ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  );
}
