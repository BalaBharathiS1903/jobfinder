import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="hero">
        <h1>Match Your Resume to the Perfect Job</h1>
        <p>Upload your resume, auto-extract your skills, and find LinkedIn jobs ranked by relevance.</p>
        {user ? (
          <div className="hero-actions">
            <Link to="/resumes" className="btn-hero">My Resumes</Link>
            <Link to="/search" className="btn-hero btn-hero-outline">Search Jobs</Link>
          </div>
        ) : (
          <div className="hero-actions">
            <Link to="/register" className="btn-hero">Get Started</Link>
            <Link to="/login" className="btn-hero btn-hero-outline">Sign In</Link>
          </div>
        )}
      </div>
      <div className="features">
        {[
          { icon: "📄", title: "Upload Resume", desc: "PDF, DOCX, or TXT — auto-parsed instantly" },
          { icon: "🔍", title: "Search Jobs", desc: "LinkedIn jobs fetched in real time" },
          { icon: "🎯", title: "Skill Matching", desc: "Jobs ranked 0–100% against your resume" },
          { icon: "🔖", title: "Save Jobs", desc: "Bookmark jobs to review later" },
        ].map((f) => (
          <div key={f.title} className="feature-card">
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
