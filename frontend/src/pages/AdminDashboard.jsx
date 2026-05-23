import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
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
  edit:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>,
  close:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  upload:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
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

function BulkCreateModal({ onClose, onImported, notify }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await api.post("/auth/admin/users/bulk-create/", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      onImported(res.data.created || []);
      notify(`Imported ${res.data.created_count} user${res.data.created_count === 1 ? "" : "s"}.`);
    } catch (err) {
      notify(err.response?.data?.error || "Bulk import failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal adm-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <h2>Bulk Register Users</h2>
          <button className="adm-modal-close" onClick={onClose}>{Icon.close}</button>
        </div>
        <form onSubmit={handleSubmit} className="adm-create-form">
          <div className="adm-bulk-help">
            Upload `.xlsx` or `.csv` with columns: <strong>username</strong>, <strong>email</strong>, optional <strong>password</strong>, <strong>has_prep_access</strong>, <strong>resume_upload_limit</strong>, <strong>job_search_limit</strong>.
          </div>
          <div className="adm-field">
            <label>User details file</label>
            <input type="file" accept=".xlsx,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
          </div>
          <div className="adm-modal-actions">
            <button type="button" className="adm-btn btn-warn" onClick={onClose}>Close</button>
            <button type="submit" className="adm-btn btn-success" disabled={loading || !file}>
              {loading ? "Importing..." : "Import Users"}
            </button>
          </div>
        </form>

        {result && (
          <div className="adm-bulk-result">
            <div className="adm-bulk-summary">
              <span>{result.created_count} created</span>
              <span>{result.skipped_count} skipped</span>
            </div>
            {result.created?.length > 0 && (
              <div className="adm-bulk-section">
                <h3>Created Users</h3>
                <div className="adm-bulk-list">
                  {result.created.map((u) => (
                    <div key={u.id} className="adm-bulk-row">
                      <strong>{u.username}</strong>
                      <span>{u.email}</span>
                      {u.password && <code>Password: {u.password}</code>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.skipped?.length > 0 && (
              <div className="adm-bulk-section">
                <h3>Skipped Rows</h3>
                <div className="adm-bulk-list">
                  {result.skipped.map((s, i) => (
                    <div key={i} className="adm-bulk-row skipped">
                      <strong>Row {s.row}</strong>
                      <span>{s.email || "No email"} - {s.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "username", direction: "asc" });
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [showCreate, setShowCreate] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const selectAllRef = useRef(null);

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
      setSelectedIds((old) => old.filter((selectedId) => selectedId !== id));
      notify("User deleted.");
    },
    onError: (err) => notify(err.response?.data?.error || "Delete failed.", "error"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (userIds) => api.post("/auth/admin/users/bulk-delete/", { user_ids: userIds }).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["admin-users"], (old) =>
        old.filter((u) => !data.deleted_ids.includes(u.id))
      );
      setSelectedIds([]);
      const skippedNote = data.skipped_count ? ` ${data.skipped_count} skipped.` : "";
      notify(`${data.deleted_count} user${data.deleted_count === 1 ? "" : "s"} deleted.${skippedNote}`);
    },
    onError: (err) => notify(err.response?.data?.error || "Bulk delete failed.", "error"),
  });

  const handleLimitChange = (u, field, value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) updateMutation.mutate({ id: u.id, [field]: num });
  };

  const query = search.trim().toLowerCase();
  const filtered = users.filter((u) => {
    if (!query) return true;
    if (searchField === "username") return u.username.toLowerCase().includes(query);
    if (searchField === "email") return u.email.toLowerCase().includes(query);
    return (
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  });

  const getSortValue = (user, key) => {
    switch (key) {
      case "username":
        return user.username || "";
      case "email":
        return user.email || "";
      case "date_joined":
        return new Date(user.date_joined).getTime() || 0;
      case "status":
        return user.is_active ? "Active" : "Inactive";
      case "role":
        return user.is_superuser ? "Superadmin" : user.is_staff ? "Admin" : "User";
      case "has_prep_access":
        return user.has_prep_access ? "Granted" : "Revoked";
      case "resume_upload_limit":
        return Number(user.resume_upload_limit) || 0;
      case "job_search_limit":
        return Number(user.job_search_limit) || 0;
      default:
        return "";
    }
  };

  const sortedUsers = [...filtered].sort((a, b) => {
    const aValue = getSortValue(a, sortConfig.key);
    const bValue = getSortValue(b, sortConfig.key);

    let result = 0;
    if (typeof aValue === "number" && typeof bValue === "number") {
      result = aValue - bValue;
    } else {
      result = String(aValue).localeCompare(String(bValue), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    }

    return sortConfig.direction === "asc" ? result : -result;
  });

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortArrow = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const stats = [
    { label: "Total Users",  value: users.length,                              color: "#2563EB", icon: Icon.users },
    { label: "Active",       value: users.filter((u) => u.is_active).length,   color: "#059669", icon: Icon.check },
    { label: "Inactive",     value: users.filter((u) => !u.is_active).length,  color: "#DC2626", icon: Icon.cross },
    { label: "Prep Access",  value: users.filter((u) => u.has_prep_access).length, color: "#7C3AED", icon: Icon.book },
  ];

  const selectableVisibleIds = sortedUsers
    .filter((u) => !u.is_superuser)
    .map((u) => u.id);
  const selectedVisibleCount = selectableVisibleIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = selectableVisibleIds.length > 0 && selectedVisibleCount === selectableVisibleIds.length;
  const hasPartialVisibleSelection = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = hasPartialVisibleSelection;
    }
  }, [hasPartialVisibleSelection]);

  const toggleSelected = (userId) => {
    setSelectedIds((old) =>
      old.includes(userId) ? old.filter((id) => id !== userId) : [...old, userId]
    );
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((old) => {
      if (allVisibleSelected) {
        return old.filter((id) => !selectableVisibleIds.includes(id));
      }
      return [...new Set([...old, ...selectableVisibleIds])];
    });
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    const label = `${selectedIds.length} user${selectedIds.length === 1 ? "" : "s"}`;
    if (!window.confirm(`Delete ${label}? This action cannot be undone.`)) return;
    bulkDeleteMutation.mutate(selectedIds);
  };

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
      {showBulkCreate && (
        <BulkCreateModal
          onClose={() => setShowBulkCreate(false)}
          onImported={(created) => qc.setQueryData(["admin-users"], (old = []) => [...created, ...old])}
          notify={notify}
        />
      )}

      <div className="adm-header">
        <span className="adm-header-icon">{Icon.shield}</span>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users, permissions and limits</p>
        </div>
        <div className="adm-header-actions">
          <button className="adm-create-btn" onClick={() => setShowCreate(true)}>
            <span className="btn-icon">{Icon.plus}</span> Create User
          </button>
          <button className="adm-bulk-btn" onClick={() => setShowBulkCreate(true)}>
            <span className="btn-icon">{Icon.upload}</span> Bulk Register
          </button>
          <Link to="/admin-courses" className="adm-courses-btn">
            <span className="btn-icon">{Icon.book}</span> Manage Courses
          </Link>
        </div>
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
          <select
            className="adm-search-filter"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            aria-label="Filter search by field"
          >
            <option value="all">All</option>
            <option value="username">Username</option>
            <option value="email">Email</option>
          </select>
          <span className="adm-search-icon">{Icon.search}</span>
          <input
            className="adm-search"
            placeholder={
              searchField === "username"
                ? "Search by username"
                : searchField === "email"
                  ? "Search by email"
                  : "Search by username or email"
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="adm-count">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
        <div className="adm-bulk-actions">
          <span className={`adm-selection-count ${selectedIds.length ? "is-active" : ""}`}>
            {selectedIds.length} selected
          </span>
          <button
            type="button"
            className="adm-btn btn-primary"
            onClick={toggleSelectAllVisible}
            disabled={!selectableVisibleIds.length}
          >
            {allVisibleSelected ? "Unselect Visible" : "Select Visible"}
          </button>
          <button
            type="button"
            className="adm-btn btn-warn"
            onClick={clearSelection}
            disabled={!selectedIds.length}
          >
            Clear
          </button>
          <button
            type="button"
            className="adm-btn btn-danger"
            onClick={handleBulkDelete}
            disabled={!selectedIds.length || bulkDeleteMutation.isPending}
          >
            <span className="btn-icon">{Icon.trash}</span>
            {bulkDeleteMutation.isPending ? "Deleting..." : "Delete Selected"}
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="adm-selection-banner">
          <div className="adm-selection-copy">
            <strong>{selectedIds.length} user{selectedIds.length === 1 ? "" : "s"} selected</strong>
            <span>Bulk actions only affect selected non-superadmin accounts.</span>
          </div>
          <div className="adm-selection-actions">
            <button type="button" className="adm-btn btn-warn" onClick={clearSelection}>
              Clear Selection
            </button>
            <button
              type="button"
              className="adm-btn btn-danger"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              <span className="btn-icon">{Icon.trash}</span>
              {bulkDeleteMutation.isPending ? "Deleting..." : "Delete Selected"}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="adm-loading">Loading users...</div>
      ) : sortedUsers.length === 0 ? (
        <div className="adm-empty-state">
          <span className="adm-empty-icon">{Icon.users}</span>
          <h3>No users found</h3>
          <p>
            {query
              ? "Try a different username or email search, or clear the current filter."
              : "Users will appear here once accounts are created."}
          </p>
          {query && (
            <button
              type="button"
              className="adm-btn btn-primary"
              onClick={() => {
                setSearch("");
                setSearchField("all");
              }}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    className="adm-checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    disabled={!selectableVisibleIds.length}
                    aria-label="Select all visible users"
                  />
                </th>
                <th>#</th>
                <th>
                  <button type="button" className="adm-sort-btn" onClick={() => handleSort("username")}>
                    <span>User</span>
                    <span className="adm-sort-arrow">{getSortArrow("username")}</span>
                  </button>
                </th>
                <th>
                  <button type="button" className="adm-sort-btn" onClick={() => handleSort("email")}>
                    <span>Email</span>
                    <span className="adm-sort-arrow">{getSortArrow("email")}</span>
                  </button>
                </th>
                <th>
                  <button type="button" className="adm-sort-btn" onClick={() => handleSort("date_joined")}>
                    <span>Joined</span>
                    <span className="adm-sort-arrow">{getSortArrow("date_joined")}</span>
                  </button>
                </th>
                <th>
                  <button type="button" className="adm-sort-btn" onClick={() => handleSort("status")}>
                    <span>Status</span>
                    <span className="adm-sort-arrow">{getSortArrow("status")}</span>
                  </button>
                </th>
                <th>
                  <button type="button" className="adm-sort-btn" onClick={() => handleSort("role")}>
                    <span>Role</span>
                    <span className="adm-sort-arrow">{getSortArrow("role")}</span>
                  </button>
                </th>
                <th>
                  <button type="button" className="adm-sort-btn" onClick={() => handleSort("has_prep_access")}>
                    <span>Prep Hub</span>
                    <span className="adm-sort-arrow">{getSortArrow("has_prep_access")}</span>
                  </button>
                </th>
                <th>
                  <button type="button" className="adm-sort-btn" onClick={() => handleSort("resume_upload_limit")}>
                    <span>Resume Limit</span>
                    <span className="adm-sort-arrow">{getSortArrow("resume_upload_limit")}</span>
                  </button>
                </th>
                <th>
                  <button type="button" className="adm-sort-btn" onClick={() => handleSort("job_search_limit")}>
                    <span>Job Search Limit</span>
                    <span className="adm-sort-arrow">{getSortArrow("job_search_limit")}</span>
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((u, i) => (
                <tr
                  key={u.id}
                  className={[
                    !u.is_active ? "adm-row-inactive" : "",
                    selectedIds.includes(u.id) ? "adm-row-selected" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <td className="adm-select-cell">
                    {!u.is_superuser ? (
                      <input
                        type="checkbox"
                        className="adm-checkbox"
                        checked={selectedIds.includes(u.id)}
                        onChange={() => toggleSelected(u.id)}
                        aria-label={`Select ${u.username}`}
                      />
                    ) : (
                      <span className="adm-protected">—</span>
                    )}
                  </td>
                  <td className="adm-num">{i + 1}</td>
                  <td className="adm-name">
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
                      onClick={() => navigate(`/admin-dashboard/user/${u.id}`)}
                      title="View or edit user"
                    >
                      <span className="btn-icon">{Icon.edit}</span> View/Edit
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
