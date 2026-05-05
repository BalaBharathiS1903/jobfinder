import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { fmtDate } from "../lib/date";
import "./Saved.css";

export default function SavedJobs() {
  const qc = useQueryClient();

  const { data: saved = [], isLoading } = useQuery({
    queryKey: ["saved"],
    queryFn: () => api.get("/jobs/saved/").then((r) => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => api.delete(`/jobs/saved/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved"] }),
  });

  return (
    <div className="page">
      <h1 className="page-title">Saved Jobs</h1>
      {isLoading ? (
        <p className="loading">Loading…</p>
      ) : saved.length === 0 ? (
        <div className="empty">No saved jobs yet. Search and save jobs to see them here.</div>
      ) : (
        <div className="saved-list">
          {saved.map((job) => (
            <div key={job.id} className="saved-card">
              <div className="saved-info">
                <h3>{job.title}</h3>
                <p>{job.company} · {job.location}</p>
                <p className="saved-date">Saved {fmtDate(job.saved_at)}</p>
              </div>
              <div className="saved-actions">
                {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="btn-secondary">View</a>}
                <button className="btn-danger" onClick={() => removeMutation.mutate(job.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
