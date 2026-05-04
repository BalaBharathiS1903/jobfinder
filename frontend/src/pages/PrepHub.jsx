import { Link } from "react-router-dom";
import "./PrepHub.css";

const TOOLS = [
  {
    to: "/prep/iq",
    icon: "🧠",
    title: "IQ Level Game",
    desc: "25 timed questions — logical reasoning, patterns & math. Find out your IQ band.",
    badge: "Timed · 25 Qs",
    color: "#7C3AED",
    light: "#F5F3FF",
  },
  {
    to: "/prep/interview",
    icon: "🎤",
    title: "Mock Interview",
    desc: "Role-based interview questions. Read, think, reveal the answer, then rate yourself.",
    badge: "Self-paced · Any role",
    color: "#2563EB",
    light: "#EFF6FF",
  },
  {
    to: "/prep/test",
    icon: "📝",
    title: "Skill Test",
    desc: "MCQ test on your chosen topic. Timed, scored, and graded with a pass/fail result.",
    badge: "Timed · MCQ",
    color: "#059669",
    light: "#ECFDF5",
  },
];

export default function PrepHub() {
  return (
    <div className="ph-page">
      <div className="ph-hero">
        <h1>Interview Prep Hub</h1>
        <p>Sharpen your skills before the big day — IQ tests, mock interviews & topic quizzes all in one place.</p>
      </div>
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
    </div>
  );
}
