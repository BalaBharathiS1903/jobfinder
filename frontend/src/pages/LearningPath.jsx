import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import "./LearningPath.css";
import { COURSES } from "../lib/courses";

// YouTube tutorial playlists for each course (best quality tutorials)
const YOUTUBE_PLAYLISTS = {
  "python-basics":       "PL-osiE80TeTskrapNbzXhwoFUiLCjGgY7",  // Corey Schafer Python
  "web-dev":             "PL4cUxeGkcC9ivBf_eKCPIAYXWzLlPAm6G",  // Net Ninja React
  "data-science":        "PLeo1K3hjS3us_ELKYSj_Fth2tIEkdKXvV",  // codebasics Data Science
  "django-rest":         "PL-51WBLyFTg2vW-_6XBoUpE7vpmoR3ztO",  // Dennis Ivy Django
  "javascript-advanced": "PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX",  // Traversy Media JS
  "sql-databases":       "PLxCzCOWd7aiHqU4HKL7-SITyuSIcD93id",  // Gate Smashers SQL
  "git-devops":          "PLeo1K3hjS3uu7CxAacxVndI4bSk_-pBKU",  // codebasics Git
  "java-basics":         "PLsyeobzWxl7pe_IiTfNyr55kwJPWbgxB5",  // Telusko Java
  "typescript":          "PLqq-6Pq4lTTanfgsbnFzfWUhhAz3tIezU",  // Academind TypeScript
  "golang":              "PL4cUxeGkcC9gC88BEo9czgyS72A3doDeM",  // Net Ninja Go
  "rust-lang":           "PLai5B987bZ9CoVR-QEIN9foz4QCJ0H2Y8",  // Let's Get Rusty
  "kotlin":              "PLlxmoA0rQ-LwgK1JsnMsakYNACYGa1cjR",  // Smartherd Kotlin
  "cpp":                 "PLBlnK6fEyqRh6isJ01MBnbNpV3ZsktSyS",  // Neso Academy C++
  "php":                 "PL0eyrZgxdwhwBToawjm9faF1ixePexft-",  // Dani Krossing PHP
  "ruby":                "PLillGF-Rfqbaf3GLBQ1-KV7s36naI-B7O",  // Traversy Media Ruby
  "swift":               "PLMRqhzcHGw1ZqzYnpIuQAn2rcjhOtbqGX",  // CodeWithChris Swift
};

const getResourceLinks = (courseId, lessonTitle) => {
  const slug = lessonTitle.toLowerCase()
    .replace(/[&/]/g, "-").replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const links = [];

  // GeeksforGeeks - corrected URLs
  const gfgTopics = {
    "python-basics": "python-programming-language",
    "data-science": "python-programming-language",
    "django-rest": "django-tutorial",
    "javascript-advanced": "javascript",
    "web-dev": "web-development",
    "sql-databases": "sql-tutorial",
    "git-devops": "git-tutorial",
    "java-basics": "java",
    "typescript": "typescript",
    "golang": "golang",
    "rust-lang": "rust",
    "kotlin": "kotlin",
    "cpp": "c-plus-plus",
    "php": "php",
    "ruby": "ruby-programming-language",
    "swift": "swift",
  };
  
  if (gfgTopics[courseId]) {
    links.push({ 
      label: "GeeksforGeeks", 
      url: `https://www.geeksforgeeks.org/${gfgTopics[courseId]}/`, 
      color: "#2E7D32", 
      bg: "#E7F3E8" 
    });
  }

  // W3Schools - corrected URLs
  const w3Topics = {
    "python-basics": "python",
    "javascript-advanced": "js",
    "web-dev": "html",
    "sql-databases": "sql",
    "java-basics": "java",
    "typescript": "typescript",
    "cpp": "cpp",
    "php": "php",
  };
  
  if (w3Topics[courseId]) {
    links.push({ 
      label: "W3Schools", 
      url: `https://www.w3schools.com/${w3Topics[courseId]}/`, 
      color: "#1565C0", 
      bg: "#E3F2FD" 
    });
  }

  // Official Docs
  const officialDocs = {
    "python-basics":       { label: "Python Docs",     url: "https://docs.python.org/3/tutorial/" },
    "data-science":        { label: "Pandas Docs",     url: "https://pandas.pydata.org/docs/" },
    "django-rest":         { label: "Django Docs",     url: "https://docs.djangoproject.com/" },
    "web-dev":             { label: "React Docs",      url: "https://react.dev/learn" },
    "javascript-advanced": { label: "MDN JavaScript",  url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    "sql-databases":       { label: "PostgreSQL Docs", url: "https://www.postgresql.org/docs/" },
    "git-devops":          { label: "Git Docs",        url: "https://git-scm.com/doc" },
    "java-basics":         { label: "Java Docs",       url: "https://docs.oracle.com/en/java/" },
    "typescript":          { label: "TypeScript Docs", url: "https://www.typescriptlang.org/docs/" },
    "golang":              { label: "Go Docs",         url: "https://go.dev/doc/" },
    "rust-lang":           { label: "Rust Book",       url: "https://doc.rust-lang.org/book/" },
    "kotlin":              { label: "Kotlin Docs",     url: "https://kotlinlang.org/docs/home.html" },
    "cpp":                 { label: "C++ Reference",   url: "https://en.cppreference.com/" },
    "php":                 { label: "PHP Docs",        url: "https://www.php.net/manual/en/" },
    "ruby":                { label: "Ruby Docs",       url: "https://ruby-doc.org/" },
    "swift":               { label: "Swift Docs",      url: "https://developer.apple.com/documentation/swift" },
  };
  
  if (officialDocs[courseId]) {
    links.push({ ...officialDocs[courseId], color: "#E65100", bg: "#FFF3E0" });
  }

  return links;
};

const TYPE_META = {
  reading: { label: "Reading", color: "#2563EB", bg: "#EFF6FF" },
  coding:  { label: "Coding",  color: "#059669", bg: "#ECFDF5" },
  setup:   { label: "Setup",   color: "#D97706", bg: "#FFFBEB" },
};
function LessonItem({ lesson, lessonKey, done, meta, isActive, courseColor, courseId, modTitle, dbLinks, showVideo, setShowVideo, youtube, onToggle, onExpand }) {

  return (
    <div className={`lp-lesson-wrap ${done ? "done" : ""} ${isActive ? "active" : ""}`}>
      <div className="lp-lesson" onClick={onExpand}>
        <button
          className="lp-check-btn"
          style={{ borderColor: courseColor, background: done ? courseColor : "transparent" }}
          onClick={e => { e.stopPropagation(); onToggle(lessonKey); }}
          title={done ? "Mark incomplete" : "Mark complete"}
        >
          {done && <span>✓</span>}
        </button>
        <div className="lp-lesson-info">
          <span className="lp-lesson-title">{lesson.title}</span>
          <div className="lp-lesson-meta">
            <span className="lp-type-badge" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
            <span className="lp-lesson-dur">{lesson.duration}</span>
            {done && <span className="lp-done-badge">✓ Completed</span>}
          </div>
        </div>
        <span className="lp-expand-icon">{isActive ? "▲" : "▼"}</span>
      </div>

      {isActive && (
        <div className="lp-lesson-content">
          <p className="lp-content-note">
            This lesson covers <strong>{lesson.title}</strong> — part of the <em>{modTitle}</em> module.
            Study the concept and practice the examples.
          </p>
          <div className="lp-content-actions">
            {(dbLinks || getResourceLinks(courseId, lesson.title)).map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noreferrer"
                className="lp-ref-btn"
                style={{ background: link.bg, color: link.color, border: `1px solid ${link.color}33` }}>
                {link.label}
              </a>
            ))}
            {youtube && (
              <button className="lp-ref-btn lp-youtube-btn" onClick={() => setShowVideo(!showVideo)}
                style={{ background: "#FEE2E2", color: "#DC2626", border: "1px solid #DC262633" }}>
                {showVideo ? "Hide Video" : "📺 Watch Tutorial"}
              </button>
            )}
          </div>
          {showVideo && youtube && (
            <div className="lp-video-container">
              <iframe width="100%" height="400"
                src={`https://www.youtube.com/embed/videoseries?list=${youtube}`}
                title="YouTube Tutorial" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            </div>
          )}
          {/* Task completion button */}
          <div className="lp-task-row">
            {done ? (
              <div className="lp-task-done">
                <span className="lp-task-check">✓</span>
                <span>Lesson completed</span>
                <button className="lp-task-undo" onClick={() => onToggle(lessonKey)}>Undo</button>
              </div>
            ) : (
              <button
                className="lp-task-complete-btn"
                style={{ background: courseColor }}
                onClick={() => onToggle(lessonKey)}
              >
                ✓ Mark as Complete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearningPath() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const builtIn = COURSES[courseId];

  const [course, setCourse] = useState(builtIn || null);
  const [completed, setCompleted] = useState({});
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [openModules, setOpenModules] = useState({ 0: true });
  const [showVideo, setShowVideo] = useState(false);
  const [dbLinks, setDbLinks] = useState(null); // null = use hardcoded

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const r = await api.get(`/courses/custom/${courseId}/detail/`);
        const c = r.data;
        if (!builtIn) {
          setCourse({
            title: c.title, icon: c.icon, color: c.color || "#2563EB",
            light: "#EFF6FF", level: c.level, duration: c.duration,
            desc: c.description, skills: c.skills, modules: c.modules || [],
            youtube_playlist: c.youtube_playlist || "",
          });
        } else {
          // Built-in course: apply DB overrides for links/youtube only
          if (c.youtube_playlist) {
            setCourse(prev => ({ ...prev, youtube_playlist: c.youtube_playlist }));
          }
        }
        if (c.resource_links?.length > 0) setDbLinks(c.resource_links);
      } catch {
        if (!builtIn) setCourse(null);
      }
    };

    const loadProgress = async () => {
      try {
        const r = await api.get(`/courses/progress/${courseId}/`);
        setCompleted(r.data.completed || {});
      } catch {}
    };

    const loadCert = async () => {
      try {
        const r = await api.get(`/courses/certificate/${courseId}/`);
        setCertificate(r.data);
      } catch {}
    };

    Promise.all([loadCourse(), loadProgress(), loadCert()])
      .finally(() => setLoading(false));
  }, [courseId, builtIn]);

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

  if (loading) return <div className="lp-page"><p className="lp-loading">Loading course…</p></div>;

  if (!course) return (
    <div className="lp-page">
      <Link to="/prep" className="lp-back">← Back to Prep Hub</Link>
      <p className="lp-not-found">Course not found. <Link to="/prep/courses">Browse all courses →</Link></p>
    </div>
  );

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
          <div className="lp-icon-box" style={{ background: course.color }}>
            <span className="lp-icon">{course.icon}</span>
          </div>
          <div>
            <div className="lp-meta">
              <span className="lp-level">{course.level}</span>
              <span className="lp-dur">{course.duration}</span>
              <span className="lp-dur">{totalLessons} lessons</span>
              <span className="lp-dur">{course.modules.length} modules</span>
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
            ? <Link to={`/prep/certificate/${courseId}`} className="lp-btn-cert" style={{ background: course.color }}>Get Certificate</Link>
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
                      <LessonItem
                        key={li}
                        lesson={lesson}
                        lessonKey={key}
                        done={done}
                        meta={meta}
                        isActive={isActive}
                        courseColor={course.color}
                        courseId={courseId}
                        modTitle={mod.title}
                        dbLinks={dbLinks}
                        showVideo={showVideo}
                        setShowVideo={setShowVideo}
                        youtube={course.youtube_playlist || YOUTUBE_PLAYLISTS[courseId]}
                        onToggle={toggle}
                        onExpand={() => setActiveLesson(isActive ? null : key)}
                      />
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
          <div className="lp-complete-icon" style={{ background: course.color }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
          </div>
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
