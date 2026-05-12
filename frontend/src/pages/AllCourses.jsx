import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { COURSES } from "./LearningPath";
import api from "../lib/api";
import "./AllCourses.css";

export default function AllCourses() {
  const { user } = useAuth();

  const { data: allProgress = {} } = useQuery({
    queryKey: ["courses-progress"],
    queryFn: () => api.get("/courses/progress/").then(r => r.data),
    enabled: !!user,
  });

  const { data: customCourses = [] } = useQuery({
    queryKey: ["custom-courses"],
    queryFn: () => api.get("/courses/custom/").then(r => r.data),
    enabled: !!user,
  });

  const { data: accessData } = useQuery({
    queryKey: ["my-course-access"],
    queryFn: () => api.get("/courses/my-access/").then(r => r.data),
    enabled: !!user,
  });

  const approvedSet = new Set(accessData?.approved_courses || []);
  const isAdmin = user?.is_superuser;

  // Merge built-in + custom courses into one list
  const builtInList = Object.entries(COURSES).map(([id, course]) => ({
    id,
    title: course.title,
    icon: course.icon,
    color: course.color,
    light: course.light,
    level: course.level,
    duration: course.duration,
    desc: course.desc,
    skills: course.skills,
    modules: course.modules,
    isCustom: false,
  }));

  const customList = customCourses
    .filter(c => !COURSES[c.course_id]) // exclude overrides of built-ins
    .map(c => ({
      id: c.course_id,
      title: c.title,
      icon: c.icon,
      color: c.color || "#2563EB",
      light: "#EFF6FF",
      level: c.level,
      duration: c.duration,
      desc: c.description,
      skills: c.skills || [],
      modules: c.modules || [],
      isCustom: true,
    }));

  const allCourses = [...builtInList, ...customList];

  // Group built-in by category, custom courses in their own section
  const categories = {
    "Programming Languages": ["python-basics", "javascript-advanced", "typescript", "java-basics", "golang", "rust-lang", "kotlin", "cpp", "php", "ruby", "swift"],
    "Web & Frameworks": ["web-dev", "django-rest"],
    "Data & Databases": ["data-science", "sql-databases"],
    "DevOps & Tools": ["git-devops"],
  };

  const renderCard = (c) => {
    const p = allProgress[c.id] || { done: 0, total: 0, pct: 0, certificate: null };
    const approved = isAdmin || approvedSet.has(c.id);
    const totalLessons = c.modules.reduce((s, m) => s + (m.lessons?.length || 0), 0);
    const earned = !!p.certificate;

    return (
      <div key={c.id} className={`ac-card ${!approved ? "ac-card-locked" : ""}`} style={{ "--cc": c.color, "--cl": c.light }}>
        <div className="ac-card-header">
          <div className="ac-icon-wrap" style={{ background: c.color }}>
            <span className="ac-icon">{c.icon}</span>
          </div>
          <div className="ac-badges">
            <span className="ac-level">{c.level}</span>
            <span className="ac-dur">{c.duration}</span>
            {p.pct === 100 && <span className="ac-complete-tag">Completed</span>}
            {c.isCustom && <span className="ac-custom-tag">Custom</span>}
          </div>
        </div>

        <h3>{c.title}</h3>
        <p className="ac-desc">{c.desc}</p>

        <div className="ac-meta">
          <span>📚 {c.modules.length} modules</span>
          <span>📝 {totalLessons} lessons</span>
        </div>

        {c.skills?.length > 0 && (
          <div className="ac-skills">
            <span className="ac-skills-label">You'll learn:</span>
            <div className="ac-skills-tags">
              {c.skills.slice(0, 5).map(s => <span key={s} className="ac-skill-tag">{s}</span>)}
              {c.skills.length > 5 && <span className="ac-skill-more">+{c.skills.length - 5}</span>}
            </div>
          </div>
        )}

        {p.pct > 0 && (
          <div className="ac-progress">
            <div className="ac-prog-bar">
              <div className="ac-prog-fill" style={{ width: `${p.pct}%`, background: c.color }} />
            </div>
            <span className="ac-prog-text">{p.pct}% · {p.done}/{totalLessons} lessons</span>
          </div>
        )}

        <div className="ac-actions">
          {approved ? (
            <Link to={`/prep/course/${c.id}`} className="ac-btn-start" style={{ background: c.color }}>
              {p.done === 0 ? "Start Course" : p.done === totalLessons ? "Review" : "Continue"}
            </Link>
          ) : (
            <span className="ac-btn-locked">🔒 Not Approved</span>
          )}
          {earned && <Link to={`/prep/certificate/${c.id}`} className="ac-btn-cert">Certificate</Link>}
        </div>
      </div>
    );
  };

  return (
    <div className="ac-page">
      <Link to="/prep" className="ac-back">← Back to Prep Hub</Link>

      <div className="ac-header">
        <h1>All Courses</h1>
        <p>Browse {allCourses.length} courses — start any approved course to begin tracking your progress.</p>
      </div>

      {Object.entries(categories).map(([category, courseIds]) => (
        <div key={category}>
          <h2 className="ac-category-title">{category}</h2>
          <div className="ac-grid">
            {courseIds.map(id => {
              const c = allCourses.find(x => x.id === id);
              return c ? renderCard(c) : null;
            })}
          </div>
        </div>
      ))}

      {customList.length > 0 && (
        <div>
          <h2 className="ac-category-title">Custom Courses</h2>
          <div className="ac-grid">
            {customList.map(c => renderCard(c))}
          </div>
        </div>
      )}
    </div>
  );
}
