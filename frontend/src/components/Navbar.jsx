import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">ResumeMatch</Link>
      {user && (
        <div className="navbar-links">
          <Link to="/resumes">Resumes</Link>
          <Link to="/search">Search Jobs</Link>
          <Link to="/saved">Saved Jobs</Link>
          <button onClick={handleLogout} className="btn-link">Logout</button>
        </div>
      )}
    </nav>
  );
}
