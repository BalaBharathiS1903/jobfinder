import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import "./Resumes.css";

export default function Resumes() {
  const qc = useQueryClient();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get("/resume/").then((r) => r.data),
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
      fileRef.current.value = "";
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Resumes</h1>
        <label className="btn-primary">
          {uploading ? "Uploading…" : "Upload Resume"}
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
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
                <span className="resume-filename">{r.filename}</span>
                <span className="resume-date">{new Date(r.uploaded_at).toLocaleDateString()}</span>
              </div>
              {r.name && <p><strong>Name:</strong> {r.name}</p>}
              {r.email && <p><strong>Email:</strong> {r.email}</p>}
              {r.skills.length > 0 && (
                <div className="tags-row">
                  {r.skills.map((s) => <span key={s} className="tag">{s}</span>)}
                </div>
              )}
              <div className="resume-actions">
                <button className="btn-secondary" onClick={() => reparseMutation.mutate(r.id)}>Re-parse</button>
                <button className="btn-danger" onClick={() => deleteMutation.mutate(r.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
