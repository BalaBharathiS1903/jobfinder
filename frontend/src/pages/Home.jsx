import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const FEATURES = [
  { icon: "📄", title: "Resume Upload & Parsing",  desc: "Upload PDF, DOCX or TXT. Skills, education, projects and keywords auto-extracted instantly.",  link: "/resumes",          accent: false },
  { icon: "🔍", title: "Smart Job Search",          desc: "Real jobs from Adzuna API. Search by role, location and country — updated daily.",              link: "/search",           accent: true  },
  { icon: "🎯", title: "Skill Match Scoring",       desc: "Every job scored 0–100% against your resume skills so you apply to the right roles first.",     link: "/search",           accent: false },
  { icon: "📊", title: "Resume Analyzer",           desc: "Get an instant score, section-by-section feedback and actionable improvement tips.",             link: "/resume-analyzer",  accent: true  },
  { icon: "🏗️", title: "Resume Builder",            desc: "ATS-friendly templates. Fill details or import from your profile and download as PDF.",          link: "/resume-builder",   accent: false },
  { icon: "🧑💼", title: "Professional Profile",   desc: "Build a rich career profile with skills, experience, certifications and social links.",           link: "/my-profile",       accent: true  },
  { icon: "🚫", title: "Ghost Job Detection",       desc: "AI trust scoring flags fake, suspicious and scam postings before you waste time applying.",       link: "/search",           accent: false },
  { icon: "🔖", title: "Save Jobs",                 desc: "Bookmark verified jobs and revisit them anytime from your saved jobs dashboard.",                 link: "/saved",            accent: true  },
  { icon: "🧠", title: "IQ Level Game",             desc: "25 timed questions — logical reasoning, patterns and math. Discover your IQ band.",              link: "/prep/iq",          accent: false },
  { icon: "🎤", title: "Mock Interview",            desc: "Role-based interview Q&A with ideal answers revealed. Rate yourself and track weak spots.",       link: "/prep/interview",   accent: true  },
  { icon: "📝", title: "Skill Test",                desc: "Timed MCQ tests on JavaScript, Python, Django, React and SQL. Graded with pass/fail result.",    link: "/prep/test",        accent: false },
  { icon: "🤖", title: "Profile Job Matching",      desc: "Matches jobs directly from your profile skills — no resume upload needed.",                      link: "/my-profile",       accent: true  },
];

const STEPS = [
  { num: "01", icon: "📄", title: "Upload Resume",   desc: "Drop your PDF, DOCX or TXT resume — skills extracted in seconds" },
  { num: "02", icon: "🧑💼", title: "Build Profile", desc: "Add experience, skills, certifications and social links" },
  { num: "03", icon: "🔍", title: "Match & Search",  desc: "Find jobs ranked by how well they match your exact skill set" },
  { num: "04", icon: "🧠", title: "Prep & Apply",    desc: "Sharpen skills with IQ tests and mock interviews, then apply safely" },
];

const PREP_TOOLS = [
  { icon: "🧠", title: "IQ Level Game",  desc: "25 questions · Timed · IQ band result",   link: "/prep/iq",        color: "#7C3AED", light: "#F5F3FF" },
  { icon: "🎤", title: "Mock Interview", desc: "5 roles · Reveal answers · Self-rate",     link: "/prep/interview", color: "#2563EB", light: "#EFF6FF" },
  { icon: "📝", title: "Skill Test",     desc: "5 topics · MCQ · Pass/Fail grade",         link: "/prep/test",      color: "#059669", light: "#ECFDF5" },
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



  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-badge">✦ AI-Powered Career Platform</span>
          <h1>Your Complete <span className="hero-hl">Career Toolkit</span></h1>
          <p className="hero-sub">
            Resume parsing · Job matching · Ghost job detection · ATS resume builder ·
            IQ tests · Mock interviews — everything in one place.
          </p>
          <div className="hero-btns">
            {user ? (
              <>
                <Link to="/resumes" className="btn-primary">My Resumes</Link>
                <Link to="/prep"    className="btn-outline">Prep Hub →</Link>
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
          <div className="sect-label">FEATURES</div>
          <h2 className="sect-title">Everything You Need</h2>
          <p className="sect-sub">From resume parsing to interview prep — all in one platform</p>
          <div className="feat-grid">
            {FEATURES.map(f => (
              <Link to={f.link} key={f.title} className={`feat-card ${f.accent ? "feat-card--accent" : ""}`}>
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="feat-link">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Prep Hub spotlight ── */}
      <section className="prep-section">
        <div className="feat-inner">
          <div className="sect-label">INTERVIEW PREP HUB</div>
          <h2 className="sect-title">Sharpen Your Skills</h2>
          <p className="sect-sub">Three tools to get you interview-ready before the big day</p>
          <div className="prep-grid">
            {PREP_TOOLS.map(t => (
              <Link key={t.link} to={t.link} className="prep-card"
                style={{ "--pc": t.color, "--pl": t.light }}>
                <div className="prep-card-icon">{t.icon}</div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <span className="prep-card-cta" style={{ color: t.color }}>Start now →</span>
              </Link>
            ))}
          </div>
          <div className="prep-cta-wrap">
            <Link to="/prep" className="btn-prep-hub">Go to Prep Hub →</Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="steps-section">
        <div className="feat-inner">
          <div className="sect-label">HOW IT WORKS</div>
          <h2 className="sect-title">Four Simple Steps</h2>
          <p className="sect-sub">From zero to job-ready in minutes</p>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={s.num} className="step-card">
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

      {/* ── CTA ── */}
      {!user && (
        <section className="cta-section">
          <div className="feat-inner cta-inner">
            <h2>Ready to land your perfect job?</h2>
            <p>Join job seekers using AI-powered resume matching, ghost job detection and interview prep — all free.</p>
            <div className="cta-btns">
              <Link to="/register" className="btn-primary btn-lg">Get Started Free →</Link>
              <Link to="/login"    className="btn-cta-outline">Sign In</Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

