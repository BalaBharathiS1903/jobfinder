import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import "./Resumes.css";

const MAX = 5;

export default function Resumes() {
  const qc = useQueryClient();
  const uploadRef = useRef();
  const replaceRef = useRef();
  const [replaceId, setReplaceId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [error, setError] = useState("");
  const [expandedVersions, setExpandedVersions] = useState({});

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get("/resume/").then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/resume/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resumes"] }),
  });

  const reparseMutation = useMutation({
    mutationFn: (id) => api.post(`/resume/${id}/reparse/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resumes"] }),
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/resume/upload/", fd);
      qc.invalidateQueries({ queryKey: ["resumes"] });
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed.");
    } finally {
      setUploading(false);
      uploadRef.current.value = "";
    }
  };

  const handleReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replaceId) return;
    setError("");
    setReplacing(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post(`/resume/${replaceId}/replace/`, fd);
      qc.invalidateQueries({ queryKey: ["resumes"] });
    } catch (err) {
      setError(err.response?.data?.error || "Replace failed.");
    } finally {
      setReplacing(false);
      setReplaceId(null);
      replaceRef.current.value = "";
    }
  };

  const triggerReplace = (id) => {
    setReplaceId(id);
    setTimeout(() => replaceRef.current?.click(), 50);
  };

  const atLimit = resumes.length >= MAX;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Resumes</h1>
          <p className="page-sub">{resumes.length} / {MAX} resumes uploaded</p>
        </div>
        <label className={`btn-primary ${atLimit ? "btn-disabled" : ""}`}
          title={atLimit ? `Maximum ${MAX} resumes. Delete or replace one first.` : "Upload new resume"}>
          {uploading ? "Uploading…" : "Upload Resume"}
          <input ref={uploadRef} type="file" accept=".pdf,.docx,.txt" hidden
            onChange={handleUpload} disabled={uploading || atLimit} />
        </label>
        {/* Hidden replace input */}
        <input ref={replaceRef} type="file" accept=".pdf,.docx,.txt" hidden
          onChange={handleReplace} disabled={replacing} />
      </div>

      {atLimit && (
        <div className="limit-banner">
          ⚠️ You've reached the <strong>{MAX}-resume limit</strong>. Use <strong>Replace</strong> to update an existing resume or <strong>Delete</strong> to free a slot.
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {isLoading ? (
        <p className="loading">Loading…</p>
      ) : resumes.length === 0 ? (
        <div className="empty">Upload a resume to get started.</div>
      ) : (
        <div className="resume-list">
          {resumes.map((r) => (
            <div key={r.id} className="resume-card">
              <div className="resume-card-header">
                <div className="resume-card-title">
                  <span className="resume-filename">📄 {r.filename}</span>
                  <span className="resume-version-badge">v{r.version}</span>
                </div>
                <span className="resume-date">{new Date(r.uploaded_at).toLocaleDateString()}</span>
              </div>

              <div className="resume-details">
                {r.name  && <span>👤 {r.name}</span>}
                {r.email && <span>✉ {r.email}</span>}
                {r.phone && <span>📞 {r.phone}</span>}
                {r.years_exp > 0 && <span>💼 {r.years_exp} yrs exp</span>}
                {r.education && <span>🎓 {r.education}</span>}
              </div>

              {r.skills.length > 0 && (
                <div className="tags-row">
                  {r.skills.slice(0, 12).map(s => <span key={s} className="tag">{s}</span>)}
                  {r.skills.length > 12 && <span className="tag tag-more">+{r.skills.length - 12}</span>}
                </div>
              )}

              <div className="resume-actions">
                <Link to={`/resumes/${r.id}/profile`} className="btn-secondary">View Profile</Link>
                <button className="btn-secondary" onClick={() => triggerReplace(r.id)} disabled={replacing}>
                  {replacing && replaceId === r.id ? "Replacing…" : "🔄 Replace"}
                </button>
                <button className="btn-secondary" onClick={() => reparseMutation.mutate(r.id)}
                  disabled={reparseMutation.isPending}>
                  {reparseMutation.isPending ? "Re-parsing…" : "⚙️ Re-parse"}
                </button>
                <button className="btn-danger" onClick={() => deleteMutation.mutate(r.id)}>Delete</button>
              </div>

              {/* Version history */}
              {r.versions?.length > 0 && (
                <div className="version-section">
                  <button className="version-toggle"
                    onClick={() => setExpandedVersions(p => ({ ...p, [r.id]: !p[r.id] }))}>
                    🕐 {r.versions.length} version{r.versions.length > 1 ? "s" : ""} {expandedVersions[r.id] ? "▲" : "▼"}
                  </button>
                  {expandedVersions[r.id] && (
                    <div className="version-list">
                      {r.versions.map(v => (
                        <div key={v.version} className="version-item">
                          <div className="version-item-header">
                            <span className="version-num">v{v.version}</span>
                            <span className="version-file">{v.filename}</span>
                            <span className="version-date">{new Date(v.saved_at).toLocaleDateString()}</span>
                          </div>
                          {v.skills?.length > 0 && (
                            <div className="version-skills">
                              {v.skills.slice(0, 8).map(s => <span key={s} className="tag tag-sm">{s}</span>)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
