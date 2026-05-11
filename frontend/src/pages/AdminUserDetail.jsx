import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import "./AdminUserDetail.css";

const COURSE_LIST = [
  { id: "python-basics",       label: "Python Basics" },
  { id: "web-dev",             label: "Web Development" },
  { id: "data-science",        label: "Data Science" },
  { id: "django-rest",         label: "Django REST API" },
  { id: "javascript-advanced", label: "JavaScript Advanced" },
  { id: "sql-databases",       label: "SQL & Databases" },
  { id: "git-devops",          label: "Git & DevOps" },
  { id: "java-basics",         label: "Java Fundamentals" },
  { id: "typescript",          label: "TypeScript" },
  { id: "golang",              label: "Go (Golang)" },
  { id: "rust-lang",           label: "Rust" },
  { id: "kotlin",              label: "Kotlin" },
  { id: "cpp",                 label: "C / C++" },
  { id: "php",                 label: "PHP & Laravel" },
  { id: "ruby",                label: "Ruby & Rails" },
  { id: "swift",               label: "Swift & iOS" },
];

const Icon = {
  back:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  user:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>,
  phone:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  pin:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  link:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  brief:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  book:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  file:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  star:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  check:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  lock:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
};

function Section({ icon, title, children }) {
  return (
    <div className="aud-section">
      <div className="aud-section-header">
        <span className="aud-section-icon">{icon}</span>
        <h2>{title}</h2>
      </div>
      <div className="aud-section-body">{children}</div>
    </div>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [approving, setApproving] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [errors, setErrors] = useState(null);
  const [toast, setToast] = useState("");

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const updateMutation = useMutation({
    mutationFn: (patch) => api.patch(`/auth/admin/users/${id}/`, patch).then((r) => r.data),
    onSuccess: (updated) => {
      qc.setQueryData(["admin-user-detail", id], (old) => ({
        ...old,
        user: { ...old.user, ...updated },
      }));
      setEditMode(false);
      setErrors(null);
      notify("User updated successfully.");
    },
    onError: (err) => {
      const data = err.response?.data;
      setErrors(typeof data === "object" ? data : { general: data?.error || "Update failed." });
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-detail", id],
    queryFn: () => api.get(`/auth/admin/users/${id}/detail/`).then(r => r.data),
  });

  const { data: accessData, refetch: refetchAccess } = useQuery({
    queryKey: ["admin-course-access", id],
    queryFn: () => api.get(`/courses/admin/${id}/access/`).then(r => r.data),
  });

  useEffect(() => {
    if (data) {
      setEditForm({
        username: data.user.username,
        email: data.user.email,
        is_active: data.user.is_active,
        has_prep_access: data.user.has_prep_access,
        resume_upload_limit: data.user.resume_upload_limit,
        job_search_limit: data.user.job_search_limit,
      });
    }
  }, [data]);

  const approvedCourses = new Set(accessData?.approved_courses || []);

  const toggleCourse = async (courseId, grant) => {
    setApproving(courseId);
    await api.post(`/courses/admin/${id}/toggle/`, { course_id: courseId, grant });
    refetchAccess();
    setApproving(null);
    notify(grant ? "Course approved." : "Course revoked.");
  };

  const approveAll = async () => {
    setApproving("all");
    await api.post(`/courses/admin/${id}/approve-all/`);
    refetchAccess();
    setApproving(null);
    notify("All courses approved.");
  };

  if (isLoading) return <div className="aud-loading"><div className="aud-spinner" /><p>Loading user details…</p></div>;
  if (!data) return <div className="aud-loading"><p>User not found.</p></div>;

  const { user, profile, resumes, job_searches, saved_jobs } = data;
  const initials = (profile?.full_name || user.username).split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const handleSave = () => {
    if (!editForm) return;
    const payload = {
      username: editForm.username,
      email: editForm.email,
      is_active: editForm.is_active,
      has_prep_access: editForm.has_prep_access,
      resume_upload_limit: Number(editForm.resume_upload_limit) || 0,
      job_search_limit: Number(editForm.job_search_limit) || 0,
    };
    updateMutation.mutate(payload);
  };

  return (
    <div className="aud-page">
      {toast && <div className="aud-toast">{toast}</div>}

      {/* Top bar */}
      <div className="aud-topbar">
        <button className="aud-back-btn" onClick={() => navigate("/admin-dashboard")}> 
          <span>{Icon.back}</span> Back to Dashboard
        </button>
        <button className="aud-edit-btn" onClick={() => setEditMode((m) => !m)}>
          {editMode ? "Cancel Edit" : "Edit User"}
        </button>
      </div>

      <div className="aud-hero">
        <div className="aud-hero-avatar">{initials}</div>
        <div className="aud-hero-info">
          <h1>{profile?.full_name || user.username}</h1>
          {profile?.headline && <p className="aud-hero-headline">{profile.headline}</p>}
          <div className="aud-hero-meta">
            {profile?.email && <span><span className="aud-meta-icon">{Icon.mail}</span>{profile.email}</span>}
            {profile?.phone && <span><span className="aud-meta-icon">{Icon.phone}</span>{profile.phone}</span>}
            {profile?.location && <span><span className="aud-meta-icon">{Icon.pin}</span>{profile.location}</span>}
          </div>
          <div className="aud-hero-links">
            {profile?.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" className="aud-social-link aud-linkedin">LinkedIn</a>}
            {profile?.github && <a href={profile.github} target="_blank" rel="noreferrer" className="aud-social-link aud-github">GitHub</a>}
            {profile?.website && <a href={profile.website} target="_blank" rel="noreferrer" className="aud-social-link aud-website">Website</a>}
          </div>
        </div>
        <div className="aud-hero-badges">
          <span className={`aud-badge ${user.is_active ? "badge-active" : "badge-inactive"}`}>{user.is_active ? "Active" : "Inactive"}</span>
          <span className={`aud-badge ${user.is_superuser ? "badge-super" : user.is_staff ? "badge-admin" : "badge-user"}`}>
            {user.is_superuser ? "Superadmin" : user.is_staff ? "Admin" : "User"}
          </span>
          {user.has_prep_access && <span className="aud-badge badge-prep">Prep Access</span>}
        </div>
      </div>

      {editMode && editForm && (
        <Section icon={Icon.lock} title="Edit User">
          {errors?.general && <div className="aud-error-msg">{errors.general}</div>}
          <div className="aud-form-grid">
            <div className="aud-form-row">
              <label>Username</label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
              />
              {errors?.username && <span className="aud-field-error">{errors.username}</span>}
            </div>
            <div className="aud-form-row">
              <label>Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
              {errors?.email && <span className="aud-field-error">{errors.email}</span>}
            </div>
            <div className="aud-form-row">
              <label>Active</label>
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
            </div>
            <div className="aud-form-row">
              <label>Prep Access</label>
              <input
                type="checkbox"
                checked={editForm.has_prep_access}
                onChange={(e) => setEditForm((f) => ({ ...f, has_prep_access: e.target.checked }))}
              />
            </div>
            <div className="aud-form-row">
              <label>Resume Limit</label>
              <input
                type="number"
                min="0"
                value={editForm.resume_upload_limit}
                onChange={(e) => setEditForm((f) => ({ ...f, resume_upload_limit: e.target.value }))}
              />
            </div>
            <div className="aud-form-row">
              <label>Job Search Limit</label>
              <input
                type="number"
                min="0"
                value={editForm.job_search_limit}
                onChange={(e) => setEditForm((f) => ({ ...f, job_search_limit: e.target.value }))}
              />
            </div>
          </div>
          <div className="aud-form-actions">
            <button className="aud-save-btn" type="button" onClick={handleSave} disabled={updateMutation.isLoading}>
              {updateMutation.isLoading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </Section>
      )}

      {/* Stats row */}
      <div className="aud-stats-row">
        <div className="aud-stat"><span className="aud-stat-val">{resumes?.length || 0}</span><span className="aud-stat-label">Resumes</span></div>
        <div className="aud-stat"><span className="aud-stat-val">{job_searches?.length || 0}</span><span className="aud-stat-label">Job Searches</span></div>
        <div className="aud-stat"><span className="aud-stat-val">{saved_jobs?.length || 0}</span><span className="aud-stat-label">Saved Jobs</span></div>
        <div className="aud-stat"><span className="aud-stat-val">{approvedCourses.size}</span><span className="aud-stat-label">Courses Approved</span></div>
        <div className="aud-stat"><span className="aud-stat-val">{user.resume_upload_limit}</span><span className="aud-stat-label">Resume Limit</span></div>
        <div className="aud-stat"><span className="aud-stat-val">{user.job_search_limit}</span><span className="aud-stat-label">Daily Search Limit</span></div>
      </div>

      <div className="aud-grid">
        {/* Left column — Profile + Activity */}
        <div className="aud-col">

          {/* Account Info */}
          <Section icon={Icon.user} title="Account Info">
            <div className="aud-info-list">
              <div className="aud-info-row"><span className="aud-info-label">Username</span><span>{user.username}</span></div>
              <div className="aud-info-row"><span className="aud-info-label">Email</span><span>{user.email}</span></div>
              <div className="aud-info-row"><span className="aud-info-label">Joined</span><span>{new Date(user.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></div>
              <div className="aud-info-row"><span className="aud-info-label">Status</span><span className={`aud-badge ${user.is_active ? "badge-active" : "badge-inactive"}`}>{user.is_active ? "Active" : "Inactive"}</span></div>
              <div className="aud-info-row"><span className="aud-info-label">Prep Hub</span><span className={`aud-badge ${user.has_prep_access ? "badge-prep" : "badge-inactive"}`}>{user.has_prep_access ? "Granted" : "Revoked"}</span></div>
            </div>
          </Section>

          {/* Summary */}
          {profile?.summary && (
            <Section icon={Icon.user} title="About">
              <p className="aud-summary">{profile.summary}</p>
            </Section>
          )}

          {/* Skills */}
          {profile?.skills?.length > 0 && (
            <Section icon={Icon.star} title="Skills">
              <div className="aud-tags">
                {profile.skills.map((s, i) => (
                  <span key={i} className="aud-tag">
                    {typeof s === "object" ? s.name : s}
                    {typeof s === "object" && s.level && <span className="aud-tag-level">{s.level}</span>}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Experience */}
          {profile?.experience?.length > 0 && (
            <Section icon={Icon.brief} title="Experience">
              <div className="aud-timeline">
                {profile.experience.map((e, i) => (
                  <div key={i} className="aud-timeline-item">
                    <div className="aud-timeline-dot" />
                    <div>
                      <div className="aud-tl-title">{e.title}</div>
                      <div className="aud-tl-sub">{e.company}{e.duration && ` · ${e.duration}`}</div>
                      {e.description && <p className="aud-tl-desc">{e.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {profile?.education?.length > 0 && (
            <Section icon={Icon.book} title="Education">
              <div className="aud-timeline">
                {profile.education.map((e, i) => (
                  <div key={i} className="aud-timeline-item">
                    <div className="aud-timeline-dot" />
                    <div>
                      <div className="aud-tl-title">{e.degree}</div>
                      <div className="aud-tl-sub">{e.institution}{e.year && ` · ${e.year}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Certifications */}
          {profile?.certifications?.length > 0 && (
            <Section icon={Icon.check} title="Certifications">
              <div className="aud-cert-list">
                {profile.certifications.map((c, i) => (
                  <div key={i} className="aud-cert-item">
                    <span className="aud-cert-name">{c.name}</span>
                    {c.issuer && <span className="aud-cert-issuer">{c.issuer}</span>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          {profile?.projects?.length > 0 && (
            <Section icon={Icon.link} title="Projects">
              <div className="aud-timeline">
                {profile.projects.map((p, i) => (
                  <div key={i} className="aud-timeline-item">
                    <div className="aud-timeline-dot" />
                    <div>
                      <div className="aud-tl-title">{p.name}</div>
                      {p.description && <p className="aud-tl-desc">{p.description}</p>}
                      {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="aud-proj-link">View Project →</a>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Recent Job Searches */}
          <Section icon={Icon.search} title="Recent Job Searches">
            {job_searches?.length > 0 ? (
              <div className="aud-activity-list">
                {job_searches.map((s, i) => (
                  <div key={i} className="aud-activity-row">
                    <span className="aud-activity-icon">{Icon.search}</span>
                    <div className="aud-activity-info">
                      <span className="aud-activity-title">{s.query}</span>
                      {s.location && <span className="aud-activity-sub">{s.location}</span>}
                    </div>
                    <span className="aud-activity-date">{new Date(s.searched_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : <p className="aud-empty">No job searches yet.</p>}
          </Section>

          {/* Saved Jobs */}
          <Section icon={Icon.brief} title="Saved Jobs">
            {saved_jobs?.length > 0 ? (
              <div className="aud-activity-list">
                {saved_jobs.map((j, i) => (
                  <div key={i} className="aud-activity-row">
                    <span className="aud-activity-icon">{Icon.brief}</span>
                    <div className="aud-activity-info">
                      <span className="aud-activity-title">{j.title}</span>
                      <span className="aud-activity-sub">{j.company}{j.location && ` · ${j.location}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="aud-empty">No saved jobs.</p>}
          </Section>
        </div>

        {/* Right column — Resumes + Course Access */}
        <div className="aud-col">

          {/* Resumes */}
          <Section icon={Icon.file} title={`Resumes (${resumes?.length || 0})`}>
            {resumes?.length > 0 ? (
              <div className="aud-resume-list">
                {resumes.map((r) => (
                  <div key={r.id} className="aud-resume-card">
                    <div className="aud-resume-top">
                      <span className="aud-resume-icon">{Icon.file}</span>
                      <div className="aud-resume-info">
                        <span className="aud-resume-name">{r.filename}</span>
                        <span className="aud-resume-date">{new Date(r.uploaded_at).toLocaleDateString()}</span>
                      </div>
                      <span className="aud-badge badge-user">v{r.version}</span>
                    </div>
                    {r.skills?.length > 0 && (
                      <div className="aud-tags" style={{ marginTop: "0.6rem" }}>
                        {r.skills.slice(0, 10).map((s, i) => <span key={i} className="aud-tag">{s}</span>)}
                        {r.skills.length > 10 && <span className="aud-tag aud-tag-more">+{r.skills.length - 10} more</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : <p className="aud-empty">No resumes uploaded.</p>}
          </Section>

          {/* Course Access */}
          <Section icon={Icon.book} title="Course Access">
            <div className="aud-course-header">
              <span className="aud-course-count">{approvedCourses.size} / {COURSE_LIST.length} approved</span>
              <button className="aud-approve-all-btn" onClick={approveAll} disabled={approving === "all"}>
                {approving === "all" ? "Approving…" : "✓ Approve All"}
              </button>
            </div>
            <div className="aud-course-grid">
              {COURSE_LIST.map(c => {
                const approved = approvedCourses.has(c.id);
                return (
                  <div key={c.id} className={`aud-course-row ${approved ? "course-on" : "course-off"}`}>
                    <span className="aud-course-dot">{approved ? Icon.check : Icon.lock}</span>
                    <span className="aud-course-label">{c.label}</span>
                    <button
                      className={`aud-toggle-btn ${approved ? "toggle-revoke" : "toggle-approve"}`}
                      disabled={approving === c.id}
                      onClick={() => toggleCourse(c.id, !approved)}
                    >
                      {approving === c.id ? "…" : approved ? "Revoke" : "Approve"}
                    </button>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
