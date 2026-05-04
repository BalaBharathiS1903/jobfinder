import { useState } from "react";
import { Link } from "react-router-dom";
import "./PrepGame.css";

const ALL_ROLES = {
  "Frontend Developer": [
    {
      q: "What is the difference between == and === in JavaScript?",
      opts: ["Both check value and type","== does type coercion, === checks value and type","=== does type coercion, == does not","They are identical"],
      ans: 1,
      a: "== does type coercion before comparing. === checks both value and type without coercion. Always prefer === to avoid unexpected bugs.",
    },
    {
      q: "What is the Virtual DOM in React?",
      opts: ["A real browser DOM copy","An in-memory representation of the DOM that React diffs for efficient updates","A CSS rendering engine","A server-side rendering tool"],
      ans: 1,
      a: "The Virtual DOM is an in-memory representation of the real DOM. React diffs the virtual tree against the previous one and only updates changed nodes.",
    },
    {
      q: "What does useEffect with an empty dependency array [] do?",
      opts: ["Runs on every render","Runs once on mount only","Runs on unmount only","Never runs"],
      ans: 1,
      a: "useEffect with [] runs once after the initial render (mount). It's used for one-time side effects like API calls or subscriptions.",
    },
    {
      q: "What is CSS specificity?",
      opts: ["The order CSS files are loaded","A rule that determines which CSS style wins when multiple rules target the same element","The size of a CSS file","How fast CSS renders"],
      ans: 1,
      a: "Specificity determines which CSS rule wins. Order: inline styles > IDs > classes/attributes > elements. Calculated as (a,b,c) tuple.",
    },
    {
      q: "What is CORS?",
      opts: ["A JavaScript framework","A CSS preprocessor","A browser security mechanism restricting cross-origin HTTP requests","A type of database"],
      ans: 2,
      a: "Cross-Origin Resource Sharing restricts HTTP requests from different origins. Handled server-side by setting Access-Control-Allow-Origin headers.",
    },
    {
      q: "What is the difference between useMemo and useCallback?",
      opts: ["They are the same","useMemo memoizes a value; useCallback memoizes a function reference","useCallback memoizes a value; useMemo memoizes a function","Neither memoizes anything"],
      ans: 1,
      a: "useMemo memoizes a computed value; useCallback memoizes a function reference. Both prevent unnecessary recalculations on re-renders.",
    },
    {
      q: "What is event bubbling in JavaScript?",
      opts: ["Events fire from child to parent elements","Events fire from parent to child elements","Events fire only on the target element","Events are cancelled automatically"],
      ans: 0,
      a: "Event bubbling means an event triggered on a child element propagates up through its parent elements in the DOM tree.",
    },
    {
      q: "What does the CSS box model consist of?",
      opts: ["Content only","Content, padding, border, margin","Content and border only","Margin and padding only"],
      ans: 1,
      a: "The CSS box model consists of content, padding, border, and margin — from inside out.",
    },
  ],
  "Backend Developer": [
    {
      q: "What is the difference between SQL and NoSQL databases?",
      opts: ["SQL is faster, NoSQL is slower","SQL is relational and schema-based; NoSQL is schema-less and flexible","NoSQL uses tables; SQL uses documents","They are the same"],
      ans: 1,
      a: "SQL databases are relational, schema-based, and use structured tables. NoSQL databases are schema-less, support flexible data models, and scale horizontally.",
    },
    {
      q: "What is the difference between REST and GraphQL?",
      opts: ["REST is newer than GraphQL","REST uses fixed endpoints; GraphQL uses a single endpoint where clients specify data needs","GraphQL is only for mobile apps","REST supports real-time; GraphQL does not"],
      ans: 1,
      a: "REST uses fixed endpoints per resource; GraphQL uses a single endpoint where clients specify exactly what data they need, reducing over/under-fetching.",
    },
    {
      q: "What is JWT used for?",
      opts: ["Styling web pages","Stateless authentication — server issues a signed token; client sends it in headers","Database queries","File uploads"],
      ans: 1,
      a: "JSON Web Token is a signed token containing claims. Server issues a JWT on login; client sends it in headers. Server verifies the signature without a DB lookup.",
    },
    {
      q: "What is the N+1 query problem?",
      opts: ["A database with N+1 tables","Fetching N items triggers N additional queries for related data","A SQL syntax error","A network timeout issue"],
      ans: 1,
      a: "N+1 occurs when fetching a list of N items triggers N additional queries for related data. Fix with eager loading (select_related in Django, JOIN in SQL).",
    },
    {
      q: "What is a message queue used for?",
      opts: ["Storing user messages","Decoupling services by passing async messages for background jobs","Caching database results","Managing CSS styles"],
      ans: 1,
      a: "A message queue (e.g. RabbitMQ, SQS) decouples services by passing async messages. Use for background jobs, email sending, or high-throughput event processing.",
    },
    {
      q: "What does database indexing do?",
      opts: ["Slows down all queries","Speeds up read queries on indexed columns at the cost of slower writes","Deletes duplicate rows","Encrypts data"],
      ans: 1,
      a: "An index is a data structure that speeds up read queries on a column. Use it on frequently queried/filtered columns. Avoid over-indexing as it slows writes.",
    },
    {
      q: "What is the purpose of middleware in a web framework?",
      opts: ["To render HTML templates","To process requests/responses between the client and the route handler","To manage database connections only","To serve static files"],
      ans: 1,
      a: "Middleware sits between the request and the route handler. It can handle authentication, logging, CORS, rate limiting, and more.",
    },
    {
      q: "What is horizontal scaling?",
      opts: ["Adding more CPU/RAM to one server","Adding more servers to distribute load","Increasing database storage","Upgrading the operating system"],
      ans: 1,
      a: "Horizontal scaling adds more servers to distribute load. It's preferred for high availability and fault tolerance over vertical scaling.",
    },
  ],
  "Full Stack Developer": [
    {
      q: "What is CI/CD?",
      opts: ["A programming language","Automating testing (CI) and deployment (CD) of code changes","A database management system","A CSS framework"],
      ans: 1,
      a: "CI/CD automates testing and deployment. CI runs tests on every push; CD deploys passing builds. Tools: GitHub Actions, Jenkins, GitLab CI.",
    },
    {
      q: "What is Docker used for?",
      opts: ["Writing CSS","Packaging an app and its dependencies into a portable container","Managing DNS records","Designing databases"],
      ans: 1,
      a: "Docker packages an app and its dependencies into a container that runs consistently across environments, eliminating 'works on my machine' issues.",
    },
    {
      q: "What is the purpose of environment variables?",
      opts: ["To style web pages","To store configuration values like API keys outside of source code","To define CSS variables","To manage database schemas"],
      ans: 1,
      a: "Environment variables store sensitive configuration (API keys, DB credentials) outside source code, keeping secrets out of version control.",
    },
    {
      q: "What is a REST API?",
      opts: ["A database type","An architectural style for web services using HTTP methods and stateless communication","A JavaScript library","A CSS methodology"],
      ans: 1,
      a: "REST (Representational State Transfer) is an architectural style using HTTP methods (GET, POST, PUT, DELETE) for stateless client-server communication.",
    },
    {
      q: "What does HTTPS provide over HTTP?",
      opts: ["Faster loading","Encrypted communication between client and server using TLS","Larger file transfers","Better caching"],
      ans: 1,
      a: "HTTPS encrypts data in transit using TLS, preventing eavesdropping and man-in-the-middle attacks.",
    },
    {
      q: "What is state management in React?",
      opts: ["Managing CSS styles","Managing and sharing application data across components","Managing database connections","Managing server routes"],
      ans: 1,
      a: "State management handles application data that changes over time. Options: useState for local state, Context for global state, Redux/Zustand for complex state.",
    },
    {
      q: "What is the difference between authentication and authorisation?",
      opts: ["They are the same","Authentication verifies who you are; authorisation determines what you can access","Authorisation verifies identity; authentication grants permissions","Neither involves security"],
      ans: 1,
      a: "Authentication verifies identity (who are you?). Authorisation determines permissions (what can you do?).",
    },
    {
      q: "What is a CDN?",
      opts: ["A type of database","A network of servers that delivers content from locations closest to the user","A CSS framework","A JavaScript bundler"],
      ans: 1,
      a: "A Content Delivery Network distributes static assets (images, JS, CSS) from servers geographically close to users, reducing latency.",
    },
  ],
  "Data Analyst": [
    {
      q: "What is the difference between INNER JOIN and LEFT JOIN?",
      opts: ["They return the same results","INNER JOIN returns only matching rows; LEFT JOIN returns all left rows with NULLs for non-matches","LEFT JOIN returns only matching rows","INNER JOIN returns all rows"],
      ans: 1,
      a: "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right (NULLs where no match).",
    },
    {
      q: "What is overfitting in machine learning?",
      opts: ["When a model is too simple","When a model learns training data too well including noise, performing poorly on new data","When training data is too large","When a model trains too quickly"],
      ans: 1,
      a: "Overfitting is when a model learns training data too well, including noise, and performs poorly on new data. Fix with regularization, more data, or simpler models.",
    },
    {
      q: "What does a p-value represent?",
      opts: ["The probability the hypothesis is true","The probability of observing results at least as extreme, assuming the null hypothesis is true","The size of the dataset","The accuracy of the model"],
      ans: 1,
      a: "A p-value measures the probability of observing results at least as extreme as the data, assuming the null hypothesis is true. p < 0.05 typically indicates statistical significance.",
    },
    {
      q: "When should you use median instead of mean?",
      opts: ["When data is normally distributed","When data is skewed or has outliers","When data has no duplicates","When the dataset is very large"],
      ans: 1,
      a: "Use median for skewed data or when outliers are present, as the mean is heavily influenced by extreme values.",
    },
    {
      q: "What is ETL?",
      opts: ["A machine learning algorithm","Extract, Transform, Load — a data pipeline process","A type of database","A visualisation tool"],
      ans: 1,
      a: "ETL stands for Extract, Transform, Load. Extract data from sources, transform it (clean, aggregate, format), then load into a data warehouse for analysis.",
    },
    {
      q: "What is a pivot table?",
      opts: ["A type of chart","A table that summarises data by grouping rows/columns with aggregations","A database index","A type of JOIN"],
      ans: 1,
      a: "A pivot table summarises data by grouping rows/columns and applying aggregations (sum, count, avg). Used in Excel, pandas, and SQL.",
    },
    {
      q: "What is the difference between supervised and unsupervised learning?",
      opts: ["They are the same","Supervised uses labelled data; unsupervised finds patterns in unlabelled data","Unsupervised uses labelled data; supervised does not","Neither uses data"],
      ans: 1,
      a: "Supervised learning trains on labelled data to predict outcomes. Unsupervised learning finds hidden patterns or groupings in unlabelled data.",
    },
    {
      q: "What does standard deviation measure?",
      opts: ["The average value","The spread or dispersion of data around the mean","The maximum value","The number of data points"],
      ans: 1,
      a: "Standard deviation measures how spread out data points are from the mean. A low SD means data is clustered; a high SD means it is spread out.",
    },
  ],
  "DevOps Engineer": [
    {
      q: "What is Infrastructure as Code (IaC)?",
      opts: ["Writing application code","Managing infrastructure through code files (e.g. Terraform) instead of manual processes","A type of database","A CI/CD tool"],
      ans: 1,
      a: "IaC manages infrastructure through code (e.g. Terraform, CloudFormation) instead of manual processes. Enables version control, repeatability, and automated provisioning.",
    },
    {
      q: "What is a Kubernetes pod?",
      opts: ["A type of container image","The smallest deployable unit in Kubernetes, containing one or more containers","A Kubernetes cluster","A load balancer"],
      ans: 1,
      a: "A pod is the smallest deployable unit in Kubernetes, containing one or more containers that share network and storage.",
    },
    {
      q: "What is the difference between blue-green and canary deployments?",
      opts: ["They are the same","Blue-green switches all traffic at once; canary gradually shifts a percentage to the new version","Canary switches all traffic at once; blue-green is gradual","Neither involves traffic routing"],
      ans: 1,
      a: "Blue-green switches all traffic from old (blue) to new (green) at once. Canary gradually shifts a percentage of traffic to the new version, reducing risk.",
    },
    {
      q: "What does a load balancer do?",
      opts: ["Stores application data","Distributes incoming traffic across multiple servers to ensure availability","Manages DNS records","Encrypts network traffic"],
      ans: 1,
      a: "A load balancer distributes incoming traffic across multiple servers to ensure availability and prevent overload.",
    },
    {
      q: "What is a VPC?",
      opts: ["A type of database","An isolated virtual network within a cloud provider where you control IP ranges and security","A container orchestration tool","A monitoring service"],
      ans: 1,
      a: "A Virtual Private Cloud is an isolated network within a cloud provider (e.g. AWS VPC). You control IP ranges, subnets, route tables, and security groups.",
    },
    {
      q: "What is the purpose of Prometheus in monitoring?",
      opts: ["To deploy containers","To scrape and store time-series metrics from targets at regular intervals","To manage DNS","To build CI/CD pipelines"],
      ans: 1,
      a: "Prometheus scrapes metrics from targets at intervals and stores them as time-series data. Grafana queries Prometheus and visualises metrics in dashboards.",
    },
    {
      q: "What does a Dockerfile define?",
      opts: ["A Kubernetes cluster","The instructions to build a Docker container image","A CI/CD pipeline","A load balancer configuration"],
      ans: 1,
      a: "A Dockerfile contains step-by-step instructions to build a Docker image — base image, dependencies, environment variables, and the command to run.",
    },
    {
      q: "What is the purpose of a reverse proxy?",
      opts: ["To connect to databases","To sit in front of servers, forwarding client requests and providing load balancing, SSL termination, and caching","To manage container images","To write infrastructure code"],
      ans: 1,
      a: "A reverse proxy (e.g. Nginx) sits in front of backend servers, forwarding requests, providing load balancing, SSL termination, and caching.",
    },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MockInterview() {
  const [role, setRole]         = useState("");
  const [phase, setPhase]       = useState("select");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers]   = useState([]);
  const [revealed, setRevealed] = useState(false);

  const startInterview = () => {
    const q = shuffle(ALL_ROLES[role]).slice(0, 6);
    setQuestions(q);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setRevealed(false);
    setPhase("interview");
  };

  const pickAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setRevealed(true);
  };

  const next = () => {
    const next = [...answers, selected ?? -1];
    setAnswers(next);
    if (current + 1 >= questions.length) { setPhase("result"); }
    else { setCurrent(c => c + 1); setSelected(null); setRevealed(false); }
  };

  const score = answers.filter((a, i) => a === questions[i]?.ans).length;
  const pct   = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const resultLabel = pct >= 80 ? "Excellent 🎉" : pct >= 60 ? "Good 👍" : pct >= 40 ? "Needs Work 📚" : "Keep Practising 💪";
  const resultColor = pct >= 80 ? "#059669" : pct >= 60 ? "#2563EB" : pct >= 40 ? "#D97706" : "#DC2626";

  if (phase === "select") return (
    <div className="pg-page">
      <Link to="/prep" className="pg-back">← Back to Prep Hub</Link>
      <div className="pg-intro-card" style={{ "--c": "#2563EB", "--cl": "#EFF6FF" }}>
        <div className="pg-intro-icon">🎤</div>
        <h1>Mock Interview</h1>
        <p>Select your role. Each question has 4 options — pick the best answer, then see the full explanation. New questions every session.</p>
        <ul className="pg-rules">
          <li>🔀 Questions are shuffled every session</li>
          <li>✅ Pick the correct option from 4 choices</li>
          <li>💡 Full explanation revealed after each answer</li>
          <li>📊 Score validated at the end</li>
        </ul>
        <div className="pg-role-grid">
          {Object.keys(ALL_ROLES).map(r => (
            <button key={r} className={`pg-role-btn ${role === r ? "active" : ""}`}
              style={{ "--c": "#2563EB" }} onClick={() => setRole(r)}>{r}</button>
          ))}
        </div>
        <button className="pg-btn-start" style={{ background: "#2563EB" }} disabled={!role} onClick={startInterview}>
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
        <h2>Interview Result — {role}</h2>
        <div className="pg-iq-band" style={{ color: resultColor, borderColor: resultColor }}>{resultLabel}</div>
        <div className="pg-score-row">
          <div className="pg-score-box"><strong>{score}/{questions.length}</strong><span>Correct</span></div>
          <div className="pg-score-box"><strong>{pct}%</strong><span>Score</span></div>
          <div className="pg-score-box"><strong>{questions.length - score}</strong><span>Wrong</span></div>
        </div>

        {/* Detailed validation */}
        <div className="pg-review pg-interview-review">
          {questions.map((q, i) => {
            const userAns = answers[i];
            const correct = userAns === q.ans;
            return (
              <div key={i} className={`pg-review-item ${correct ? "correct" : "wrong"}`}>
                <div className="pg-review-q-full">
                  <span className="pg-review-num">Q{i + 1}</span>
                  <span className="pg-review-q">{q.q}</span>
                </div>
                <div className="pg-review-detail">
                  <span className={`pg-review-opt ${correct ? "opt-correct" : "opt-wrong"}`}>
                    Your answer: {userAns >= 0 ? q.opts[userAns] : "No answer"}
                  </span>
                  {!correct && (
                    <span className="pg-review-opt opt-correct">
                      ✓ Correct: {q.opts[q.ans]}
                    </span>
                  )}
                  <span className="pg-review-explanation">{q.a}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button className="pg-btn-start" style={{ background: "#2563EB" }} onClick={startInterview}>
          Try Again (New Questions)
        </button>
        <button className="pg-btn-quit" style={{ marginTop: "0.5rem" }}
          onClick={() => { setPhase("select"); setRole(""); }}>Choose Another Role</button>
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

        {/* MCQ options */}
        <div className="pg-options">
          {q.opts.map((opt, i) => (
            <button key={i}
              className={`pg-option ${
                selected !== null
                  ? i === q.ans ? "correct"
                  : i === selected ? "wrong"
                  : ""
                : ""
              }`}
              onClick={() => pickAnswer(i)}
              disabled={selected !== null}>
              <span className="pg-opt-letter">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>

        {/* Explanation after answer */}
        {revealed && (
          <div className="pg-interview-feedback">
            <div className={`pg-feedback-badge ${selected === q.ans ? "correct" : "wrong"}`}>
              {selected === q.ans ? "✓ Correct!" : "✗ Incorrect"}
            </div>
            <div className="pg-answer-box">{q.a}</div>
            <button className="pg-btn-next" onClick={next}>
              {current + 1 >= questions.length ? "See Results →" : "Next Question →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
