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

  const courseList = Object.entries(COURSES);

  // Group courses by category
  const categories = {
    "Programming Languages": ["python-basics", "javascript-advanced", "typescript", "java-basics", "golang", "rust-lang", "kotlin", "cpp", "php", "ruby", "swift"],
    "Web & Frameworks": ["web-dev", "django-rest"],
    "Data & Databases": ["data-science", "sql-databases"],
    "DevOps & Tools": ["git-devops"],
  };

  return (
    <div className="ac-page">
      <Link to="/prep" className="ac-back">← Back to Prep Hub</Link>

      <div className="ac-header">
        <h1>All Programming Languages & Frameworks</h1>
        <p>Master {courseList.length} comprehensive courses covering popular programming languages, web frameworks, databases, and development tools.</p>
      </div>

      {Object.entries(categories).map(([category, courseIds]) => (
        <div key={category}>
          <h2 className="ac-category-title">{category}</h2>
          <div className="ac-grid">
            {courseIds.map(id => {
              const course = COURSES[id];
              if (!course) return null;
              const p = allProgress[id] || { done: 0, total: 0, pct: 0, certificate: null };
              const earned = !!p.certificate;
              const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

              return (
                <div key={id} className="ac-card" style={{ "--cc": course.color, "--cl": course.light }}>
                  <div className="ac-card-header">
                    <div className="ac-icon-wrap" style={{ background: course.color }}>
                      <span className="ac-icon">{course.icon}</span>
                    </div>
                    <div className="ac-badges">
                      <span className="ac-level">{course.level}</span>
                      <span className="ac-dur">{course.duration}</span>
                    </div>
                  </div>

                  <h3>{course.title}</h3>
                  <p className="ac-desc">{course.desc}</p>

                  <div className="ac-meta">
                    <span>📚 {course.modules.length} modules</span>
                    <span>📝 {totalLessons} lessons</span>
                  </div>

                  {course.skills && course.skills.length > 0 && (
                    <div className="ac-skills">
                      <span className="ac-skills-label">You'll learn:</span>
                      <div className="ac-skills-tags">
                        {course.skills.slice(0, 5).map(s => (
                          <span key={s} className="ac-skill-tag">{s}</span>
                        ))}
                        {course.skills.length > 5 && (
                          <span className="ac-skill-more">+{course.skills.length - 5}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {p.pct > 0 && (
                    <div className="ac-progress">
                      <div className="ac-prog-bar">
                        <div className="ac-prog-fill" style={{ width: `${p.pct}%`, background: course.color }} />
                      </div>
                      <span className="ac-prog-text">{p.pct}% · {p.done}/{totalLessons} lessons</span>
                    </div>
                  )}

                  <div className="ac-actions">
                    <Link to={`/prep/course/${id}`} className="ac-btn-start" style={{ background: course.color }}>
                      {p.done === 0 ? "Start Course" : p.done === totalLessons ? "Review" : "Continue"}
                    </Link>
                    {earned && (
                      <Link to={`/prep/certificate/${id}`} className="ac-btn-cert">
                        Certificate
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
