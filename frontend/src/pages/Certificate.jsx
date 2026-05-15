import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COURSES } from "../lib/courses";
import api from "../lib/api";
import "./Certificate.css";

export default function Certificate() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const course = COURSES[courseId];

  const [cert, setCert]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!course) { setLoading(false); return; }
    Promise.all([
      api.get(`/courses/progress/${courseId}/`).then(r => setProgress(r.data)).catch(() => {}),
      api.get(`/courses/certificate/${courseId}/`).then(r => setCert(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [courseId, course]);

  if (!course) return <div className="cert-error">Course not found. <Link to="/prep">← Back</Link></div>;
  if (loading)  return <div className="cert-error">Loading…</div>;

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const doneCount    = Object.values(progress?.completed || {}).filter(Boolean).length;

  if (!cert) return (
    <div className="cert-locked">
      <div className="cert-locked-card">
        <span>🔒</span>
        <h2>Certificate Locked</h2>
        <p>Complete all <strong>{totalLessons}</strong> lessons in <strong>{course.title}</strong> to unlock your certificate.</p>
        <p className="cert-locked-prog">{doneCount} / {totalLessons} lessons completed</p>
        <Link to={`/prep/course/${courseId}`} className="cert-btn-back">Continue Learning →</Link>
      </div>
    </div>
  );

  return (
    <div className="cert-page">
      <div className="cert-actions no-print">
        <Link to={`/prep/course/${courseId}`} className="cert-action-link">← Back to Course</Link>
        <button className="cert-btn-print" onClick={() => window.print()}>🖨️ Download / Print</button>
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
