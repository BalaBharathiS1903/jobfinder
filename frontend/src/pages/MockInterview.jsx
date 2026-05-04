import { useState } from "react";
import { Link } from "react-router-dom";
import "./PrepGame.css";

const ROLES = {
  "Frontend Developer": [
    { q: "Explain the difference between == and === in JavaScript.", a: "== does type coercion before comparing, === checks both value and type without coercion. Always prefer === to avoid unexpected bugs." },
    { q: "What is the Virtual DOM and why does React use it?", a: "The Virtual DOM is an in-memory representation of the real DOM. React diffs the virtual tree against the previous one and only updates changed nodes, making UI updates faster." },
    { q: "What are React hooks? Name 3 commonly used ones.", a: "Hooks let you use state and lifecycle features in functional components. Common ones: useState (local state), useEffect (side effects), useCallback (memoize functions)." },
    { q: "Explain CSS specificity.", a: "Specificity determines which CSS rule wins when multiple rules target the same element. Order: inline styles > IDs > classes/attributes > elements. Calculated as (a,b,c) tuple." },
    { q: "What is CORS and how do you handle it?", a: "Cross-Origin Resource Sharing restricts HTTP requests from different origins. Handled server-side by setting Access-Control-Allow-Origin headers, or via a proxy in development." },
    { q: "What is the difference between useMemo and useCallback?", a: "useMemo memoizes a computed value; useCallback memoizes a function reference. Both prevent unnecessary recalculations on re-renders." },
  ],
  "Backend Developer": [
    { q: "What is the difference between SQL and NoSQL databases?", a: "SQL databases are relational, schema-based, and use structured tables. NoSQL databases are schema-less, support flexible data models (document, key-value, graph), and scale horizontally." },
    { q: "Explain REST vs GraphQL.", a: "REST uses fixed endpoints per resource; GraphQL uses a single endpoint where clients specify exactly what data they need, reducing over/under-fetching." },
    { q: "What is database indexing and when should you use it?", a: "An index is a data structure that speeds up read queries on a column. Use it on frequently queried/filtered columns. Avoid over-indexing as it slows writes." },
    { q: "What is JWT and how does authentication work with it?", a: "JSON Web Token is a signed token containing claims. Server issues a JWT on login; client sends it in headers. Server verifies the signature without a DB lookup." },
    { q: "Explain the N+1 query problem.", a: "N+1 occurs when fetching a list of N items triggers N additional queries for related data. Fix with eager loading (select_related/prefetch_related in Django, JOIN in SQL)." },
    { q: "What is a message queue and when would you use one?", a: "A message queue (e.g. RabbitMQ, SQS) decouples services by passing async messages. Use for background jobs, email sending, or high-throughput event processing." },
  ],
  "Full Stack Developer": [
    { q: "How do you handle state management in a large React app?", a: "Options: React Context for simple global state, Redux/Zustand for complex state, TanStack Query for server state. Choose based on complexity — avoid over-engineering." },
    { q: "Explain the request lifecycle in a Django REST API.", a: "Request → URL routing → middleware → view/viewset → serializer validation → model/DB → serializer output → response. DRF handles auth, permissions, and throttling in middleware." },
    { q: "What is CI/CD and what tools have you used?", a: "CI/CD automates testing and deployment. CI runs tests on every push; CD deploys passing builds. Tools: GitHub Actions, Jenkins, GitLab CI, AWS CodePipeline." },
    { q: "How do you secure a web application?", a: "HTTPS, input validation, parameterized queries (prevent SQLi), CSP headers, CORS policy, JWT expiry, rate limiting, dependency audits, and secrets management." },
    { q: "What is Docker and why is it useful?", a: "Docker packages an app and its dependencies into a container that runs consistently across environments. Eliminates 'works on my machine' issues and simplifies deployment." },
    { q: "Explain the difference between horizontal and vertical scaling.", a: "Vertical scaling adds more resources (CPU/RAM) to one server. Horizontal scaling adds more servers. Horizontal is preferred for high availability and fault tolerance." },
  ],
  "Data Analyst": [
    { q: "What is the difference between INNER JOIN and LEFT JOIN?", a: "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right (NULLs where no match)." },
    { q: "Explain overfitting in machine learning.", a: "Overfitting is when a model learns training data too well, including noise, and performs poorly on new data. Fix with regularization, more data, or simpler models." },
    { q: "What is a p-value?", a: "A p-value measures the probability of observing results at least as extreme as the data, assuming the null hypothesis is true. p < 0.05 typically indicates statistical significance." },
    { q: "What is the difference between mean, median, and mode?", a: "Mean is the average. Median is the middle value when sorted. Mode is the most frequent value. Use median for skewed data to avoid outlier influence." },
    { q: "What is a pivot table?", a: "A pivot table summarises data by grouping rows/columns and applying aggregations (sum, count, avg). Used in Excel, pandas (pivot_table), and SQL (CASE/GROUP BY)." },
    { q: "Explain ETL.", a: "Extract, Transform, Load. Extract data from sources, transform it (clean, aggregate, format), then load into a data warehouse or target system for analysis." },
  ],
  "DevOps Engineer": [
    { q: "What is Infrastructure as Code (IaC)?", a: "IaC manages infrastructure through code (e.g. Terraform, CloudFormation) instead of manual processes. Enables version control, repeatability, and automated provisioning." },
    { q: "Explain Kubernetes pods and deployments.", a: "A pod is the smallest deployable unit, containing one or more containers. A deployment manages pod replicas, rolling updates, and rollbacks declaratively." },
    { q: "What is the difference between blue-green and canary deployments?", a: "Blue-green switches all traffic from old (blue) to new (green) at once. Canary gradually shifts a percentage of traffic to the new version, reducing risk." },
    { q: "What is a load balancer?", a: "A load balancer distributes incoming traffic across multiple servers to ensure availability and prevent overload. Types: Application (L7), Network (L4), Classic." },
    { q: "How does Prometheus + Grafana work?", a: "Prometheus scrapes metrics from targets at intervals and stores them as time-series data. Grafana queries Prometheus and visualises metrics in dashboards with alerts." },
    { q: "What is a VPC?", a: "A Virtual Private Cloud is an isolated network within a cloud provider (e.g. AWS VPC). You control IP ranges, subnets, route tables, and security groups." },
  ],
};

const RATINGS = ["😟 Poor", "😐 Okay", "🙂 Good", "😊 Great", "🤩 Perfect"];

export default function MockInterview() {
  const [role, setRole] = useState("");
  const [phase, setPhase] = useState("select"); // select | interview | result
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratings, setRatings] = useState([]);

  const questions = ROLES[role] || [];

  const start = () => { if (!role) return; setPhase("interview"); setCurrent(0); setRatings([]); setRevealed(false); };

  const rate = (r) => {
    const next = [...ratings, r];
    setRatings(next);
    if (current + 1 >= questions.length) { setPhase("result"); }
    else { setCurrent(c => c + 1); setRevealed(false); }
  };

  const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
  const resultLabel = avg >= 4 ? "Excellent 🎉" : avg >= 3 ? "Good 👍" : avg >= 2 ? "Needs Work 📚" : "Keep Practising 💪";

  if (phase === "select") return (
    <div className="pg-page">
      <Link to="/prep" className="pg-back">← Back to Prep Hub</Link>
      <div className="pg-intro-card" style={{ "--c": "#2563EB", "--cl": "#EFF6FF" }}>
        <div className="pg-intro-icon">🎤</div>
        <h1>Mock Interview</h1>
        <p>Select your role, answer each question in your head, reveal the ideal answer, then rate yourself honestly.</p>
        <div className="pg-role-grid">
          {Object.keys(ROLES).map(r => (
            <button key={r} className={`pg-role-btn ${role === r ? "active" : ""}`}
              style={{ "--c": "#2563EB" }} onClick={() => setRole(r)}>{r}</button>
          ))}
        </div>
        <button className="pg-btn-start" style={{ background: "#2563EB" }} disabled={!role} onClick={start}>
          Start Interview →
        </button>
      </div>
    </div>
  );

  if (phase === "result") return (
    <div className="pg-page">
      <Link to="/prep" className="pg-back">← Back to Prep Hub</Link>
      <div className="pg-result-card">
        <div className="pg-result-icon">🎤</div>
        <h2>Interview Complete</h2>
        <div className="pg-iq-band" style={{ color: "#2563EB", borderColor: "#2563EB" }}>{resultLabel}</div>
        <p className="pg-band-desc">Average self-rating: <strong>{avg} / 4</strong></p>
        <div className="pg-score-row">
          {questions.map((q, i) => (
            <div key={i} className="pg-score-box">
              <strong>{RATINGS[ratings[i]]?.split(" ")[0]}</strong>
              <span>Q{i + 1}</span>
            </div>
          ))}
        </div>
        <button className="pg-btn-start" style={{ background: "#2563EB" }}
          onClick={() => { setPhase("select"); setRole(""); }}>Try Another Role</button>
      </div>
    </div>
  );

  const q = questions[current];
  return (
    <div className="pg-page">
      <div className="pg-play-header">
        <span className="pg-qcount">Q {current + 1} / {questions.length}</span>
        <span className="pg-role-tag">{role}</span>
      </div>
      <div className="pg-question-card" style={{ "--c": "#2563EB", "--cl": "#EFF6FF" }}>
        <p className="pg-question">{q.q}</p>
        {!revealed ? (
          <button className="pg-reveal-btn" onClick={() => setRevealed(true)}>💡 Reveal Answer</button>
        ) : (
          <>
            <div className="pg-answer-box">{q.a}</div>
            <p className="pg-rate-label">How well did you answer?</p>
            <div className="pg-ratings">
              {RATINGS.map((r, i) => (
                <button key={i} className="pg-rating-btn" onClick={() => rate(i)}>{r}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
