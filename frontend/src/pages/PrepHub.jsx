import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { COURSES } from "./LearningPath";
import api from "../lib/api";
import "./PrepHub.css";

const TOOLS = [
  {
    to: "/prep/iq",
    svg: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14Z"/></svg>),
    title: "IQ Level Game",
    desc: "25 timed questions — logical reasoning, patterns & math. Discover your IQ band.",
    badge: "Timed · 25 Questions",
    color: "#7C3AED", light: "#F5F3FF",
  },
  {
    to: "/prep/interview",
    svg: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"/><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="10" r="3"/></svg>),
    title: "Mock Interview",
    desc: "Role-based MCQ interview. Pick the best answer, see the explanation, validate at the end.",
    badge: "MCQ · Any Role",
    color: "#2563EB", light: "#EFF6FF",
  },
  {
    to: "/prep/test",
    svg: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>),
    title: "Skill Test",
    desc: "10 shuffled MCQ questions per topic. Timed, scored and graded with pass/fail result.",
    badge: "Timed · MCQ",
    color: "#059669", light: "#ECFDF5",
  },
];

export default function PrepHub() {
  const { data: resumes = [] } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get("/resume/").then(r => r.data),
  });

  const { data: allProgress = {} } = useQuery({
    queryKey: ["courses-progress"],
    queryFn: () => api.get("/courses/progress/").then(r => r.data),
  });

  const resumeSkills = (resumes[0]?.skills || []).map(s => s.toLowerCase());
  const hasResume = resumes.length > 0;

  const getRecommendation = (courseId) => {
    const course = COURSES[courseId];
    if (!course.skills) return null;
    const missing = course.skills.filter(s => !resumeSkills.includes(s));
    const matched = course.skills.filter(s => resumeSkills.includes(s));
    const matchPct = course.skills.length
      ? Math.round((matched.length / course.skills.length) * 100)
      : 0;
    return { missing, matched, matchPct };
  };

  // Show only courses that match resume skills
  const matchedCourses = Object.entries(COURSES)
    .map(([id, course]) => ({ id, course, rec: getRecommendation(id) }))
    .filter(({ rec }) => rec && rec.matched.length > 0)
    .sort((a, b) => b.rec.matchPct - a.rec.matchPct);

  return (
    <div className="ph-page">

      {/* Hero */}
      <div className="ph-hero">
        <h1>Interview Prep Hub</h1>
        <p>Sharpen your skills — IQ tests, mock interviews, topic quizzes and learning paths with certificates.</p>
      </div>

      {/* Practice Tools */}
      <div className="ph-section-label">PRACTICE TOOLS</div>
      <div className="ph-grid">
        {TOOLS.map(t => (
          <Link key={t.to} to={t.to} className="ph-card" style={{ "--card-color": t.color, "--card-light": t.light }}>
            <div className="ph-card-icon" style={{ color: t.color }}>{t.svg}</div>
            <div className="ph-card-body">
              <span className="ph-badge">{t.badge}</span>
              <h2>{t.title}</h2>
              <p>{t.desc}</p>
            </div>
            <span className="ph-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </span>
          </Link>
        ))}
      </div>

      {/* Matched Courses */}
      <div className="ph-section-label ph-section-label-row" style={{ marginTop: "2.5rem" }}>
        <span>RECOMMENDED COURSES — BASED ON YOUR RESUME</span>
        <Link to="/prep/courses" className="ph-all-courses-btn">View All Courses →</Link>
      </div>

      {!hasResume ? (
        <div className="ph-resume-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>
            <Link to="/resumes">Upload your resume</Link> to see courses matched to your skills.
          </span>
        </div>
      ) : matchedCourses.length === 0 ? (
        <div className="ph-skills-covered" style={{ display: "inline-block", marginBottom: "1rem" }}>
          No courses match your resume skills yet. <Link to="/prep/courses">Browse all courses →</Link>
        </div>
      ) : (
        <>
          <p className="ph-section-sub">
            Courses ranked by skill match — learn topics relevant to your resume.
          </p>
          <div className="ph-courses-grid">
            {matchedCourses.map(({ id, course, rec }) => (
              <div key={id} className="ph-course-card ph-course-recommended"
                style={{ "--cc": course.color, "--cl": course.light }}>

                <div className="ph-course-top">
                  <div className="ph-course-icon-wrap" style={{ background: course.color }}>
                    <span className="ph-course-icon">{course.icon}</span>
                  </div>
                  <div className="ph-course-badges">
                    <span className="ph-course-level">{course.level}</span>
                    <span className="ph-course-dur">{course.duration}</span>
                  </div>
                </div>

                <h3>{course.title}</h3>
                <p>{course.desc}</p>

                <div className="ph-skill-gap">
                  <div className="ph-gap-bar-wrap">
                    <div className="ph-gap-bar">
                      <div className="ph-gap-fill" style={{ width: `${rec.matchPct}%`, background: course.color }} />
                    </div>
                    <span className="ph-gap-pct">{rec.matchPct}% match</span>
                  </div>
                  <div className="ph-missing-skills">
                    <span className="ph-missing-label">Matched skills:</span>
                    {rec.matched.slice(0, 4).map(s => (
                      <span key={s} className="ph-missing-tag">{s}</span>
                    ))}
                    {rec.matched.length > 4 && <span className="ph-missing-more">+{rec.matched.length - 4}</span>}
                  </div>
                </div>

                <div className="ph-course-actions">
                  {allProgress[id]?.approved !== false ? (
                    <Link to={`/prep/course/${id}`} className="ph-btn-start" style={{ background: course.color }}>
                      Start Learning →
                    </Link>
                  ) : (
                    <span className="ph-btn-locked">🔒 Not Approved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
