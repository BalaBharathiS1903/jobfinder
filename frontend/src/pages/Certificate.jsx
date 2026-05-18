import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COURSES } from "../lib/courses";
import api from "../lib/api";
import "./Certificate.css";

function countCompletedLessons(modules, completed) {
  return (modules || []).reduce((count, module, moduleIndex) => {
    return (
      count +
      (module.lessons || []).reduce((lessonCount, _lesson, lessonIndex) => {
        return lessonCount + (completed?.[`${moduleIndex}-${lessonIndex}`] ? 1 : 0);
      }, 0)
    );
  }, 0);
}

export default function Certificate() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const builtIn = COURSES[courseId];

  const [course, setCourse] = useState(builtIn || null);
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const r = await api.get(`/courses/custom/${courseId}/detail/`);
        const c = r.data;
        const courseData = {
          title: c.title,
          icon: c.icon,
          color: c.color || builtIn?.color || "#2563EB",
          light: builtIn?.light || "#EFF6FF",
          level: c.level,
          duration: c.duration,
          desc: c.description,
          skills: c.skills || [],
          modules: c.modules || [],
        };
        setCourse((prev) => (prev ? { ...prev, ...courseData } : courseData));
      } catch {
        if (!builtIn) setCourse(null);
      }
    };

    Promise.all([
      loadCourse(),
      api.get(`/courses/progress/${courseId}/`).then((r) => setProgress(r.data)).catch(() => {}),
      api.get(`/courses/certificate/${courseId}/`).then((r) => setCert(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [builtIn, courseId]);

  if (loading) return <div className="cert-error">Loading...</div>;
  if (!course) return <div className="cert-error">Course not found. <Link to="/prep">Back</Link></div>;

  const modules = course.modules || [];
  const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
  const doneCount = countCompletedLessons(modules, progress?.completed || {});

  if (!cert) {
    return (
      <div className="cert-locked">
        <div className="cert-locked-card">
          <span>Locked</span>
          <h2>Certificate Locked</h2>
          {totalLessons > 0 ? (
            <>
              <p>
                Complete all <strong>{totalLessons}</strong> lessons in <strong>{course.title}</strong> to unlock
                your certificate.
              </p>
              <p className="cert-locked-prog">
                {doneCount} / {totalLessons} lessons completed
              </p>
              <Link to={`/prep/course/${courseId}`} className="cert-btn-back">
                Continue Learning
              </Link>
            </>
          ) : (
            <>
              <p>This certificate is not available yet because the course does not have any lessons.</p>
              <Link to={`/prep/course/${courseId}`} className="cert-btn-back">
                Back to Course
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cert-page">
      <div className="cert-actions no-print">
        <Link to={`/prep/course/${courseId}`} className="cert-action-link">
          Back to Course
        </Link>
        <button className="cert-btn-print" onClick={() => window.print()}>
          Download / Print
        </button>
      </div>

      <div className="cert-wrap" id="certificate">
        <div className="cert-border">
          <div className="cert-inner">
            <div className="cert-top">
              <div className="cert-logo">VDart Academy</div>
              <p className="cert-presents">proudly presents this certificate of completion to</p>
            </div>

            <div className="cert-name">{user?.username || "Learner"}</div>

            <p className="cert-body">for successfully completing the course</p>

            <div className="cert-course" style={{ color: course.color }}>
              {course.icon} {course.title}
            </div>

            <p className="cert-detail">
              Level: <strong>{course.level}</strong> &nbsp;·&nbsp;
              Duration: <strong>{course.duration}</strong> &nbsp;·&nbsp;
              Lessons: <strong>{totalLessons}</strong>
            </p>

            <div className="cert-footer">
              <div className="cert-sig">
                <div className="cert-sig-line" />
                <span>VDart Academy</span>
                <small>Authorised Signatory</small>
              </div>
              <div className="cert-seal">
                <div className="cert-seal-ring" style={{ borderColor: course.color }}>
                  <span style={{ color: course.color }}>✦</span>
                </div>
              </div>
              <div className="cert-sig">
                <div className="cert-sig-line" />
                <span>{cert.completed_on}</span>
                <small>Date of Completion</small>
              </div>
            </div>

            <div className="cert-id">Certificate ID: {cert.cert_id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
