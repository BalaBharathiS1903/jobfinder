import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import "./LearningPath.css";

export const COURSES = {
  "python-basics": {
    title: "Python Basics", icon: "🐍", color: "#2563EB", light: "#EFF6FF",
    level: "Beginner", duration: "4 hrs",
    desc: "Variables, data types, loops, functions and OOP fundamentals.",
    modules: [
      {
        title: "Introduction to Python",
        lessons: [
          { title: "What is Python?",              duration: "5 min", type: "reading" },
          { title: "Installing Python & VS Code",  duration: "8 min", type: "setup"   },
          { title: "Your first Python script",     duration: "6 min", type: "coding"  },
          { title: "Variables & data types",       duration: "8 min", type: "coding"  },
        ],
      },
      {
        title: "Control Flow",
        lessons: [
          { title: "if / elif / else",   duration: "7 min", type: "coding"  },
          { title: "for loops",          duration: "6 min", type: "coding"  },
          { title: "while loops",        duration: "5 min", type: "coding"  },
          { title: "break & continue",   duration: "5 min", type: "coding"  },
        ],
      },
      {
        title: "Functions & Scope",
        lessons: [
          { title: "Defining functions",          duration: "7 min", type: "coding"  },
          { title: "Arguments & return values",   duration: "6 min", type: "coding"  },
          { title: "Lambda functions",            duration: "5 min", type: "coding"  },
          { title: "Scope & closures",            duration: "8 min", type: "reading" },
        ],
      },
      {
        title: "Data Structures",
        lessons: [
          { title: "Lists & tuples",        duration: "8 min", type: "coding"  },
          { title: "Dictionaries",          duration: "7 min", type: "coding"  },
          { title: "Sets",                  duration: "5 min", type: "coding"  },
          { title: "List comprehensions",   duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "OOP Fundamentals",
        lessons: [
          { title: "Classes & objects",   duration: "8 min", type: "coding"  },
          { title: "__init__ method",     duration: "6 min", type: "coding"  },
          { title: "Inheritance",         duration: "7 min", type: "coding"  },
          { title: "Encapsulation",       duration: "6 min", type: "reading" },
        ],
      },
    ],
  },
  "web-dev": {
    title: "Web Development", icon: "🌐", color: "#7C3AED", light: "#F5F3FF",
    level: "Intermediate", duration: "6 hrs",
    desc: "HTML, CSS, JavaScript and React — build modern web apps from scratch.",
    modules: [
      {
        title: "HTML Foundations",
        lessons: [
          { title: "Document structure",    duration: "6 min", type: "reading" },
          { title: "Semantic elements",     duration: "7 min", type: "coding"  },
          { title: "Forms & inputs",        duration: "8 min", type: "coding"  },
          { title: "Accessibility basics",  duration: "6 min", type: "reading" },
        ],
      },
      {
        title: "CSS Mastery",
        lessons: [
          { title: "Box model",          duration: "7 min", type: "coding"  },
          { title: "Flexbox",            duration: "9 min", type: "coding"  },
          { title: "CSS Grid",           duration: "9 min", type: "coding"  },
          { title: "Responsive design",  duration: "8 min", type: "coding"  },
        ],
      },
      {
        title: "JavaScript Core",
        lessons: [
          { title: "Variables & types",       duration: "7 min", type: "coding"  },
          { title: "DOM manipulation",        duration: "9 min", type: "coding"  },
          { title: "Events & listeners",      duration: "8 min", type: "coding"  },
          { title: "Fetch API & promises",    duration: "9 min", type: "coding"  },
        ],
      },
      {
        title: "React Essentials",
        lessons: [
          { title: "JSX & components",  duration: "8 min", type: "coding"  },
          { title: "Props & state",     duration: "9 min", type: "coding"  },
          { title: "useEffect hook",    duration: "8 min", type: "coding"  },
          { title: "React Router",      duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Project: Portfolio",
        lessons: [
          { title: "Planning the layout",     duration: "6 min", type: "reading" },
          { title: "Building components",     duration: "10 min", type: "coding" },
          { title: "Styling & animations",    duration: "9 min",  type: "coding" },
          { title: "Deploying to Vercel",     duration: "7 min",  type: "setup"  },
        ],
      },
    ],
  },
  "data-science": {
    title: "Data Science", icon: "📊", color: "#059669", light: "#ECFDF5",
    level: "Intermediate", duration: "5 hrs",
    desc: "NumPy, Pandas, data visualisation and intro to machine learning.",
    modules: [
      {
        title: "NumPy Essentials",
        lessons: [
          { title: "Arrays & operations",     duration: "8 min", type: "coding"  },
          { title: "Indexing & slicing",      duration: "7 min", type: "coding"  },
          { title: "Broadcasting",            duration: "6 min", type: "reading" },
          { title: "Linear algebra basics",   duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Pandas for Analysis",
        lessons: [
          { title: "DataFrames & Series",     duration: "9 min", type: "coding"  },
          { title: "Reading CSV/Excel",       duration: "6 min", type: "coding"  },
          { title: "Groupby & aggregation",   duration: "8 min", type: "coding"  },
          { title: "Handling missing data",   duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Data Visualisation",
        lessons: [
          { title: "Matplotlib basics",     duration: "8 min", type: "coding"  },
          { title: "Seaborn charts",        duration: "7 min", type: "coding"  },
          { title: "Plotly interactive",    duration: "8 min", type: "coding"  },
          { title: "Dashboard design",      duration: "6 min", type: "reading" },
        ],
      },
      {
        title: "Machine Learning Intro",
        lessons: [
          { title: "Supervised vs unsupervised",  duration: "7 min", type: "reading" },
          { title: "Linear regression",           duration: "9 min", type: "coding"  },
          { title: "Decision trees",              duration: "8 min", type: "coding"  },
          { title: "Model evaluation",            duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Capstone Project",
        lessons: [
          { title: "Dataset selection",     duration: "5 min", type: "reading" },
          { title: "EDA & cleaning",        duration: "10 min", type: "coding" },
          { title: "Model building",        duration: "10 min", type: "coding" },
          { title: "Presenting insights",   duration: "7 min",  type: "reading"},
        ],
      },
    ],
  },
  "django-rest": {
    title: "Django REST API", icon: "⚙️", color: "#D97706", light: "#FFFBEB",
    level: "Advanced", duration: "5 hrs",
    desc: "Build production-ready REST APIs with Django, DRF, JWT and PostgreSQL.",
    modules: [
      {
        title: "Django Foundations",
        lessons: [
          { title: "Project structure",     duration: "7 min", type: "reading" },
          { title: "Models & migrations",   duration: "9 min", type: "coding"  },
          { title: "Admin panel",           duration: "6 min", type: "coding"  },
          { title: "URL routing",           duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Django REST Framework",
        lessons: [
          { title: "Serializers",             duration: "9 min", type: "coding"  },
          { title: "APIView & ViewSets",      duration: "10 min", type: "coding" },
          { title: "Routers",                 duration: "6 min",  type: "coding" },
          { title: "Permissions & throttling",duration: "8 min",  type: "coding" },
        ],
      },
      {
        title: "Authentication",
        lessons: [
          { title: "Session vs token auth",   duration: "7 min", type: "reading" },
          { title: "JWT with SimpleJWT",      duration: "9 min", type: "coding"  },
          { title: "Refresh tokens",          duration: "7 min", type: "coding"  },
          { title: "Custom user model",       duration: "8 min", type: "coding"  },
        ],
      },
      {
        title: "Advanced Patterns",
        lessons: [
          { title: "Filtering & search",  duration: "8 min", type: "coding"  },
          { title: "Pagination",          duration: "6 min", type: "coding"  },
          { title: "File uploads",        duration: "7 min", type: "coding"  },
          { title: "Signal handlers",     duration: "7 min", type: "coding"  },
        ],
      },
      {
        title: "Deployment",
        lessons: [
          { title: "PostgreSQL setup",        duration: "8 min", type: "setup"   },
          { title: "Environment variables",   duration: "5 min", type: "setup"   },
          { title: "Gunicorn & Nginx",        duration: "8 min", type: "setup"   },
          { title: "Deploy to Railway",       duration: "9 min", type: "setup"   },
        ],
      },
    ],
  },
};

// Generate direct article URLs for each lesson
const getResourceLinks = (courseId, lessonTitle) => {
  const slug = lessonTitle.toLowerCase()
    .replace(/[&/]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const links = [];

  // GeeksforGeeks
  if (courseId === "python-basics") {
    links.push({ label: "📗 GeeksforGeeks", url: `https://www.geeksforgeeks.org/python/${slug}/`, color: "#2E7D32", bg: "#E7F3E8" });
  } else if (courseId === "web-dev") {
    if (lessonTitle.toLowerCase().includes("html") || lessonTitle.toLowerCase().includes("document") || lessonTitle.toLowerCase().includes("semantic") || lessonTitle.toLowerCase().includes("form") || lessonTitle.toLowerCase().includes("accessibility")) {
      links.push({ label: "📗 GeeksforGeeks", url: `https://www.geeksforgeeks.org/html/${slug}/`, color: "#2E7D32", bg: "#E7F3E8" });
    } else if (lessonTitle.toLowerCase().includes("css") || lessonTitle.toLowerCase().includes("box") || lessonTitle.toLowerCase().includes("flex") || lessonTitle.toLowerCase().includes("grid") || lessonTitle.toLowerCase().includes("responsive")) {
      links.push({ label: "📗 GeeksforGeeks", url: `https://www.geeksforgeeks.org/css/${slug}/`, color: "#2E7D32", bg: "#E7F3E8" });
    } else if (lessonTitle.toLowerCase().includes("react")) {
      links.push({ label: "📗 GeeksforGeeks", url: `https://www.geeksforgeeks.org/reactjs/${slug}/`, color: "#2E7D32", bg: "#E7F3E8" });
    } else {
      links.push({ label: "📗 GeeksforGeeks", url: `https://www.geeksforgeeks.org/javascript/${slug}/`, color: "#2E7D32", bg: "#E7F3E8" });
    }
  } else if (courseId === "data-science") {
    links.push({ label: "📗 GeeksforGeeks", url: `https://www.geeksforgeeks.org/python/${slug}/`, color: "#2E7D32", bg: "#E7F3E8" });
  } else if (courseId === "django-rest") {
    links.push({ label: "📗 GeeksforGeeks", url: `https://www.geeksforgeeks.org/django/${slug}/`, color: "#2E7D32", bg: "#E7F3E8" });
  }

  // MDN or W3Schools
  if (courseId === "web-dev") {
    links.push({ label: "🌐 MDN Web Docs", url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(lessonTitle)}`, color: "#1565C0", bg: "#E3F2FD" });
  } else {
    links.push({ label: "🌐 W3Schools", url: `https://www.w3schools.com/${courseId === "python-basics" || courseId === "data-science" ? "python" : courseId === "django-rest" ? "python" : "js"}/`, color: "#1565C0", bg: "#E3F2FD" });
  }

  // Official Docs
  if (courseId === "python-basics" || courseId === "data-science") {
    links.push({ label: "📘 Python Docs", url: `https://docs.python.org/3/search.html?q=${encodeURIComponent(lessonTitle)}`, color: "#E65100", bg: "#FFF3E0" });
  } else if (courseId === "django-rest") {
    links.push({ label: "📘 Django Docs", url: `https://docs.djangoproject.com/en/stable/search/?q=${encodeURIComponent(lessonTitle)}`, color: "#E65100", bg: "#FFF3E0" });
  } else if (courseId === "web-dev") {
    links.push({ label: "📘 React Docs", url: `https://react.dev/learn`, color: "#E65100", bg: "#FFF3E0" });
  }

  return links;
};
  reading: { label: "Reading", color: "#2563EB", bg: "#EFF6FF", icon: "📖" },
  coding:  { label: "Coding",  color: "#059669", bg: "#ECFDF5", icon: "💻" },
  setup:   { label: "Setup",   color: "#D97706", bg: "#FFFBEB", icon: "⚙️" },
};

export default function LearningPath() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const course = COURSES[courseId];

  const [completed, setCompleted] = useState({});
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null); // "mi-li"
  const [openModules, setOpenModules] = useState({ 0: true });

  // Load progress from backend
  useEffect(() => {
    if (!course) { setLoading(false); return; }
    api.get(`/courses/progress/${courseId}/`)
      .then(r => {
        setCompleted(r.data.completed || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get(`/courses/certificate/${courseId}/`)
      .then(r => setCertificate(r.data))
      .catch(() => {});
  }, [courseId, course]);

  // Save progress to backend
  const saveProgress = useCallback((newCompleted) => {
    api.post(`/courses/progress/${courseId}/`, { completed: newCompleted })
      .then(r => { if (r.data.certificate) setCertificate(r.data.certificate); })
      .catch(() => {});
  }, [courseId]);

  const toggle = (key) => {
    const next = { ...completed, [key]: !completed[key] };
    setCompleted(next);
    saveProgress(next);
  };

  const toggleModule = (mi) => setOpenModules(p => ({ ...p, [mi]: !p[mi] }));

  if (!course) return (
    <div className="lp-page">
      <p className="lp-not-found">Course not found. <Link to="/prep">← Back to Prep Hub</Link></p>
    </div>
  );

  if (loading) return <div className="lp-page"><p className="lp-loading">Loading course…</p></div>;

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const doneCount    = Object.values(completed).filter(Boolean).length;
  const pct          = Math.round((doneCount / totalLessons) * 100);
  const allDone      = doneCount === totalLessons;

  return (
    <div className="lp-page">
      <Link to="/prep" className="lp-back">← Back to Prep Hub</Link>

      {/* ── Course Header ── */}
      <div className="lp-header" style={{ "--lc": course.color, "--ll": course.light }}>
        <div className="lp-header-left">
          <span className="lp-icon">{course.icon}</span>
          <div>
            <div className="lp-meta">
              <span className="lp-level">{course.level}</span>
              <span className="lp-dur">⏱ {course.duration}</span>
              <span className="lp-dur">📚 {totalLessons} lessons</span>
              <span className="lp-dur">📦 {course.modules.length} modules</span>
            </div>
            <h1>{course.title}</h1>
            <p>{course.desc}</p>
          </div>
        </div>

        {/* Progress ring */}
        <div className="lp-progress-box">
          <div className="lp-ring-wrap">
            <svg viewBox="0 0 64 64" width="80" height="80">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="5" />
              <circle cx="32" cy="32" r="28" fill="none" stroke={course.color} strokeWidth="5"
                strokeDasharray={`${pct * 1.759} 175.9`} strokeLinecap="round"
                transform="rotate(-90 32 32)" style={{ transition: "stroke-dasharray 0.4s" }} />
            </svg>
            <div className="lp-ring-label">
              <strong style={{ color: course.color }}>{pct}%</strong>
              <span>{doneCount}/{totalLessons}</span>
            </div>
          </div>
          {allDone
            ? <Link to={`/prep/certificate/${courseId}`} className="lp-btn-cert" style={{ background: course.color }}>🎓 Get Certificate</Link>
            : <p className="lp-ring-hint">{totalLessons - doneCount} lessons left</p>
          }
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="lp-prog-bar-wrap">
        <div className="lp-prog-bar-track">
          <div className="lp-prog-bar-fill" style={{ width: `${pct}%`, background: course.color }} />
        </div>
        <span>{pct}% complete</span>
      </div>

      {/* ── Modules ── */}
      <div className="lp-modules">
        {course.modules.map((mod, mi) => {
          const modDone  = mod.lessons.filter((_, li) => completed[`${mi}-${li}`]).length;
          const modTotal = mod.lessons.length;
          const modPct   = Math.round((modDone / modTotal) * 100);
          const isOpen   = !!openModules[mi];

          return (
            <div key={mi} className={`lp-module ${isOpen ? "open" : ""}`}>
              {/* Module header — click to expand/collapse */}
              <div className="lp-module-header" onClick={() => toggleModule(mi)}>
                <div className="lp-module-left">
                  <span className="lp-module-num">Module {mi + 1}</span>
                  <h3>{mod.title}</h3>
                </div>
                <div className="lp-module-right">
                  <div className="lp-mod-prog-bar">
                    <div style={{ width: `${modPct}%`, background: course.color }} />
                  </div>
                  <span className="lp-module-count" style={{ color: modDone === modTotal ? course.color : "var(--muted)" }}>
                    {modDone === modTotal ? "✓" : `${modDone}/${modTotal}`}
                  </span>
                  <span className="lp-chevron">{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Lessons */}
              {isOpen && (
                <div className="lp-lessons">
                  {mod.lessons.map((lesson, li) => {
                    const key  = `${mi}-${li}`;
                    const done = !!completed[key];
                    const meta = TYPE_META[lesson.type] || TYPE_META.reading;
                    const isActive = activeLesson === key;

                    return (
                      <div key={li} className={`lp-lesson-wrap ${done ? "done" : ""} ${isActive ? "active" : ""}`}>
                        <div className="lp-lesson" onClick={() => setActiveLesson(isActive ? null : key)}>
                          <button
                            className="lp-check-btn"
                            style={{ borderColor: course.color, background: done ? course.color : "transparent" }}
                            onClick={e => { e.stopPropagation(); toggle(key); }}
                            title={done ? "Mark incomplete" : "Mark complete"}
                          >
                            {done && <span>✓</span>}
                          </button>
                          <div className="lp-lesson-info">
                            <span className="lp-lesson-title">{lesson.title}</span>
                            <div className="lp-lesson-meta">
                              <span className="lp-type-badge" style={{ color: meta.color, background: meta.bg }}>
                                {meta.icon} {meta.label}
                              </span>
                              <span className="lp-lesson-dur">⏱ {lesson.duration}</span>
                            </div>
                          </div>
                          <span className="lp-expand-icon">{isActive ? "▲" : "▼"}</span>
                        </div>

                        {/* Lesson content panel */}
                        {isActive && (
                          <div className="lp-lesson-content">
                            <p className="lp-content-note">
                              📌 This lesson covers <strong>{lesson.title}</strong> — part of the <em>{mod.title}</em> module.
                              Study the concept, practice the examples, then mark it complete.
                            </p>
                            <div className="lp-content-actions">
                              {getResourceLinks(courseId, lesson.title).map((link, idx) => (
                                <a key={idx} href={link.url} target="_blank" rel="noreferrer"
                                  className="lp-ref-btn"
                                  style={{ background: link.bg, color: link.color, border: `1px solid ${link.color}33` }}>
                                  {link.label}
                                </a>
                              ))}
                            </div>
                            {!done && (
                              <button
                                className="lp-mark-btn"
                                style={{ background: course.color }}
                                onClick={() => toggle(key)}
                              >
                                ✓ Mark as Complete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Completion banner ── */}
      {allDone && (
        <div className="lp-complete-banner" style={{ borderColor: course.color, background: course.light }}>
          <span>🎉</span>
          <div>
            <strong>Course Complete!</strong>
            <p>You've finished all {totalLessons} lessons. Claim your certificate now.</p>
          </div>
          <Link to={`/prep/certificate/${courseId}`} className="lp-btn-cert" style={{ background: course.color }}>
            Get Certificate →
          </Link>
        </div>
      )}
    </div>
  );
}
