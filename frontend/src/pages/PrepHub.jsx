import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { COURSES } from "./LearningPath";
import api from "../lib/api";
import "./PrepHub.css";

const TOOLS = [
  { to: "/prep/iq",        icon: "🧠", title: "IQ Level Game",  desc: "25 timed questions — logical reasoning, patterns & math. Find out your IQ band.", badge: "Timed · 25 Qs",        color: "#7C3AED", light: "#F5F3FF" },
  { to: "/prep/interview", icon: "🎤", title: "Mock Interview",  desc: "Role-based interview questions. Read, think, reveal the answer, then rate yourself.", badge: "Self-paced · Any role", color: "#2563EB", light: "#EFF6FF" },
  { to: "/prep/test",      icon: "📝", title: "Skill Test",      desc: "MCQ test on your chosen topic. Timed, scored, and graded with a pass/fail result.", badge: "Timed · MCQ",           color: "#059669", light: "#ECFDF5" },
];

export default function PrepHub() {
  const { user } = useAuth();

  const { data: allProgress = {} } = useQuery({
    queryKey: ["courses-progress"],
    queryFn: () => api.get("/courses/progress/").then(r => r.data),
    enabled: !!user,
  });

  return (
    <div className="ph-page">

      {/* Hero */}
      <div className="ph-hero">
        <h1>Interview Prep Hub</h1>
        <p>Sharpen your skills before the big day — IQ tests, mock interviews, topic quizzes and full learning paths with certificates.</p>
      </div>

      {/* Practice Tools */}
      <div className="ph-section-label">PRACTICE TOOLS</div>
      <div className="ph-grid">
        {TOOLS.map(t => (
          <Link key={t.to} to={t.to} className="ph-card" style={{ "--card-color": t.color, "--card-light": t.light }}>
            <div className="ph-card-icon">{t.icon}</div>
            <div className="ph-card-body">
              <span className="ph-badge">{t.badge}</span>
              <h2>{t.title}</h2>
              <p>{t.desc}</p>
            </div>
            <span className="ph-arrow">→</span>
          </Link>
        ))}
      </div>

      {/* Learning Paths */}
      <div className="ph-section-label" style={{ marginTop: "2.5rem" }}>LEARNING PATHS</div>
      <p className="ph-section-sub">Complete a course, track your progress lesson by lesson, and earn a certificate.</p>
      <div className="ph-courses-grid">
        {Object.entries(COURSES).map(([id, course]) => {
          const p      = allProgress[id] || { done: 0, total: 0, pct: 0, certificate: null };
          const earned = !!p.certificate;

          return (
            <div key={id} className="ph-course-card" style={{ "--cc": course.color, "--cl": course.light }}>
              <div className="ph-course-top">
                <span className="ph-course-icon">{course.icon}</span>
                <div className="ph-course-badges">
                  <span className="ph-course-level">{course.level}</span>
                  <span className="ph-course-dur">{course.duration}</span>
                </div>
              </div>
              <h3>{course.title}</h3>
              <p>{course.desc}</p>
              <div className="ph-course-progress">
                <div className="ph-prog-bar">
                  <div className="ph-prog-fill" style={{ width: `${p.pct}%`, background: course.color }} />
                </div>
                <span>{p.pct}% · {p.done}/{p.total} lessons</span>
              </div>
              <div className="ph-course-actions">
                <Link to={`/prep/course/${id}`} className="ph-btn-start" style={{ background: course.color }}>
                  {p.done === 0 ? "Start Course" : p.done === p.total ? "Review Course" : "Continue →"}
                </Link>
                {earned && (
                  <Link to={`/prep/certificate/${id}`} className="ph-btn-cert">🎓 Certificate</Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
