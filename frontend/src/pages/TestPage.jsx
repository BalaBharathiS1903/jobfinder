import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./PrepGame.css";

const TOPICS = {
  "JavaScript": [
    { q: "Which keyword declares a block-scoped variable?", opts: ["var","let","const","both let and const"], ans: 3 },
    { q: "What does typeof null return?", opts: ["null","undefined","object","string"], ans: 2 },
    { q: "Which method removes the last element of an array?", opts: ["shift()","pop()","splice()","slice()"], ans: 1 },
    { q: "What is a closure?", opts: ["A loop","A function with access to its outer scope","An async function","A class method"], ans: 1 },
    { q: "What does === check?", opts: ["Value only","Type only","Value and type","Reference"], ans: 2 },
    { q: "Which is NOT a JavaScript data type?", opts: ["Symbol","BigInt","Float","Boolean"], ans: 2 },
    { q: "What does Array.map() return?", opts: ["undefined","The original array","A new array","A boolean"], ans: 2 },
    { q: "What is event delegation?", opts: ["Passing events to child","Attaching one listener to a parent","Removing events","Cloning events"], ans: 1 },
    { q: "Promise.all() resolves when:", opts: ["First promise resolves","All promises resolve","Any promise rejects","None resolve"], ans: 1 },
    { q: "What is the output of 0.1 + 0.2 === 0.3?", opts: ["true","false","undefined","error"], ans: 1 },
  ],
  "Python": [
    { q: "Which is used to define a function in Python?", opts: ["function","def","fun","define"], ans: 1 },
    { q: "What is the output of type([])?", opts: ["array","list","tuple","<class 'list'>"], ans: 3 },
    { q: "Which is immutable in Python?", opts: ["List","Dictionary","Tuple","Set"], ans: 2 },
    { q: "What does // operator do?", opts: ["Division","Floor division","Modulo","Power"], ans: 1 },
    { q: "How do you start a virtual environment on Windows?", opts: ["source venv/bin/activate","venv\\Scripts\\activate","activate venv","python venv start"], ans: 1 },
    { q: "What does enumerate() do?", opts: ["Sorts a list","Returns index-value pairs","Filters a list","Reverses a list"], ans: 1 },
    { q: "Which keyword is used for exception handling?", opts: ["catch","except","error","handle"], ans: 1 },
    { q: "What is a decorator in Python?", opts: ["A class","A function that wraps another function","A module","A variable"], ans: 1 },
    { q: "What does __init__ do?", opts: ["Destroys an object","Initialises a class instance","Imports a module","Defines a static method"], ans: 1 },
    { q: "Which method joins list elements into a string?", opts: ["concat()","join()","merge()","combine()"], ans: 1 },
  ],
  "Django": [
    { q: "What command creates a new Django project?", opts: ["django startproject","django-admin startproject","python manage.py startproject","django new"], ans: 1 },
    { q: "Which file maps URLs to views?", opts: ["models.py","views.py","urls.py","settings.py"], ans: 2 },
    { q: "What does makemigrations do?", opts: ["Applies DB changes","Creates migration files","Deletes tables","Runs the server"], ans: 1 },
    { q: "What is the ORM in Django?", opts: ["A template engine","Object-Relational Mapper","A URL router","A middleware"], ans: 1 },
    { q: "Which class is used for REST API views in DRF?", opts: ["View","APIView","TemplateView","FormView"], ans: 1 },
    { q: "What does select_related() do?", opts: ["Filters queryset","Performs SQL JOIN to reduce queries","Deletes related objects","Sorts results"], ans: 1 },
    { q: "Where are app-level settings defined?", opts: ["urls.py","apps.py","settings.py","models.py"], ans: 2 },
    { q: "What is a serializer in DRF?", opts: ["A URL pattern","Converts model instances to JSON","A middleware","A template tag"], ans: 1 },
    { q: "Which decorator restricts a view to authenticated users?", opts: ["@login_required","@auth_required","@permission_required","@authenticated"], ans: 0 },
    { q: "What does reverse() do in Django?", opts: ["Reverses a queryset","Returns URL from a named pattern","Reverses a string","Undoes a migration"], ans: 1 },
  ],
  "React": [
    { q: "What hook manages local component state?", opts: ["useEffect","useRef","useState","useContext"], ans: 2 },
    { q: "What does useEffect with [] dependency run?", opts: ["On every render","Once on mount","On unmount only","Never"], ans: 1 },
    { q: "What is JSX?", opts: ["A CSS framework","JavaScript XML syntax","A database","A testing library"], ans: 1 },
    { q: "What is the purpose of key prop in lists?", opts: ["Styling","Helps React identify changed items","Sets focus","Adds event listeners"], ans: 1 },
    { q: "What does React.memo do?", opts: ["Memoizes a value","Prevents re-render if props unchanged","Creates a ref","Handles errors"], ans: 1 },
    { q: "What is prop drilling?", opts: ["Passing props through many layers","Deleting props","Validating props","Merging props"], ans: 0 },
    { q: "Which hook accesses context?", opts: ["useRef","useContext","useReducer","useMemo"], ans: 1 },
    { q: "What does ReactDOM.createRoot do?", opts: ["Creates a component","Mounts React app to a DOM node","Creates a context","Renders a list"], ans: 1 },
    { q: "What is a controlled component?", opts: ["A component with no state","Form element whose value is controlled by React state","A pure component","A memoized component"], ans: 1 },
    { q: "What does useRef return?", opts: ["A state value","A mutable ref object","A context","A callback"], ans: 1 },
  ],
  "SQL": [
    { q: "Which clause filters rows after grouping?", opts: ["WHERE","HAVING","FILTER","GROUP BY"], ans: 1 },
    { q: "What does DISTINCT do?", opts: ["Sorts results","Removes duplicate rows","Filters NULLs","Joins tables"], ans: 1 },
    { q: "Which JOIN returns all rows from both tables?", opts: ["INNER JOIN","LEFT JOIN","RIGHT JOIN","FULL OUTER JOIN"], ans: 3 },
    { q: "What does COUNT(*) return?", opts: ["Sum of values","Number of rows","Average","Maximum"], ans: 1 },
    { q: "Which keyword prevents duplicate rows in UNION?", opts: ["UNION ALL","DISTINCT","UNION","UNIQUE"], ans: 2 },
    { q: "What is a PRIMARY KEY?", opts: ["A foreign reference","Unique identifier for each row","An index","A constraint"], ans: 1 },
    { q: "What does COALESCE do?", opts: ["Joins strings","Returns first non-NULL value","Counts NULLs","Converts types"], ans: 1 },
    { q: "Which statement modifies existing rows?", opts: ["INSERT","DELETE","UPDATE","ALTER"], ans: 2 },
    { q: "What is a subquery?", opts: ["A stored procedure","A query nested inside another query","A view","A trigger"], ans: 1 },
    { q: "What does INDEX improve?", opts: ["Write speed","Read/query speed","Storage","Security"], ans: 1 },
  ],
};

const TIME_PER_Q = 30;

function getGrade(pct) {
  if (pct >= 90) return { label: "A+ — Outstanding", color: "#059669" };
  if (pct >= 75) return { label: "A — Excellent", color: "#2563EB" };
  if (pct >= 60) return { label: "B — Good", color: "#7C3AED" };
  if (pct >= 40) return { label: "C — Average", color: "#D97706" };
  return { label: "F — Needs Improvement", color: "#DC2626" };
}

export default function TestPage() {
  const [topic, setTopic] = useState("");
  const [phase, setPhase] = useState("select");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const timer = useRef();

  const questions = TOPICS[topic] || [];

  const startTimer = () => {
    clearInterval(timer.current);
    setTimeLeft(TIME_PER_Q);
    timer.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer.current); autoNext(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const autoNext = () => {
    setAnswers(prev => {
      const next = [...prev, -1];
      if (current + 1 >= questions.length) { setPhase("result"); return next; }
      setCurrent(c => c + 1);
      setSelected(null);
      return next;
    });
  };

  useEffect(() => { if (phase === "playing") startTimer(); return () => clearInterval(timer.current); }, [current, phase]);

  const pick = (idx) => {
    if (selected !== null) return;
    clearInterval(timer.current);
    setSelected(idx);
    const next = [...answers, idx];
    setTimeout(() => {
      if (current + 1 >= questions.length) { setAnswers(next); setPhase("result"); }
      else { setAnswers(next); setCurrent(c => c + 1); setSelected(null); }
    }, 700);
  };

  const restart = () => { setCurrent(0); setAnswers([]); setSelected(null); setPhase("select"); setTopic(""); };

  const score = answers.filter((a, i) => a === questions[i]?.ans).length;
  const pct = Math.round((score / questions.length) * 100);
  const timePct = Math.round((timeLeft / TIME_PER_Q) * 100);

  if (phase === "select") return (
    <div className="pg-page">
      <Link to="/prep" className="pg-back">← Back to Prep Hub</Link>
      <div className="pg-intro-card" style={{ "--c": "#059669", "--cl": "#ECFDF5" }}>
        <div className="pg-intro-icon">📝</div>
        <h1>Skill Test</h1>
        <p>10 MCQ questions on your chosen topic. 30 seconds per question. Scored and graded at the end.</p>
        <div className="pg-role-grid">
          {Object.keys(TOPICS).map(t => (
            <button key={t} className={`pg-role-btn ${topic === t ? "active" : ""}`}
              style={{ "--c": "#059669" }} onClick={() => setTopic(t)}>{t}</button>
          ))}
        </div>
        <button className="pg-btn-start" style={{ background: "#059669" }} disabled={!topic}
          onClick={() => setPhase("playing")}>Start Test →</button>
      </div>
    </div>
  );

  if (phase === "result") {
    const grade = getGrade(pct);
    const passed = pct >= 60;
    return (
      <div className="pg-page">
        <Link to="/prep" className="pg-back">← Back to Prep Hub</Link>
        <div className="pg-result-card">
          <div className="pg-result-icon">📝</div>
          <h2>{topic} Test Result</h2>
          <div className={`pg-pass-badge ${passed ? "pass" : "fail"}`}>{passed ? "PASSED ✓" : "FAILED ✗"}</div>
          <div className="pg-iq-band" style={{ color: grade.color, borderColor: grade.color }}>{grade.label}</div>
          <div className="pg-score-row">
            <div className="pg-score-box"><strong>{score}/{questions.length}</strong><span>Score</span></div>
            <div className="pg-score-box"><strong>{pct}%</strong><span>Percentage</span></div>
            <div className="pg-score-box"><strong>{questions.length - score}</strong><span>Wrong</span></div>
          </div>
          <div className="pg-review">
            {questions.map((q, i) => (
              <div key={i} className={`pg-review-item ${answers[i] === q.ans ? "correct" : "wrong"}`}>
                <span className="pg-review-num">Q{i + 1}</span>
                <span className="pg-review-q">{q.q}</span>
                <span className="pg-review-ans">{answers[i] === q.ans ? "✓" : `✗ → ${q.opts[q.ans]}`}</span>
              </div>
            ))}
          </div>
          <button className="pg-btn-start" style={{ background: "#059669" }} onClick={restart}>Try Another Topic</button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="pg-page">
      <div className="pg-play-header">
        <span className="pg-qcount">Q {current + 1} / {questions.length}</span>
        <div className="pg-timer-wrap">
          <div className="pg-timer-bar">
            <div className="pg-timer-fill" style={{ width: `${timePct}%`, background: timePct < 30 ? "#DC2626" : "#059669" }} />
          </div>
          <span className="pg-timer-text" style={{ color: timePct < 30 ? "#DC2626" : "var(--dark)" }}>{timeLeft}s</span>
        </div>
        <span className="pg-role-tag">{topic}</span>
      </div>
      <div className="pg-question-card" style={{ "--c": "#059669", "--cl": "#ECFDF5" }}>
        <p className="pg-question">{q.q}</p>
        <div className="pg-options">
          {q.opts.map((opt, i) => (
            <button key={i}
              className={`pg-option ${selected === i ? (i === q.ans ? "correct" : "wrong") : selected !== null && i === q.ans ? "correct" : ""}`}
              onClick={() => pick(i)}>
              <span className="pg-opt-letter">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
