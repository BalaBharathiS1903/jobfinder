import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { COURSES } from "../lib/courses";
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
  const { user } = useAuth();

  const { data: resumes = [] } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get("/resume/").then(r => r.data),
  });

  const { data: allProgress = {} } = useQuery({
    queryKey: ["courses-progress"],
    queryFn: () => api.get("/courses/progress/").then(r => r.data),
  });

  const { data: customCourses = [] } = useQuery({
    queryKey: ["custom-courses"],
    queryFn: () => api.get("/courses/custom/").then(r => r.data),
  });

  const { data: accessData } = useQuery({
    queryKey: ["my-course-access"],
    queryFn: () => api.get("/courses/my-access/").then(r => r.data),
  });

  const approvedSet = new Set(accessData?.approved_courses || []);
  const isAdmin = user?.is_superuser;

  const progressCourses = Object.entries(allProgress || {})
    .map(([courseId, progress]) => {
      const builtIn = COURSES[courseId];
      const custom = customCourses.find(c => c.course_id === courseId);
      const course = builtIn || (custom ? {
        title: custom.title,
        icon: custom.icon,
        color: custom.color || "#2563EB",
        light: custom.light || "#EFF6FF",
        level: custom.level,
        duration: custom.duration,
        desc: custom.description,
        skills: custom.skills || [],
        modules: custom.modules || [],
      } : null);

      return {
        courseId,
        course,
        ...progress,
        title: course?.title || courseId,
        color: course?.color || "#2563EB",
        light: course?.light || "#EFF6FF",
        approved: isAdmin || approvedSet.has(courseId),
      };
    })
    .filter((p) => p.course && p.total > 0 && p.approved)
    .sort((a, b) => b.pct - a.pct);

  const currentCourse = progressCourses[0];
  const courseComplete = currentCourse && currentCourse.done === currentCourse.total;

  const resumeSkills = (resumes[0]?.skills || []).map(s => s.toLowerCase());
  const hasResume = resumes.length > 0;

  const getRecommendation = (courseId, skills) => {
    if (!skills?.length) return null;
    const missing = skills.filter(s => !resumeSkills.includes(s));
    const matched = skills.filter(s => resumeSkills.includes(s));
    const matchPct = Math.round((matched.length / skills.length) * 100);
    return { missing, matched, matchPct };
  };

  // All approved courses — sorted by resume match score (highest first)
  // Courses with no skills still show if approved
  const allApprovedCourses = [
    ...Object.entries(COURSES).map(([id, course]) => {
      const rec = getRecommendation(id, course.skills);
      return { id, course, rec, isCustom: false };
    }),
    ...customCourses
      .filter(c => !COURSES[c.course_id])
      .map(c => {
        const course = {
          title: c.title, icon: c.icon,
          color: c.color || "#2563EB", light: "#EFF6FF",
          level: c.level, duration: c.duration,
          desc: c.description, skills: c.skills || [],
          modules: c.modules || [],
        };
        return { id: c.course_id, course, rec: getRecommendation(c.course_id, c.skills || []), isCustom: true };
      }),
  ]
    .filter(({ id }) => isAdmin || approvedSet.has(id))
    .sort((a, b) => (b.rec?.matchPct ?? 0) - (a.rec?.matchPct ?? 0));

  const matchedCourses = allApprovedCourses;

  return (
    <div className="ph-page">

      {/* Hero */}
      <div className="ph-hero">
        <h1>Interview Prep Hub</h1>
        <p>Sharpen your skills — IQ tests, mock interviews, topic quizzes and learning paths with certificates.</p>
      </div>

      {/* Progress Summary */}
      {currentCourse ? (
        <div className="ph-progress-panel" style={{ borderColor: currentCourse.color }}>
          <div className="ph-progress-title">Continue your course</div>
          <div className="ph-progress-body">
            <div className="ph-progress-main" style={{ color: currentCourse.color }}>
              <div className="ph-progress-ring">
                <svg viewBox="0 0 64 64" width="80" height="80">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke={currentCourse.color} strokeWidth="5"
                    strokeDasharray={`${currentCourse.pct * 1.759} 175.9`} strokeLinecap="round"
                    transform="rotate(-90 32 32)" />
                </svg>
                <div className="ph-progress-ring-label">
                  <strong>{currentCourse.pct}%</strong>
                  <span>{currentCourse.done}/{currentCourse.total} lessons</span>
                </div>
              </div>
              <div className="ph-progress-details">
                <div className="ph-course-meta-row">
                  {currentCourse.course.level && <span className="ph-course-level">{currentCourse.course.level}</span>}
                  {currentCourse.course.duration && <span className="ph-course-duration">{currentCourse.course.duration}</span>}
                </div>
                <h2>{currentCourse.title}</h2>
                {courseComplete ? (
                  <div className="ph-progress-status">
                    <span className="ph-progress-pill">Course Complete</span>
                    <p>All {currentCourse.total} lessons are done.</p>
                  </div>
                ) : (
                  <p>{currentCourse.done} of {currentCourse.total} lessons completed.</p>
                )}
                <div className="ph-prog-bar">
                  <div className="ph-prog-fill" style={{ width: `${currentCourse.pct}%`, background: currentCourse.color }} />
                </div>
                <Link to={`/prep/course/${currentCourse.courseId}`} className="ph-btn-start" style={{ background: currentCourse.color }}>
                  {courseComplete ? "Review Course →" : "Continue Course →"}
                </Link>
              </div>
            </div>
          </div>

          {currentCourse.course.modules?.length > 0 && (
            <div className="ph-course-modules">
              {currentCourse.course.modules.map((module, mi) => {
                const moduleTotal = module.lessons?.length || 0;
                const moduleDone = (module.lessons || []).reduce((count, _, li) => {
                  return count + (currentCourse.completed?.[`${mi}-${li}`] ? 1 : 0);
                }, 0);

                return (
                  <div key={mi} className="ph-module-card">
                    <div className="ph-module-header">
                      <span className="ph-module-title">{module.title}</span>
                      <span className="ph-module-count">{moduleDone}/{moduleTotal} lessons</span>
                    </div>
                    <div className="ph-module-lessons">
                      {(module.lessons || []).map((lesson, li) => {
                        const completed = Boolean(currentCourse.completed?.[`${mi}-${li}`]);
                        return (
                          <span key={`${mi}-${li}`} className={`ph-lesson-pill ${completed ? "done" : ""}`}>
                            {lesson.title}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="ph-progress-panel ph-progress-empty">
          <div className="ph-progress-title">Course progress</div>
          <p>Start a course to see your progress and complete modules like Udemy/Coursera.</p>
        </div>
      )}

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

      {/* Approved Courses */}
      <div className="ph-section-label ph-section-label-row" style={{ marginTop: "2.5rem" }}>
        <span>APPROVED COURSES</span>
        <Link to="/prep/courses" className="ph-all-courses-btn">View All Courses →</Link>
      </div>

      {matchedCourses.length === 0 ? (
        <div className="ph-resume-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>No courses approved yet. Contact your admin to get access.</span>
        </div>
      ) : (
        <>
          {hasResume && (
            <p className="ph-section-sub">Courses sorted by resume skill match — approved by your admin.</p>
          )}
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

                {rec && rec.matched.length > 0 && (
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
                )}

                <div className="ph-course-actions">
                  <Link to={`/prep/course/${id}`} className="ph-btn-start" style={{ background: course.color }}>
                    Start Learning →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
