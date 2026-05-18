import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { fmtDate } from "../lib/date";
import { useAuth } from "../context/AuthContext";
import "./Resumes.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

function validateResumeFile(file) {
  if (!file) return "No file selected.";
  const lowerName = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
    return "Unsupported file type. Use PDF, DOCX or TXT.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File too large. Maximum size is 5 MB.";
  }
  return "";
}

export default function Resumes() {
  const qc = useQueryClient();
  const uploadRef = useRef();
  const replaceRef = useRef();
  const [replaceId, setReplaceId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [reparsingId, setReparsingId] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [expandedVersions, setExpandedVersions] = useState({});

  const { user } = useAuth();
  const resumeLimit = user?.resume_upload_limit ?? 5;

  const { data: resumes = [], isLoading, isError, error } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get("/resume/").then((r) => r.data),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/resume/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resumes"] }),
  });

  const reparseMutation = useMutation({
    mutationFn: (id) => api.post(`/resume/${id}/reparse/`),
    onMutate: (id) => setReparsingId(id),
    onSettled: () => {
      setReparsingId(null);
      qc.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateResumeFile(file);
    if (validationError) {
      setUploadError(validationError);
      uploadRef.current.value = "";
      return;
    }

    setUploadError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/resume/upload/", fd);
      qc.invalidateQueries({ queryKey: ["resumes"] });
    } catch (err) {
      setUploadError(err.response?.data?.error || "Upload failed.");
    } finally {
      setUploading(false);
      uploadRef.current.value = "";
    }
  };

  const handleReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replaceId) return;
    const validationError = validateResumeFile(file);
    if (validationError) {
      setUploadError(validationError);
      replaceRef.current.value = "";
      setReplaceId(null);
      return;
    }

    setUploadError("");
    setReplacing(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post(`/resume/${replaceId}/replace/`, fd);
      qc.invalidateQueries({ queryKey: ["resumes"] });
    } catch (err) {
      setUploadError(err.response?.data?.error || "Replace failed.");
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

  const atLimit = resumes.length >= resumeLimit;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Resumes</h1>
          <p className="page-sub">
            {resumes.length} / {resumeLimit} resumes uploaded
          </p>
        </div>
        <label
          className={`btn-primary ${atLimit ? "btn-disabled" : ""}`}
          title={atLimit ? `Maximum ${resumeLimit} resumes. Delete or replace one first.` : "Upload new resume"}
        >
          {uploading ? "Uploading..." : "Upload Resume"}
          <input
            ref={uploadRef}
            type="file"
            accept=".pdf,.docx,.txt"
            hidden
            onChange={handleUpload}
            disabled={uploading || atLimit}
          />
        </label>
        <input
          ref={replaceRef}
          type="file"
          accept=".pdf,.docx,.txt"
          hidden
          onChange={handleReplace}
          disabled={replacing}
        />
      </div>

      {atLimit && (
        <div className="limit-banner">
          You&apos;ve reached the <strong>{resumeLimit}-resume limit</strong>. Use <strong>Replace</strong> to update
          an existing resume or <strong>Delete</strong> to free a slot.
        </div>
      )}

      {isError && <p className="error">{error?.response?.data?.error || error?.message || "Failed to load resumes."}</p>}
      {uploadError && <p className="error">{uploadError}</p>}

      {isLoading ? (
        <p className="loading">Loading...</p>
      ) : resumes.length === 0 ? (
        <div className="empty">Upload a resume to get started.</div>
      ) : (
        <div className="resume-list">
          {resumes.map((r) => (
            <div key={r.id} className="resume-card">
              <div className="resume-card-header">
                <div className="resume-card-title">
                  <span className="resume-filename">Document {r.filename}</span>
                  <span className="resume-version-badge">v{r.version}</span>
                </div>
                <span className="resume-date">{fmtDate(r.uploaded_at)}</span>
              </div>

              <div className="resume-details">
                {r.name && <span>Profile {r.name}</span>}
                {r.email && <span>Email {r.email}</span>}
                {r.phone && <span>Phone {r.phone}</span>}
                {r.years_exp > 0 && <span>Experience {r.years_exp} yrs</span>}
                {r.education && <span>Education {r.education}</span>}
              </div>

              {r.skills.length > 0 && (
                <div className="tags-row">
                  {r.skills.slice(0, 12).map((s) => (
                    <span key={s} className="tag">
                      {s}
                    </span>
                  ))}
                  {r.skills.length > 12 && <span className="tag tag-more">+{r.skills.length - 12}</span>}
                </div>
              )}

              <div className="resume-actions">
                <Link to={`/resumes/${r.id}/profile`} className="btn-secondary">
                  View Profile
                </Link>
                <button className="btn-secondary" onClick={() => triggerReplace(r.id)} disabled={replacing}>
                  {replacing && replaceId === r.id ? "Replacing..." : "Replace"}
                </button>
                <button className="btn-secondary" onClick={() => reparseMutation.mutate(r.id)} disabled={reparsingId === r.id}>
                  {reparsingId === r.id ? "Re-parsing..." : "Re-parse"}
                </button>
                <button className="btn-danger" onClick={() => deleteMutation.mutate(r.id)}>
                  Delete
                </button>
              </div>

              {r.versions?.length > 0 && (
                <div className="version-section">
                  <button
                    className="version-toggle"
                    onClick={() => setExpandedVersions((p) => ({ ...p, [r.id]: !p[r.id] }))}
                  >
                    {r.versions.length} version{r.versions.length > 1 ? "s" : ""} {expandedVersions[r.id] ? "▲" : "▼"}
                  </button>
                  {expandedVersions[r.id] && (
                    <div className="version-list">
                      {r.versions.map((v) => (
                        <div key={v.version} className="version-item">
                          <div className="version-item-header">
                            <span className="version-num">v{v.version}</span>
                            <span className="version-file">{v.filename}</span>
                            <span className="version-date">{fmtDate(v.saved_at)}</span>
                          </div>
                          {v.skills?.length > 0 && (
                            <div className="version-skills">
                              {v.skills.slice(0, 8).map((s) => (
                                <span key={s} className="tag tag-sm">
                                  {s}
                                </span>
                              ))}
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
