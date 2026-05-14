import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import "./AdminCourses.css";

const COURSE_LIST = [
  { id: "python-basics",       label: "Python Basics",        icon: "🐍" },
  { id: "web-dev",             label: "Web Development",      icon: "🌐" },
  { id: "data-science",        label: "Data Science",         icon: "📊" },
  { id: "django-rest",         label: "Django REST API",      icon: "⚙️" },
  { id: "javascript-advanced", label: "JavaScript Advanced",  icon: "📰" },
  { id: "sql-databases",       label: "SQL & Databases",      icon: "🗄️" },
  { id: "git-devops",          label: "Git & DevOps",         icon: "🔧" },
  { id: "java-basics",         label: "Java Fundamentals",    icon: "☕" },
  { id: "typescript",          label: "TypeScript",           icon: "📘" },
  { id: "golang",              label: "Go (Golang)",          icon: "🐹" },
  { id: "rust-lang",           label: "Rust",                 icon: "⚙️" },
  { id: "kotlin",              label: "Kotlin",               icon: "🟣" },
  { id: "cpp",                 label: "C / C++",              icon: "🔧" },
  { id: "php",                 label: "PHP & Laravel",        icon: "🐘" },
  { id: "ruby",                label: "Ruby & Rails",         icon: "💎" },
  { id: "swift",               label: "Swift & iOS",          icon: "🍊" },
];

const LEVELS  = ["Beginner", "Intermediate", "Advanced"];
const COLORS  = ["#2563EB","#7C3AED","#059669","#D97706","#DC2626","#0891B2","#B45309","#CA8A04"];
const ICONS   = ["📚","🐍","🌐","📊","⚙️","📰","🗄️","🔧","☕","📘","🐹","🟣","🐘","💎","🍊","🦀","🎯","🚀","💡","🔬"];

function LearningPathModal({ course, onClose, onSaved, notify }) {
  const [tab, setTab] = useState("modules");
  const [modules, setModules] = useState(course.modules || []);
  const [ytPlaylist, setYtPlaylist] = useState(course.youtube_playlist || "");
  const [links, setLinks] = useState(
    course.resource_links?.length > 0
      ? course.resource_links
      : [
          { label: "GeeksforGeeks", url: "", color: "#2E7D32", bg: "#E7F3E8" },
          { label: "W3Schools",     url: "", color: "#1565C0", bg: "#E3F2FD" },
          { label: "Official Docs", url: "", color: "#E65100", bg: "#FFF3E0" },
        ]
  );
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const generateWithAI = async () => {
    setGenerating(true); setError("");
    try {
      const res = await api.post("/courses/custom/ai-generate/", {
        title: course.title, description: course.description,
        level: course.level, duration: course.duration, skills: course.skills,
      });
      setModules(res.data.modules || []);
      notify(`✓ AI generated ${res.data.modules.length} modules. YouTube search: "${res.data.youtube_search}"`);
    } catch (err) {
      setError(err.response?.data?.error || "AI generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    setSaving(true); setError("");
    try {
      let courseId = course.id;
      if (!courseId) {
        // Built-in course with no override yet — create it first
        const res = await api.post("/courses/custom/create/", {
          course_id: course.course_id,
          title: course.title,
          description: course.description || "",
          icon: course.icon,
          color: course.color || "#2563EB",
          level: course.level || "Beginner",
          duration: course.duration || "4 hrs",
          skills: course.skills || [],
        });
        courseId = res.data.id;
      }
      await api.patch(`/courses/custom/${courseId}/edit/`, {
        modules,
        youtube_playlist: ytPlaylist,
        resource_links: links.filter(l => l.label && l.url),
      });
      notify("✓ Learning path saved");
      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const updateLesson = (mi, li, field, value) =>
    setModules(prev => prev.map((mod, m) => m !== mi ? mod : {
      ...mod, lessons: mod.lessons.map((les, l) => l !== li ? les : { ...les, [field]: value })
    }));

  const updateModuleTitle = (mi, value) =>
    setModules(prev => prev.map((mod, m) => m !== mi ? mod : { ...mod, title: value }));

  const addLesson = (mi) =>
    setModules(prev => prev.map((mod, m) => m !== mi ? mod : {
      ...mod, lessons: [...mod.lessons, { title: "", duration: "8 min", type: "coding" }]
    }));

  const removeLesson = (mi, li) =>
    setModules(prev => prev.map((mod, m) => m !== mi ? mod : {
      ...mod, lessons: mod.lessons.filter((_, l) => l !== li)
    }));

  const addModule = () =>
    setModules(prev => [...prev, { title: "New Module", lessons: [{ title: "", duration: "8 min", type: "coding" }] }]);

  const removeModule = (mi) => setModules(prev => prev.filter((_, m) => m !== mi));

  const updateLink = (i, field, value) =>
    setLinks(prev => prev.map((l, idx) => idx !== i ? l : { ...l, [field]: value }));

  const addLink = () =>
    setLinks(prev => [...prev, { label: "", url: "", color: "#2563EB", bg: "#EFF6FF" }]);

  const removeLink = (i) => setLinks(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="ac2-modal-overlay" onClick={onClose}>
      <div className="ac2-modal ac2-lp-modal" onClick={e => e.stopPropagation()}>
        <div className="ac2-modal-header">
          <h3>📚 Edit Learning Path — {course.title}{!course.id ? " (Built-in Override)" : ""}</h3>
          <button className="ac2-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ac2-modal-body">
          {error && <div className="ac2-modal-error">{error}</div>}

          {/* Inner tabs */}
          <div className="ac2-lp-tabs">
            <button className={`ac2-lp-tab ${tab === "modules" ? "active" : ""}`} onClick={() => setTab("modules")}>📋 Modules & Lessons</button>
            <button className={`ac2-lp-tab ${tab === "links" ? "active" : ""}`} onClick={() => setTab("links")}>🔗 Resource Links</button>
          </div>

          {/* ── MODULES TAB ── */}
          {tab === "modules" && (
            <>
              <div className="ac2-field">
                <label>📺 YouTube Playlist ID <span style={{fontWeight:400,color:"var(--muted)"}}>( e.g. PL4cUxeGkcC9... )</span></label>
                <input value={ytPlaylist} onChange={e => setYtPlaylist(e.target.value)} placeholder="Paste YouTube playlist ID" />
              </div>
              <div className="ac2-lp-ai-row">
                <button className="ac2-btn ac2-btn-ai" onClick={generateWithAI} disabled={generating}>
                  {generating ? "⏳ Generating…" : "✨ Generate with Gemini AI"}
                </button>
                <span className="ac2-lp-ai-hint">Auto-creates modules & lessons based on course info</span>
              </div>
              <div className="ac2-lp-modules">
                {modules.length === 0 && <p className="ac2-lp-empty">No modules yet. Generate with AI or add manually.</p>}
                {modules.map((mod, mi) => (
                  <div key={mi} className="ac2-lp-module">
                    <div className="ac2-lp-module-header">
                      <input className="ac2-lp-mod-title" value={mod.title}
                        onChange={e => updateModuleTitle(mi, e.target.value)} placeholder="Module title" />
                      <button className="ac2-lp-remove-btn" onClick={() => removeModule(mi)}>✕</button>
                    </div>
                    {mod.lessons.map((les, li) => (
                      <div key={li} className="ac2-lp-lesson-row">
                        <input className="ac2-lp-les-title" value={les.title}
                          onChange={e => updateLesson(mi, li, "title", e.target.value)} placeholder="Lesson title" />
                        <input className="ac2-lp-les-dur" value={les.duration}
                          onChange={e => updateLesson(mi, li, "duration", e.target.value)} placeholder="8 min" />
                        <select className="ac2-lp-les-type" value={les.type}
                          onChange={e => updateLesson(mi, li, "type", e.target.value)}>
                          <option value="coding">Coding</option>
                          <option value="reading">Reading</option>
                          <option value="setup">Setup</option>
                        </select>
                        <button className="ac2-lp-remove-btn" onClick={() => removeLesson(mi, li)}>✕</button>
                      </div>
                    ))}
                    <button className="ac2-lp-add-lesson" onClick={() => addLesson(mi)}>+ Add Lesson</button>
                  </div>
                ))}
                <button className="ac2-lp-add-module" onClick={addModule}>+ Add Module</button>
              </div>
            </>
          )}

          {/* ── LINKS TAB ── */}
          {tab === "links" && (
            <div className="ac2-lp-links">
              <p className="ac2-lp-links-hint">
                These links appear inside every lesson panel. Students click them to open documentation, tutorials, or reference sites.
              </p>
              {links.map((link, i) => (
                <div key={i} className="ac2-lp-link-row">
                  <div className="ac2-lp-link-preview" style={{ background: link.bg, color: link.color, border: `1px solid ${link.color}44` }}>
                    {link.label || "Link"}
                  </div>
                  <input className="ac2-lp-link-label" value={link.label}
                    onChange={e => updateLink(i, "label", e.target.value)} placeholder="Label (e.g. GeeksforGeeks)" />
                  <input className="ac2-lp-link-url" value={link.url}
                    onChange={e => updateLink(i, "url", e.target.value)} placeholder="https://..." />
                  <input type="color" className="ac2-lp-link-color" value={link.color}
                    onChange={e => updateLink(i, "color", e.target.value)} title="Text color" />
                  <input type="color" className="ac2-lp-link-color" value={link.bg}
                    onChange={e => updateLink(i, "bg", e.target.value)} title="Background color" />
                  <button className="ac2-lp-remove-btn" onClick={() => removeLink(i)}>✕</button>
                </div>
              ))}
              <button className="ac2-lp-add-module" onClick={addLink}>+ Add Link</button>
            </div>
          )}

          <div className="ac2-modal-actions">
            <button className="ac2-btn ac2-btn-outline" onClick={onClose}>Cancel</button>
            <button className="ac2-btn ac2-btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "💾 Save Learning Path"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCourseModal({ onClose, onAdded, notify }) {
  const [form, setForm] = useState({
    title: "", description: "", icon: "📚", color: "#2563EB",
    level: "Beginner", duration: "4 hrs", skills: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setLoading(true); setError("");
    try {
      const res = await api.post("/courses/custom/create/", {
        ...form,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      onAdded(res.data);
      notify(`✓ "${res.data.title}" course added`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ac2-modal-overlay" onClick={onClose}>
      <div className="ac2-modal" onClick={e => e.stopPropagation()}>
        <div className="ac2-modal-header">
          <h3>Add New Course</h3>
          <button className="ac2-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="ac2-modal-body">
          {error && <div className="ac2-modal-error">{error}</div>}

          <div className="ac2-field">
            <label>Course Title *</label>
            <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. React Advanced" />
          </div>

          <div className="ac2-field">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="What will students learn?" />
          </div>

          <div className="ac2-field-row">
            <div className="ac2-field">
              <label>Level</label>
              <select value={form.level} onChange={e => setForm(f => ({...f, level: e.target.value}))}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="ac2-field">
              <label>Duration</label>
              <input value={form.duration} onChange={e => setForm(f => ({...f, duration: e.target.value}))} placeholder="4 hrs" />
            </div>
          </div>

          <div className="ac2-field">
            <label>Skills (comma separated)</label>
            <input value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))} placeholder="python, django, rest api" />
          </div>

          <div className="ac2-field-row">
            <div className="ac2-field">
              <label>Icon</label>
              <div className="ac2-icon-grid">
                {ICONS.map(ic => (
                  <button type="button" key={ic}
                    className={`ac2-icon-btn ${form.icon === ic ? "selected" : ""}`}
                    onClick={() => setForm(f => ({...f, icon: ic}))}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="ac2-field">
              <label>Color</label>
              <div className="ac2-color-grid">
                {COLORS.map(col => (
                  <button type="button" key={col}
                    className={`ac2-color-btn ${form.color === col ? "selected" : ""}`}
                    style={{ background: col }}
                    onClick={() => setForm(f => ({...f, color: col}))} />
                ))}
              </div>
              <div className="ac2-preview-badge" style={{ background: form.color }}>
                <span>{form.icon}</span> {form.title || "Preview"}
              </div>
            </div>
          </div>

          <div className="ac2-modal-actions">
            <button type="button" className="ac2-btn ac2-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="ac2-btn ac2-btn-primary" disabled={loading}>
              {loading ? "Adding…" : "+ Add Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditCourseModal({ course, onClose, onUpdated, notify, updateCourse }) {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description || "",
    icon: course.icon || "📚",
    color: course.color || "#2563EB",
    level: course.level || "Beginner",
    duration: course.duration || "4 hrs",
    skills: (course.skills || []).join(", "),
    course_link: course.course_link || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setLoading(true); setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        icon: form.icon,
        color: form.color,
        level: form.level,
        duration: form.duration,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        course_link: form.course_link,
      };

      if (course.id) {
        // Update existing custom course
        await updateCourse(course.id, payload);
        notify(`✓ "${form.title}" updated`);
      } else {
        // Create new custom course (possibly overriding a built-in one)
        const createPayload = { ...payload };
        if (course.course_id) {
          createPayload.course_id = course.course_id;
        }
        const res = await api.post("/courses/custom/create/", createPayload);
        notify(`✓ "${res.data.title}" course created`);
      }

      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ac2-modal-overlay" onClick={onClose}>
      <div className="ac2-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ac2-modal-header">
          <h3>{course.id ? "Edit Course" : "Customize Course"}</h3>
          <button className="ac2-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="ac2-modal-body">
          {error && <div className="ac2-modal-error">{error}</div>}

          <div className="ac2-field">
            <label>Course Title *</label>
            <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
          </div>

          <div className="ac2-field">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
          </div>

          <div className="ac2-field-row">
            <div className="ac2-field">
              <label>Level</label>
              <select value={form.level} onChange={e => setForm(f => ({...f, level: e.target.value}))}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="ac2-field">
              <label>Duration</label>
              <input value={form.duration} onChange={e => setForm(f => ({...f, duration: e.target.value}))} />
            </div>
          </div>

          <div className="ac2-field">
            <label>Skills (comma separated)</label>
            <input value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))} />
          </div>

          <div className="ac2-field">
            <label>Course Link <span style={{fontWeight:400,color:"var(--muted)"}}>( optional external URL )</span></label>
            <input type="url" value={form.course_link} onChange={e => setForm(f => ({...f, course_link: e.target.value}))} placeholder="https://..." />
          </div>

          <div className="ac2-field-row">
            <div className="ac2-field">
              <label>Icon</label>
              <div className="ac2-icon-grid">
                {ICONS.map(ic => (
                  <button type="button" key={ic}
                    className={`ac2-icon-btn ${form.icon === ic ? "selected" : ""}`}
                    onClick={() => setForm(f => ({...f, icon: ic}))}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="ac2-field">
              <label>Color</label>
              <div className="ac2-color-grid">
                {COLORS.map(col => (
                  <button type="button" key={col}
                    className={`ac2-color-btn ${form.color === col ? "selected" : ""}`}
                    style={{ background: col }}
                    onClick={() => setForm(f => ({...f, color: col}))} />
                ))}
              </div>
              <div className="ac2-preview-badge" style={{ background: form.color }}>
                <span>{form.icon}</span> {form.title || "Preview"}
              </div>
            </div>
          </div>

          <div className="ac2-modal-actions">
            <button type="button" className="ac2-btn ac2-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="ac2-btn ac2-btn-primary" disabled={loading}>
              {loading ? "Saving…" : course.id ? "Save Changes" : "Create Custom Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCourses() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [approving, setApproving] = useState(null);
  const [toast, setToast] = useState("");
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingLearningPath, setEditingLearningPath] = useState(null);
  const [activeTab, setActiveTab] = useState("access");

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/auth/admin/users/").then(r => r.data),
  });

  const { data: customCourses = [], refetch: refetchCustom } = useQuery({
    queryKey: ["custom-courses"],
    queryFn: () => api.get("/courses/custom/").then(r => r.data),
  });

  const { data: accessData, refetch: refetchAccess } = useQuery({
    queryKey: ["admin-course-access", selectedUser?.id],
    queryFn: () => api.get(`/courses/admin/${selectedUser.id}/access/`).then(r => r.data),
    enabled: !!selectedUser,
  });

  const openLPModal = (course) => {
    const existing = customCourses.find(cc => cc.course_id === course.id);
    if (existing) {
      setEditingLearningPath(existing);
    } else {
      setEditingLearningPath({
        id: null,
        course_id: course.id,
        title: course.label,
        description: "",
        icon: course.icon,
        color: "#2563EB",
        level: "Beginner",
        duration: "4 hrs",
        skills: [],
        modules: [],
        youtube_playlist: "",
        resource_links: [
          { label: "GeeksforGeeks", url: "", color: "#2E7D32", bg: "#E7F3E8" },
          { label: "W3Schools",     url: "", color: "#1565C0", bg: "#E3F2FD" },
          { label: "Official Docs", url: "", color: "#E65100", bg: "#FFF3E0" },
        ],
      });
    }
  };

  const approvedCourses = new Set(accessData?.approved_courses || []);

  const allCourses = [
    ...COURSE_LIST,
    ...customCourses.map(c => ({ id: c.course_id, label: c.title, icon: c.icon, custom: true, dbId: c.id })),
  ];

  const toggleCourse = async (courseId, grant) => {
    setApproving(courseId);
    await api.post(`/courses/admin/${selectedUser.id}/toggle/`, { course_id: courseId, grant });
    refetchAccess();
    notify(grant ? `✓ ${allCourses.find(c => c.id === courseId)?.label} approved` : "Revoked");
    setApproving(null);
  };

  const approveAll = async () => {
    setApproving("all");
    await api.post(`/courses/admin/${selectedUser.id}/approve-all/`);
    // also approve custom courses
    await Promise.all(customCourses.map(c =>
      api.post(`/courses/admin/${selectedUser.id}/toggle/`, { course_id: c.course_id, grant: true })
    ));
    refetchAccess();
    notify("✓ All courses approved");
    setApproving(null);
  };

  const revokeAll = async () => {
    setApproving("revoke-all");
    await Promise.all(
      allCourses.map(c => api.post(`/courses/admin/${selectedUser.id}/toggle/`, { course_id: c.id, grant: false }))
    );
    refetchAccess();
    notify("All courses revoked");
    setApproving(null);
  };

  const deleteCourse = async (dbId, title) => {
    if (!window.confirm(`Delete course "${title}"?`)) return;
    await api.delete(`/courses/custom/${dbId}/delete/`);
    refetchCustom();
    notify(`"${title}" deleted`);
  };

  const updateCourse = async (courseId, payload) => {
    await api.patch(`/courses/custom/${courseId}/edit/`, payload);
    refetchCustom();
    notify("Course updated successfully.");
  };

  const filtered = users.filter(u =>
    !u.is_superuser && (
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="ac2-page">
      {toast && <div className="ac2-toast">{toast}</div>}

      {showAddCourse && (
        <AddCourseModal
          onClose={() => setShowAddCourse(false)}
          onAdded={() => refetchCustom()}
          notify={notify}
        />
      )}
      {editingLearningPath && (
        <LearningPathModal
          course={editingLearningPath}
          onClose={() => setEditingLearningPath(null)}
          onSaved={() => { setEditingLearningPath(null); refetchCustom(); }}
          notify={notify}
        />
      )}
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onUpdated={() => { setEditingCourse(null); refetchCustom(); }}
          notify={notify}
          updateCourse={updateCourse}
        />
      )}

      {/* Header */}
      <div className="ac2-header">
        <Link to="/admin-dashboard" className="ac2-back">← Admin Dashboard</Link>
        <div className="ac2-header-row">
          <div className="ac2-header-title">
            <h1>Course Management</h1>
            <p>Approve course access for users · Add new courses to the platform</p>
          </div>
          <button className="ac2-add-btn" onClick={() => setShowAddCourse(true)}>
            + Add New Course
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="ac2-tabs">
        <button className={`ac2-tab ${activeTab === "access" ? "active" : ""}`} onClick={() => setActiveTab("access")}>
          👥 User Course Access
        </button>
        <button className={`ac2-tab ${activeTab === "courses" ? "active" : ""}`} onClick={() => setActiveTab("courses")}>
          📚 All Courses ({COURSE_LIST.length + customCourses.length})
        </button>
      </div>

      {/* Tab: User Access */}
      {activeTab === "access" && (
        <div className="ac2-layout">
          {/* Left — User List */}
          <div className="ac2-users-panel">
            <div className="ac2-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="ac2-search" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {isLoading ? (
              <div className="ac2-loading">Loading users…</div>
            ) : (
              <div className="ac2-user-list">
                {filtered.map(u => (
                  <button key={u.id} className={`ac2-user-item ${selectedUser?.id === u.id ? "active" : ""}`} onClick={() => setSelectedUser(u)}>
                    <div className="ac2-user-avatar">{u.username[0].toUpperCase()}</div>
                    <div className="ac2-user-info">
                      <span className="ac2-user-name">{u.username}</span>
                      <span className="ac2-user-email">{u.email}</span>
                    </div>
                    <span className={`ac2-prep-dot ${u.has_prep_access ? "dot-on" : "dot-off"}`} />
                  </button>
                ))}
                {filtered.length === 0 && <p className="ac2-empty">No users found.</p>}
              </div>
            )}
          </div>

          {/* Right — Course Access */}
          <div className="ac2-courses-panel">
            {!selectedUser ? (
              <div className="ac2-select-hint">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                <p>Select a user to manage their course access</p>
              </div>
            ) : (
              <>
                <div className="ac2-user-bar">
                  <div className="ac2-user-bar-avatar">{selectedUser.username[0].toUpperCase()}</div>
                  <div className="ac2-user-bar-info"><strong>{selectedUser.username}</strong><span>{selectedUser.email}</span></div>
                  <span className="ac2-approved-count">{approvedCourses.size} / {allCourses.length} approved</span>
                  <div className="ac2-bar-actions">
                    <button className="ac2-btn ac2-btn-success" onClick={approveAll} disabled={approving === "all"}>
                      {approving === "all" ? "Approving…" : "✓ Approve All"}
                    </button>
                    <button className="ac2-btn ac2-btn-danger" onClick={revokeAll} disabled={approving === "revoke-all"}>
                      {approving === "revoke-all" ? "Revoking…" : "✕ Revoke All"}
                    </button>
                  </div>
                </div>
                <div className="ac2-course-grid">
                  {allCourses.map(c => {
                    const approved = approvedCourses.has(c.id);
                    return (
                      <div key={c.id} className={`ac2-course-card ${approved ? "approved" : "locked"}`}>
                        <div className="ac2-course-top">
                          <span className="ac2-course-icon">{c.icon}</span>
                          <span className={`ac2-status-badge ${approved ? "badge-approved" : "badge-locked"}`}>
                            {approved ? "✓" : "🔒"}
                          </span>
                        </div>
                        <p className="ac2-course-name">{c.label}</p>
                        {c.custom && <span className="ac2-custom-tag">Custom</span>}
                        <button
                          className={`ac2-toggle-btn ${approved ? "toggle-revoke" : "toggle-approve"}`}
                          disabled={approving === c.id}
                          onClick={() => toggleCourse(c.id, !approved)}
                        >
                          {approving === c.id ? "…" : approved ? "Revoke" : "Approve"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab: All Courses */}
      {activeTab === "courses" && (
        <div className="ac2-all-courses">
          <div className="ac2-courses-section">
            <h3>Built-in Courses ({COURSE_LIST.length})</h3>
            <div className="ac2-course-list-grid">
              {COURSE_LIST.map(c => {
                const hasCustomOverride = customCourses.some(cc => cc.course_id === c.id);
                return (
                  <div key={c.id} className="ac2-course-list-card">
                    <span className="ac2-course-icon">{c.icon}</span>
                    <span className="ac2-course-list-name">
                      <span>{c.label}</span>
                      <span className="ac2-builtin-tag">{hasCustomOverride ? "Customized" : "Built-in"}</span>
                    </span>
                    <div className="ac2-course-actions">
                      <Link to={`/prep/course/${c.id}`} className="ac2-view-btn" title="View Learning Path">👁 View</Link>
                      <button className="ac2-lp-edit-btn" onClick={() => openLPModal(c)} title="Edit Links & YouTube">🔗 Links</button>
                      <button className="ac2-edit-btn" onClick={() => {
                        // If there's already a custom override, edit it
                        const existingCustom = customCourses.find(cc => cc.course_id === c.id);
                        if (existingCustom) {
                          setEditingCourse(existingCustom);
                        } else {
                          // Create a custom version of the built-in course
                          setEditingCourse({
                            id: null, // New course
                            course_id: c.id,
                            title: c.label,
                            description: "",
                            icon: c.icon,
                            color: "#2563EB",
                            level: "Beginner",
                            duration: "4 hrs",
                            skills: [],
                          });
                        }
                      }}>
                        ✎
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ac2-courses-section">
            <div className="ac2-section-header">
              <h3>Custom Courses ({customCourses.length})</h3>
              <button className="ac2-add-btn" onClick={() => setShowAddCourse(true)}>+ Add Course</button>
            </div>
            {customCourses.length === 0 ? (
              <div className="ac2-no-custom">
                <p>No custom courses yet.</p>
                <button className="ac2-btn ac2-btn-primary" onClick={() => setShowAddCourse(true)}>+ Add Your First Course</button>
              </div>
            ) : (
              <div className="ac2-course-list-grid">
                {customCourses.map(c => (
                  <div key={c.id} className="ac2-course-list-card ac2-custom-card">
                    <span className="ac2-course-icon" style={{ background: c.color }}>{c.icon}</span>
                    <div className="ac2-custom-info">
                      <span className="ac2-course-list-name">{c.title}</span>
                      <span className="ac2-course-list-meta">{c.level} · {c.duration}</span>
                      {c.skills?.length > 0 && (
                        <div className="ac2-custom-skills">
                          {c.skills.slice(0, 4).map(s => <span key={s} className="ac2-skill-tag">{s}</span>)}
                          {c.skills.length > 4 && <span className="ac2-skill-tag">+{c.skills.length - 4}</span>}
                        </div>
                      )}
                      <span className="ac2-custom-tag">Custom</span>
                    </div>
                    <div className="ac2-course-actions">
                      <Link to={`/prep/course/${c.course_id}`} className="ac2-view-btn" title="View Learning Path">👁 View</Link>
                      <button className="ac2-lp-edit-btn" onClick={() => setEditingLearningPath(c)} title="Edit Learning Path">📚 LP</button>
                      <button className="ac2-edit-btn" onClick={() => setEditingCourse(c)}>✎</button>
                      <button className="ac2-delete-btn" onClick={() => deleteCourse(c.id, c.title)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}