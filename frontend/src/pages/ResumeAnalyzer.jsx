import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { COURSES } from "./LearningPath";
import "./ResumeAnalyzer.css";

export default function ResumeAnalyzer() {
  const [selectedId, setSelectedId] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { data: resumes = [] } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get("/resume/").then(r => r.data),
  });

  const { data: accessData, isLoading: accessLoading } = useQuery({
    queryKey: ["my-course-access"],
    queryFn: () => api.get("/courses/my-access/").then(r => r.data).catch(() => ({ approved_courses: [] })),
  });

  const approvedSet = new Set(accessData?.approved_courses || []);
  const accessReady = !accessLoading && accessData !== undefined;

  const analyze = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const resume = resumes.find(r => r.id === parseInt(selectedId));
      if (resume) setAnalysis(buildAnalysis(resume));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ra-page">
      <div className="ra-header">
        <h1>Resume Analyzer</h1>
        <p>Get a detailed analysis of your resume with improvement suggestions</p>
      </div>

      {/* Select resume */}
      <div className="ra-card ra-select-card">
        <h3>Select Resume to Analyze</h3>
        <div className="ra-select-row">
          <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setAnalysis(null); }}>
            <option value="">Choose a resume…</option>
            {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}</option>)}
          </select>
          <button className="ra-btn-analyze" onClick={analyze} disabled={!selectedId || loading}>
            {loading ? "Analyzing…" : "Analyze Resume"}
          </button>
        </div>
        {resumes.length === 0 && (
          <p className="ra-no-resume">No resumes found. <Link to="/resumes">Upload a resume</Link> first.</p>
        )}
      </div>

      {analysis && (
        <>
          {/* Score */}
          <div className="ra-card ra-score-card">
            <div className="ra-score-circle" style={{ "--score": analysis.score }}>
              <span className="ra-score-num">{analysis.score}</span>
              <span className="ra-score-label">/ 100</span>
            </div>
            <div className="ra-score-info">
              <h2>Resume Score</h2>
              <p className="ra-score-grade" style={{ color: analysis.gradeColor }}>{analysis.grade}</p>
              <p>{analysis.summary}</p>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="ra-card ra-breakdown">
            <h3>Score Breakdown</h3>
            <div className="ra-breakdown-grid">
              {analysis.breakdown.map(b => (
                <div key={b.label} className="ra-breakdown-item">
                  <div className="ra-breakdown-header">
                    <span>{b.label}</span>
                    <span className="ra-breakdown-score">{b.score}/{b.max}</span>
                  </div>
                  <div className="ra-progress">
                    <div className="ra-progress-fill" style={{ width: `${(b.score / b.max) * 100}%`, background: b.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="ra-two-col">
            <div className="ra-card">
              <h3 className="ra-green">Strengths</h3>
              <ul className="ra-list">
                {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="ra-card">
              <h3 className="ra-red">Areas to Improve</h3>
              <ul className="ra-list ra-list-warn">
                {analysis.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          <div className="ra-card">
            <h3>Actionable Suggestions</h3>
            <div className="ra-suggestions">
              {analysis.suggestions.map((s, i) => (
                <div key={i} className="ra-suggestion">
                  <span className="ra-suggestion-num">{i + 1}</span>
                  <div>
                    <strong>{s.title}</strong>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills found */}
          <div className="ra-card">
            <h3>Detected Skills ({analysis.skills.length})</h3>
            <div className="ra-skills-wrap">
              {analysis.skills.map(s => <span key={s} className="ra-skill-tag">{s}</span>)}
            </div>
          </div>

          {/* Skill Gap Analysis */}
          {analysis.skillGaps && analysis.skillGaps.length > 0 && (
            <div className="ra-card">
              <h3 className="ra-red">Recommended Courses to Learn Missing Skills</h3>
              <p className="ra-gap-desc">
                Based on your resume analysis, here are courses we recommend to fill your skill gaps:
              </p>
              <div className="ra-gap-grid">
                {analysis.skillGaps.map((gap, i) => (
                  <div key={i} className="ra-gap-item">
                    <div className="ra-gap-header">
                      <span className="ra-gap-icon">{gap.icon}</span>
                      <strong>{gap.course}</strong>
                    </div>
                    <div className="ra-gap-skills">
                      {gap.missing.slice(0, 5).map(s => (
                        <span key={s} className="ra-gap-skill">{s}</span>
                      ))}
                      {gap.missing.length > 5 && <span className="ra-gap-more">+{gap.missing.length - 5} more</span>}
                    </div>
                    {!accessReady ? (
                      <div className="ra-gap-btn-loading">Checking access…</div>
                    ) : approvedSet.has(gap.courseId) ? (
                      <Link to={`/prep/course/${gap.courseId}`} className="ra-gap-btn" style={{ background: gap.color }}>
                        Start Learning →
                      </Link>
                    ) : (
                      <div className="ra-gap-locked">
                        🔒 Not Approved — <Link to="/prep/courses">Contact Admin</Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button className="ra-btn-prep" onClick={() => navigate("/prep")}>
                View All Courses in Prep Hub →
              </button>
            </div>
          )}

          {/* CTA */}
          <div className="ra-cta">
            <Link to="/resume-builder" className="ra-btn-primary">Build Better Resume</Link>
            <Link to="/search" className="ra-btn-outline">Search Matching Jobs</Link>
          </div>
        </>
      )}
    </div>
  );
}

function buildAnalysis(resume) {
  const skills = resume.skills || [];
  const keywords = resume.keywords || [];
  const titles = resume.job_titles || [];
  const hasEmail = !!resume.email;
  const hasPhone = !!resume.phone;
  const hasName  = !!resume.name;

  const contactScore  = ((hasName ? 10 : 0) + (hasEmail ? 10 : 0) + (hasPhone ? 5 : 0));
  const skillScore    = Math.min(25, skills.length * 2);
  const keywordScore  = Math.min(20, keywords.length);
  const titleScore    = Math.min(15, titles.length * 5);
  const contentScore  = Math.min(5, resume.raw_text?.length > 500 ? 5 : 2);
  const total = contactScore + skillScore + keywordScore + titleScore + contentScore;

  let grade, gradeColor, summary;
  if (total >= 80) { grade = "Excellent"; gradeColor = "#059669"; summary = "Your resume is strong and well-structured."; }
  else if (total >= 60) { grade = "Good"; gradeColor = "#2563EB"; summary = "Your resume is good but has room for improvement."; }
  else if (total >= 40) { grade = "Average"; gradeColor = "#D97706"; summary = "Your resume needs significant improvements."; }
  else { grade = "Needs Work"; gradeColor = "#DC2626"; summary = "Your resume is missing key information."; }

  const strengths = [];
  const improvements = [];

  if (hasName && hasEmail && hasPhone) strengths.push("Complete contact information provided");
  else improvements.push("Add complete contact details (name, email, phone)");

  if (skills.length >= 8) strengths.push(`Strong skill set with ${skills.length} skills detected`);
  else improvements.push(`Add more skills — only ${skills.length} detected (aim for 10+)`);

  if (titles.length > 0) strengths.push(`Job titles detected: ${titles.slice(0,2).join(", ")}`);
  else improvements.push("Add clear job titles or role descriptions");

  if (keywords.length >= 15) strengths.push("Good keyword density for ATS systems");
  else improvements.push("Increase keyword density for better ATS matching");

  if (resume.raw_text?.length > 1000) strengths.push("Resume has sufficient content length");
  else improvements.push("Resume content is too short — add more details");

  const suggestions = [
    { title: "Add a Professional Summary", desc: "A 3-4 line summary at the top increases recruiter engagement by 40%." },
    { title: "Quantify Achievements", desc: "Use numbers: 'Improved performance by 30%' instead of 'Improved performance'." },
    { title: "Use Action Verbs", desc: "Start bullet points with verbs like Developed, Led, Implemented, Optimized." },
    { title: "Tailor for Each Job", desc: "Customize your resume keywords to match each job description." },
    { title: "Add LinkedIn & GitHub", desc: "Include your LinkedIn and GitHub URLs to boost credibility." },
    { title: "Keep it to 1-2 Pages", desc: "Recruiters spend 6-7 seconds on a resume — keep it concise and relevant." },
  ];

  // Skill gap analysis
  const resumeSkills = skills.map(s => s.toLowerCase());
  const skillGaps = [];
  
  Object.entries(COURSES).forEach(([id, course]) => {
    if (!course.skills) return;
    const missing = course.skills.filter(s => !resumeSkills.includes(s.toLowerCase()));
    if (missing.length > 0) {
      skillGaps.push({
        courseId: id,
        course: course.title,
        icon: course.icon,
        color: course.color,
        missing,
        total: course.skills.length,
      });
    }
  });

  // Sort by most missing skills
  skillGaps.sort((a, b) => b.missing.length - a.missing.length);

  return {
    score: total,
    grade, gradeColor, summary,
    breakdown: [
      { label: "Contact Info",  score: contactScore,  max: 25, color: "#2563EB" },
      { label: "Skills",        score: skillScore,    max: 25, color: "#059669" },
      { label: "Keywords",      score: keywordScore,  max: 20, color: "#7C3AED" },
      { label: "Job Titles",    score: titleScore,    max: 15, color: "#D97706" },
      { label: "Content Depth", score: contentScore,  max: 5,  color: "#0891B2" },
    ],
    strengths,
    improvements,
    suggestions,
    skills,
    skillGaps: skillGaps.slice(0, 6), // Top 6 courses with missing skills
  };
}
