import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const FEATURES = [
  { icon: "📄", title: "Upload Resume", desc: "PDF, DOCX, or TXT — skills auto-extracted instantly", link: "/resumes" },
  { icon: "🔍", title: "Search Jobs", desc: "Real jobs from Adzuna ranked by relevance", link: "/search" },
  { icon: "🎯", title: "Skill Matching", desc: "Jobs scored 0–100% against your resume skills", link: "/search" },
  { icon: "🧑‍💼", title: "Candidate Profile", desc: "Auto-generated profile from your resume data", link: "/resumes" },
  { icon: "🚫", title: "Ghost Job Detection", desc: "AI flags fake & suspicious job postings", link: "/search" },
  { icon: "🔖", title: "Save Jobs", desc: "Bookmark verified jobs to review later", link: "/saved" },
];

const STEPS = [
  { num: "1", title: "Upload Resume", desc: "Upload your PDF, DOCX or TXT resume" },
  { num: "2", title: "View Profile", desc: "See your extracted skills, education & projects" },
  { num: "3", title: "Search & Match", desc: "Find jobs ranked by how well they match you" },
  { num: "4", title: "Apply Safely", desc: "Ghost detection filters out fake job postings" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">✨ AI-Powered Job Matching</div>
        <h1>Match Your Resume to the <span className="hero-highlight">Perfect Job</span></h1>
        <p>Upload your resume, auto-extract your skills, find real jobs ranked by relevance — with ghost job detection.</p>
        <div className="hero-actions">
          {user ? (
            <>
              <Link to="/resumes" className="btn-hero">My Resumes</Link>
              <Link to="/search" className="btn-hero btn-hero-outline">Search Jobs</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn-hero">Get Started Free</Link>
              <Link to="/login" className="btn-hero btn-hero-outline">Sign In</Link>
            </>
          )}
        </div>
        <div className="hero-stats">
          <div className="hstat"><strong>Adzuna API</strong><span>Real job data</span></div>
          <div className="hstat-div" />
          <div className="hstat"><strong>0–100%</strong><span>Match scoring</span></div>
          <div className="hstat-div" />
          <div className="hstat"><strong>Ghost Detection</strong><span>Fake job filter</span></div>
        </div>
      </div>

      {/* Features */}
      <div className="section">
        <h2 className="section-heading">Everything You Need</h2>
        <p className="section-sub">From resume parsing to ghost job detection — all in one place</p>
        <div className="features">
          {FEATURES.map((f) => (
            <Link to={f.link} key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="section how-section">
        <h2 className="section-heading">How It Works</h2>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.num} className="step">
              <div className="step-num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!user && (
        <div className="cta-section">
          <h2>Ready to find your perfect job?</h2>
          <p>Join thousands of job seekers using AI-powered resume matching</p>
          <Link to="/register" className="btn-hero">Get Started Free →</Link>
        </div>
      )}
    </div>
  );
}
