import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import "./AdminDashboard.css";

const Icon = {
  shield:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  users:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  check:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  cross:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  search:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  trash:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  book:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  lock:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  plus:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  eye:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  close:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

function CreateUserModal({ onClose, onCreated, notify }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post("/auth/admin/users/create/", form);
      onCreated(res.data);
      notify("User created successfully.");
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") setErrors(data);
      else notify(data?.error || "Failed to create user.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <h2>Create New User</h2>
          <button className="adm-modal-close" onClick={onClose}>{Icon.close}</button>
        </div>
        <form onSubmit={handleSubmit} className="adm-create-form">
          <div className="adm-field">
            <label>Username</label>
            <input required value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} />
            {errors.username && <span className="adm-field-err">{Array.isArray(errors.username) ? errors.username[0] : errors.username}</span>}
          </div>
          <div className="adm-field">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            {errors.email && <span className="adm-field-err">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</span>}
          </div>
          <div className="adm-field">
            <label>Password</label>
            <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
            {errors.password && <span className="adm-field-err">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</span>}
          </div>
          <div className="adm-modal-actions">
            <button type="button" className="adm-btn btn-warn" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn btn-success" disabled={loading}>
              {loading ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserDetailModal({ userId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => api.get(`/auth/admin/users/${userId}/detail/`).then(r => r.data),
  });

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal adm-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <h2>User Details</h2>
          <button className="adm-modal-close" onClick={onClose}>{Icon.close}</button>
        </div>
        {isLoading ? (
          <div className="adm-loading">Loading...</div>
        ) : data ? (
          <div className="adm-detail-body">
            {/* Account Info */}
            <section className="adm-detail-section">
              <h3>Account</h3>
              <div className="adm-detail-grid">
                <div><span className="adm-dl">Username</span><span>{data.user.username}</span></div>
                <div><span className="adm-dl">Email</span><span>{data.user.email}</span></div>
                <div><span className="adm-dl">Joined</span><span>{new Date(data.user.date_joined).toLocaleDateString()}</span></div>
                <div><span className="adm-dl">Status</span><span className={`adm-badge ${data.user.is_active ? "badge-active" : "badge-inactive"}`}>{data.user.is_active ? "Active" : "Inactive"}</span></div>
                <div><span className="adm-dl">Resume Limit</span><span>{data.user.resume_upload_limit}</span></div>
                <div><span className="adm-dl">Job Search Limit/day</span><span>{data.user.job_search_limit}</span></div>
                <div><span className="adm-dl">Prep Hub</span><span className={`adm-badge ${data.user.has_prep_access ? "badge-active" : "badge-inactive"}`}>{data.user.has_prep_access ? "Granted" : "Revoked"}</span></div>
              </div>
            </section>

            {/* Profile */}
            {data.profile && (
              <section className="adm-detail-section">
                <h3>Career Profile</h3>
                <div className="adm-detail-grid">
                  {data.profile.full_name && <div><span className="adm-dl">Full Name</span><span>{data.profile.full_name}</span></div>}
                  {data.profile.headline && <div><span className="adm-dl">Headline</span><span>{data.profile.headline}</span></div>}
                  {data.profile.email && <div><span className="adm-dl">Email</span><span>{data.profile.email}</span></div>}
                  {data.profile.phone && <div><span className="adm-dl">Phone</span><span>{data.profile.phone}</span></div>}
                  {data.profile.location && <div><span className="adm-dl">Location</span><span>{data.profile.location}</span></div>}
                  {data.profile.linkedin && <div><span className="adm-dl">LinkedIn</span><a href={data.profile.linkedin} target="_blank" rel="noreferrer">{data.profile.linkedin}</a></div>}
                  {data.profile.github && <div><span className="adm-dl">GitHub</span><a href={data.profile.github} target="_blank" rel="noreferrer">{data.profile.github}</a></div>}
                </div>
                {data.profile.summary && <p className="adm-detail-summary">{data.profile.summary}</p>}
                {data.profile.skills?.length > 0 && (
                  <div className="adm-detail-tags">
                    <span className="adm-dl">Skills</span>
                    <div className="adm-tags">
                      {data.profile.skills.map((s, i) => (
                        <span key={i} className="adm-tag">{typeof s === "object" ? s.name : s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {data.profile.experience?.length > 0 && (
                  <div className="adm-detail-list">
                    <span className="adm-dl">Experience</span>
                    {data.profile.experience.map((e, i) => (
                      <div key={i} className="adm-list-item">{e.title} @ {e.company} {e.duration && `(${e.duration})`}</div>
                    ))}
                  </div>
                )}
                {data.profile.education?.length > 0 && (
                  <div className="adm-detail-list">
                    <span className="adm-dl">Education</span>
                    {data.profile.education.map((e, i) => (
                      <div key={i} className="adm-list-item">{e.degree} — {e.institution} {e.year && `(${e.year})`}</div>
                    ))}
                  </div>
                )}
                {data.profile.certifications?.length > 0 && (
                  <div className="adm-detail-list">
                    <span className="adm-dl">Certifications</span>
                    {data.profile.certifications.map((c, i) => (
                      <div key={i} className="adm-list-item">{c.name} {c.issuer && `— ${c.issuer}`}</div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Resumes */}
            {data.resumes?.length > 0 && (
              <section className="adm-detail-section">
                <h3>Resumes ({data.resumes.length})</h3>
                {data.resumes.map((r) => (
                  <div key={r.id} className="adm-resume-row">
                    <span className="adm-resume-name">{r.filename}</span>
                    <span className="adm-badge badge-user">v{r.version}</span>
                    <span className="adm-date">{new Date(r.uploaded_at).toLocaleDateString()}</span>
                    {r.skills?.length > 0 && (
                      <div className="adm-tags" style={{ marginTop: "0.3rem" }}>
                        {r.skills.slice(0, 8).map((s, i) => <span key={i} className="adm-tag">{s}</span>)}
                        {r.skills.length > 8 && <span className="adm-tag">+{r.skills.length - 8}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Job Search Activity */}
            {data.job_searches?.length > 0 && (
              <section className="adm-detail-section">
                <h3>Recent Job Searches</h3>
                <div className="adm-activity-list">
                  {data.job_searches.map((s, i) => (
                    <div key={i} className="adm-activity-row">
                      <span>{s.query}</span>
                      {s.location && <span className="adm-muted">· {s.location}</span>}
                      <span className="adm-date">{new Date(s.searched_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Saved Jobs */}
            {data.saved_jobs?.length > 0 && (
              <section className="adm-detail-section">
                <h3>Saved Jobs</h3>
                <div className="adm-activity-list">
                  {data.saved_jobs.map((j, i) => (
                    <div key={i} className="adm-activity-row">
                      <span>{j.title}</span>
                      <span className="adm-muted">@ {j.company}</span>
                      {j.location && <span className="adm-muted">· {j.location}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Job Search Activity */}
            {data.job_searches?.length > 0 && (
              <section className="adm-detail-section">
                <h3>Recent Job Searches</h3>
                <div className="adm-activity-list">
                  {data.job_searches.map((s, i) => (
                    <div key={i} className="adm-activity-row">
                      <span>{s.query}</span>
                      {s.location && <span className="adm-muted">· {s.location}</span>}
                      <span className="adm-date">{new Date(s.searched_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Saved Jobs */}
            {data.saved_jobs?.length > 0 && (
              <section className="adm-detail-section">
                <h3>Saved Jobs</h3>
                <div className="adm-activity-list">
                  {data.saved_jobs.map((j, i) => (
                    <div key={i} className="adm-activity-row">
                      <span>{j.title}</span>
                      <span className="adm-muted">@ {j.company}</span>
                      {j.location && <span className="adm-muted">· {j.location}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [showCreate, setShowCreate] = useState(false);
  const [detailUserId, setDetailUserId] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/auth/admin/users/").then((r) => r.data),
  });

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, ...patch }) => api.patch(`/auth/admin/users/${id}/`, patch).then((r) => r.data),
    onSuccess: (updated) => {
      qc.setQueryData(["admin-users"], (old) => old.map((u) => u.id === updated.id ? updated : u));
      notify("User updated successfully.");
    },
    onError: (err) => notify(err.response?.data?.error || "Update failed.", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/auth/admin/users/${id}/delete/`),
    onSuccess: (_, id) => {
      qc.setQueryData(["admin-users"], (old) => old.filter((u) => u.id !== id));
      notify("User deleted.");
    },
    onError: (err) => notify(err.response?.data?.error || "Delete failed.", "error"),
  });

  const handleLimitChange = (u, field, value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) updateMutation.mutate({ id: u.id, [field]: num });
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Users",  value: users.length,                              color: "#2563EB", icon: Icon.users },
    { label: "Active",       value: users.filter((u) => u.is_active).length,   color: "#059669", icon: Icon.check },
    { label: "Inactive",     value: users.filter((u) => !u.is_active).length,  color: "#DC2626", icon: Icon.cross },
    { label: "Prep Access",  value: users.filter((u) => u.has_prep_access).length, color: "#7C3AED", icon: Icon.book },
  ];

  return (
    <div className="adm-page">
      {toast.msg && <div className={`adm-toast adm-toast-${toast.type}`}>{toast.msg}</div>}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(u) => qc.setQueryData(["admin-users"], (old) => [u, ...(old || [])])}
          notify={notify}
        />
      )}

      {detailUserId && (
        <UserDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />
      )}

      <div className="adm-header">
        <span className="adm-header-icon">{Icon.shield}</span>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users, permissions and limits</p>
        </div>
        <button className="adm-create-btn" onClick={() => setShowCreate(true)}>
          <span className="btn-icon">{Icon.plus}</span> Create User
        </button>
      </div>

      <div className="adm-stats">
        {stats.map((s) => (
          <div className="adm-stat-card" key={s.label}>
            <span className="adm-stat-icon" style={{ color: s.color }}>{s.icon}</span>
            <span className="adm-stat-val" style={{ color: s.color }}>{s.value}</span>
            <span className="adm-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="adm-toolbar">
        <div className="adm-search-wrap">
          <span className="adm-search-icon">{Icon.search}</span>
          <input
            className="adm-search"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="adm-count">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading ? (
        <div className="adm-loading">Loading users...</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Role</th>
                <th>Prep Hub</th>
                <th>Resume Limit</th>
                <th>Job Search Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={!u.is_active ? "adm-row-inactive" : ""}>
                  <td className="adm-num">{i + 1}</td>
                  <td className="adm-name">
                    <span className="adm-avatar">{u.username[0].toUpperCase()}</span>
                    <span>{u.username}</span>
                  </td>
                  <td className="adm-email">{u.email}</td>
                  <td className="adm-date">{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td>
                    <span className={`adm-badge ${u.is_active ? "badge-active" : "badge-inactive"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-badge ${u.is_superuser ? "badge-super" : u.is_staff ? "badge-admin" : "badge-user"}`}>
                      {u.is_superuser ? "Superadmin" : u.is_staff ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`adm-toggle ${u.has_prep_access ? "toggle-on" : "toggle-off"}`}
                      onClick={() => !u.is_superuser && updateMutation.mutate({ id: u.id, has_prep_access: !u.has_prep_access })}
                      disabled={u.is_superuser}
                    >
                      <span className="toggle-icon">{u.has_prep_access ? Icon.book : Icon.lock}</span>
                      {u.has_prep_access ? "Granted" : "Revoked"}
                    </button>
                  </td>
                  <td>
                    {!u.is_superuser ? (
                      <input
                        type="number" min="0" max="20"
                        className="adm-limit-input"
                        defaultValue={u.resume_upload_limit}
                        onBlur={(e) => handleLimitChange(u, "resume_upload_limit", e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLimitChange(u, "resume_upload_limit", e.target.value)}
                      />
                    ) : <span className="adm-protected">—</span>}
                  </td>
                  <td>
                    {!u.is_superuser ? (
                      <input
                        type="number" min="0" max="100"
                        className="adm-limit-input"
                        defaultValue={u.job_search_limit}
                        onBlur={(e) => handleLimitChange(u, "job_search_limit", e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLimitChange(u, "job_search_limit", e.target.value)}
                      />
                    ) : <span className="adm-protected">—</span>}
                  </td>
                  <td className="adm-actions">
                    <button
                      className="adm-btn btn-primary"
                      onClick={() => setDetailUserId(u.id)}
                      title="View full profile"
                    >
                      <span className="btn-icon">{Icon.eye}</span> View
                    </button>
                    {!u.is_superuser && (
                      <>
                        <button
                          className={`adm-btn ${u.is_active ? "btn-warn" : "btn-success"}`}
                          onClick={() => updateMutation.mutate({ id: u.id, is_active: !u.is_active })}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          className="adm-btn btn-danger"
                          onClick={() => { if (window.confirm(`Delete user "${u.username}"?`)) deleteMutation.mutate(u.id); }}
                        >
                          <span className="btn-icon">{Icon.trash}</span> Delete
                        </button>
                      </>
                    )}
                    {u.is_superuser && <span className="adm-protected">Protected</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
