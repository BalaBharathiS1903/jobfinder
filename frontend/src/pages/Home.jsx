import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nodes = el.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    nodes.forEach(n => obs.observe(n));
    return () => obs.disconnect();
  }, []);
  return ref;
}

const FEATURES = [
  { icon: "📄", title: "Resume Upload & Parsing", desc: "Upload PDF, DOCX or TXT. Skills, education, projects and keywords auto-extracted instantly.", link: "/resumes",         accent: false },
  { icon: "🔍", title: "Job Search & Matching",   desc: "Real Adzuna jobs scored 0–100% against your skills with built-in ghost job detection.",      link: "/search",          accent: true  },
  { icon: "📊", title: "Resume Analyzer",         desc: "Instant score, section-by-section feedback and actionable improvement tips.",                link: "/resume-analyzer", accent: false },
  { icon: "🏗️", title: "Resume Builder",          desc: "ATS-friendly templates. Import from your profile and download as PDF.",                      link: "/resume-builder",  accent: true  },
  { icon: "🧑💼", title: "Professional Profile",  desc: "Build your career profile with skills, experience, certifications and social links.",         link: "/my-profile",      accent: false },
  { icon: "🔖", title: "Saved Jobs",              desc: "Bookmark verified jobs and revisit them anytime from your saved jobs dashboard.",              link: "/saved",           accent: true  },
];

const STEPS = [
  { num: "01", icon: "📄", title: "Upload Resume",   desc: "Drop your PDF, DOCX or TXT resume — skills extracted in seconds" },
  { num: "02", icon: "🧑💼", title: "Build Profile", desc: "Add experience, skills, certifications and social links" },
  { num: "03", icon: "🔍", title: "Match & Search",  desc: "Find jobs ranked by how well they match your exact skill set" },
  { num: "04", icon: "🧠", title: "Prep & Apply",    desc: "Sharpen skills with IQ tests and mock interviews, then apply safely" },
];

const STATS = [
  { num: "12+",  label: "App Features"  },
  { num: "100%", label: "Match Scoring" },
  { num: "5",    label: "Prep Topics"   },
  { num: "Free", label: "Always Free"   },
];

const TIPS = [
  { icon: "📝", tip: "Tailor your resume keywords to match the job description for higher match scores." },
  { icon: "🎯", tip: "Use Auto Match on your profile to find jobs without uploading a resume every time." },
  { icon: "🚫", tip: "Always check the Trust Score — avoid jobs flagged as Suspicious or Fake." },
  { icon: "🧠", tip: "Practice the IQ Game and Mock Interview before your actual interview day." },
  { icon: "🏗️", tip: "Use the ATS-friendly Resume Builder to pass automated screening systems." },
  { icon: "🔄", tip: "Re-parse your resume after updating it to refresh your skill profile." },
];

export default function Home() {
  const { user } = useAuth();
  const pageRef = useReveal();

  return (
    <div className="home" ref={pageRef}>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-badge hero-anim-1">✦ AI-Powered Career Platform</span>
          <h1 className="hero-anim-2">Your Complete <span className="hero-hl">Career Toolkit</span></h1>
          <p className="hero-sub hero-anim-3">
            Resume parsing · Job matching · Ghost job detection · ATS resume builder ·
            IQ tests · Mock interviews — everything in one place.
          </p>
          {user && (
            <div className="hero-btns hero-anim-4">
              <Link to="/resumes" className="btn-primary">My Resumes</Link>
              <Link to="/prep"    className="btn-outline">Prep Hub →</Link>
            </div>
          )}
          <div className="hero-pills hero-anim-5">
            <span className="pill">✅ Real Adzuna Jobs</span>
            <span className="pill">✅ 0–100% Match Score</span>
            <span className="pill">✅ Ghost Job Filter</span>
            <span className="pill">✅ IQ &amp; Interview Prep</span>
            <span className="pill">✅ Free to Use</span>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="stats-bar">
        {STATS.map(s => (
          <div key={s.label} className="stat-item">
            <strong>{s.num}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="feat-section">
        <div className="feat-inner">
          <div className="sect-label reveal">FEATURES</div>
          <h2 className="sect-title reveal">Everything You Need</h2>
          <p className="sect-sub reveal">From resume parsing to interview prep — all in one platform</p>
          <div className="feat-grid">
            {FEATURES.map((f, i) => (
              <Link to={f.link} key={f.title}
                className={`feat-card reveal ${f.accent ? "feat-card--accent" : ""}`}
                style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="feat-link">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="steps-section">
        <div className="feat-inner">
          <div className="sect-label reveal">HOW IT WORKS</div>
          <h2 className="sect-title reveal">Four Simple Steps</h2>
          <p className="sect-sub reveal">From zero to job-ready in minutes</p>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={s.num} className="step-card reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="step-icon">{s.icon}</div>
                <div className="step-num">{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                {i < STEPS.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tips ── */}
      <section className="tips-section">
        <div className="feat-inner">
          <div className="sect-label reveal">PRO TIPS</div>
          <h2 className="sect-title reveal">Tips for Job Seekers</h2>
          <p className="sect-sub reveal">Make the most of VDart Academy with these smart strategies</p>
          <div className="tips-grid">
            {TIPS.map((t, i) => (
              <div key={i} className="tip-card reveal" style={{ animationDelay: `${i * 0.07}s` }}>
                <span className="tip-icon">{t.icon}</span>
                <p>{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
