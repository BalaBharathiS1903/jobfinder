import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const FEATURES = [
  { icon: "📄", title: "Upload Resume",      desc: "PDF, DOCX, or TXT — skills auto-extracted instantly",   link: "/resumes",         accent: false },
  { icon: "🔍", title: "Search Jobs",         desc: "Real jobs from Adzuna API ranked by relevance",         link: "/search",          accent: true  },
  { icon: "🎯", title: "Skill Matching",      desc: "Every job scored 0–100% against your resume skills",    link: "/search",          accent: false },
  { icon: "📊", title: "Resume Analyzer",     desc: "Get a score and improvement tips for your resume",      link: "/resume-analyzer", accent: true  },
  { icon: "🏗️", title: "Resume Builder",      desc: "Build a professional resume using ready templates",     link: "/resume-builder",  accent: false },
  { icon: "🚫", title: "Ghost Job Detection", desc: "AI flags fake, suspicious & scam job postings",         link: "/search",          accent: true  },
  { icon: "🧑💼", title: "Candidate Profile", desc: "Auto-generated profile card from your resume data",     link: "/resumes",         accent: false },
  { icon: "🔖", title: "Save Jobs",           desc: "Bookmark verified jobs and apply when you're ready",    link: "/saved",           accent: true  },
];

const TIPS = [
  { icon: "📝", tip: "Tailor your resume keywords to match the job description for higher match scores." },
  { icon: "🎯", tip: "Use the Auto Match feature to instantly find jobs aligned with your skills." },
  { icon: "🚫", tip: "Always check the Trust Score — avoid jobs flagged as Suspicious or Fake." },
  { icon: "💾", tip: "Save shortlisted jobs and apply in batches to stay organized." },
  { icon: "🔄", tip: "Re-parse your resume after updating it to refresh your skill profile." },
  { icon: "📍", tip: "Try searching without a location to find remote opportunities worldwide." },
];

const STEPS = [
  { num: "01", title: "Upload Resume",  desc: "Upload your PDF, DOCX or TXT resume in seconds" },
  { num: "02", title: "View Profile",   desc: "See your extracted skills, education & projects" },
  { num: "03", title: "Search & Match", desc: "Find jobs ranked by how well they match you"    },
  { num: "04", title: "Apply Safely",   desc: "Ghost detection filters out fake job postings"  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-badge">✦ AI-Powered Job Matching</span>
          <h1>Find Jobs That <span className="hero-hl">Match Your Skills</span></h1>
          <p className="hero-sub">
            Upload your resume, auto-extract skills, and discover real jobs ranked by relevance —
            with built-in ghost job detection.
          </p>
          <div className="hero-btns">
            {user ? (
              <>
                <Link to="/resumes" className="btn-primary">My Resumes</Link>
                <Link to="/search"  className="btn-outline">Search Jobs →</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary">Get Started Free</Link>
                <Link to="/login"    className="btn-outline">Sign In →</Link>
              </>
            )}
          </div>
          <div className="hero-pills">
            <span className="pill">✅ Real Adzuna Jobs</span>
            <span className="pill">✅ 0–100% Match Score</span>
            <span className="pill">✅ Ghost Job Filter</span>
            <span className="pill">✅ Free to Use</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="feat-section">
        <div className="feat-inner">
          <div className="sect-label">FEATURES</div>
          <h2 className="sect-title">Everything You Need</h2>
          <p className="sect-sub">From resume parsing to ghost job detection — all in one place</p>
          <div className="feat-grid">
            {FEATURES.map((f) => (
              <Link to={f.link} key={f.title} className={`feat-card ${f.accent ? "feat-card--accent" : ""}`}>
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="feat-link">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tips for Job Seekers */}
      <section className="tips-section">
        <div className="feat-inner">
          <div className="sect-label">PRO TIPS</div>
          <h2 className="sect-title">Tips for Job Seekers</h2>
          <p className="sect-sub">Make the most of VDart Academy with these smart strategies</p>
          <div className="tips-grid">
            {TIPS.map((t, i) => (
              <div key={i} className="tip-card">
                <span className="tip-icon">{t.icon}</span>
                <p>{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="steps-section">
        <div className="feat-inner">
          <div className="sect-label">HOW IT WORKS</div>
          <h2 className="sect-title">Four Simple Steps</h2>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                {i < STEPS.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="cta-section">
          <div className="feat-inner cta-inner">
            <h2>Ready to land your perfect job?</h2>
            <p>Join job seekers using AI-powered resume matching with VDart Academy</p>
            <Link to="/register" className="btn-primary btn-lg">Get Started Free →</Link>
          </div>
        </section>
      )}

    </div>
  );
}
