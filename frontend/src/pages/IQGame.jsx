import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./PrepGame.css";

const ALL_QUESTIONS = [
  { q: "2, 4, 8, 16, ?", opts: ["24","32","28","20"], ans: 1 },
  { q: "Which number is odd one out? 3, 5, 7, 9, 11", opts: ["3","9","11","5"], ans: 1 },
  { q: "If all Bloops are Razzles and all Razzles are Lazzles, are all Bloops definitely Lazzles?", opts: ["Yes","No","Maybe","Cannot say"], ans: 0 },
  { q: "A clock shows 3:15. What is the angle between the hands?", opts: ["0°","7.5°","15°","22.5°"], ans: 1 },
  { q: "1, 1, 2, 3, 5, 8, ?", opts: ["11","12","13","14"], ans: 2 },
  { q: "Which shape has the most sides? Triangle, Pentagon, Hexagon, Octagon", opts: ["Triangle","Pentagon","Hexagon","Octagon"], ans: 3 },
  { q: "100 ÷ 4 × 2 + 10 − 5 = ?", opts: ["55","60","45","50"], ans: 0 },
  { q: "A is taller than B. C is shorter than A. B is taller than C. Who is shortest?", opts: ["A","B","C","Cannot say"], ans: 2 },
  { q: "What comes next? Z, X, V, T, ?", opts: ["S","R","Q","P"], ans: 1 },
  { q: "If 5 machines make 5 widgets in 5 minutes, how long for 100 machines to make 100 widgets?", opts: ["100 min","50 min","5 min","10 min"], ans: 2 },
  { q: "Mirror image: which letter looks the same when flipped horizontally?", opts: ["F","G","H","J"], ans: 2 },
  { q: "3² + 4² = ?", opts: ["25","49","14","20"], ans: 0 },
  { q: "Which is the odd one out? Apple, Banana, Carrot, Mango", opts: ["Apple","Banana","Carrot","Mango"], ans: 2 },
  { q: "A train travels 60 km in 45 min. Speed in km/h?", opts: ["60","80","90","75"], ans: 1 },
  { q: "Complete: 2, 6, 12, 20, 30, ?", opts: ["40","42","44","46"], ans: 1 },
  { q: "How many triangles in a Star of David?", opts: ["6","8","10","12"], ans: 1 },
  { q: "Which fraction is largest? 3/4, 5/8, 7/10, 2/3", opts: ["3/4","5/8","7/10","2/3"], ans: 0 },
  { q: "A man walks 3 km north, 4 km east. Distance from start?", opts: ["5 km","7 km","6 km","4 km"], ans: 0 },
  { q: "What is 15% of 200?", opts: ["25","30","35","40"], ans: 1 },
  { q: "Complete: J, F, M, A, M, J, ?", opts: ["A","J","S","O"], ans: 3 },
  { q: "If today is Wednesday, what day is 100 days from now?", opts: ["Monday","Tuesday","Friday","Thursday"], ans: 3 },
  { q: "Which word is the antonym of BENEVOLENT?", opts: ["Kind","Malevolent","Generous","Gentle"], ans: 1 },
  { q: "A cube has how many edges?", opts: ["8","10","12","6"], ans: 2 },
  { q: "What is 12 × 13?", opts: ["144","156","148","152"], ans: 1 },
  { q: "Which is the next prime after 13?", opts: ["14","15","17","19"], ans: 2 },
  { q: "If a = 2 and b = 3, what is a^b + b^a?", opts: ["13","17","14","16"], ans: 0 },
  { q: "How many seconds in 2.5 hours?", opts: ["7200","8000","9000","9500"], ans: 2 },
  { q: "What is the square root of 196?", opts: ["12","13","14","15"], ans: 2 },
  { q: "Complete: 1, 4, 9, 16, 25, ?", opts: ["30","36","42","49"], ans: 1 },
  { q: "Which is heavier: 1 kg of iron or 1 kg of feathers?", opts: ["Iron","Feathers","Same","Depends"], ans: 2 },
];

const TOTAL_TIME = 25 * 40;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getIQBand(score) {
  if (score >= 23) return { label: "Genius",        color: "#7C3AED", desc: "Top 2% — exceptional reasoning ability." };
  if (score >= 20) return { label: "Superior",      color: "#2563EB", desc: "Top 10% — well above average intelligence." };
  if (score >= 16) return { label: "Above Average", color: "#059669", desc: "Top 25% — strong analytical skills." };
  if (score >= 11) return { label: "Average",       color: "#D97706", desc: "Solid performance — room to grow." };
  return              { label: "Below Average",  color: "#DC2626", desc: "Keep practising — you'll improve!" };
}

export default function IQGame() {
  const [phase, setPhase]       = useState("intro"); // intro | playing | paused | result
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const timer = useRef();

  const startGame = () => {
    const q = shuffle(ALL_QUESTIONS).slice(0, 25);
    setQuestions(q);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setTimeLeft(TOTAL_TIME);
    setPhase("playing");
  };

  const finish = useCallback((ans) => {
    clearInterval(timer.current);
    setAnswers(ans);
    setPhase("result");
  }, []);

  useEffect(() => {
    if (phase !== "playing") { clearInterval(timer.current); return; }
    timer.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer.current); finish(answers); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [phase, finish]);

  const pause  = () => setPhase("paused");
  const resume = () => setPhase("playing");

  const pick = (idx) => {
    if (selected !== null || phase !== "playing") return;
    setSelected(idx);
    const next = [...answers, idx];
    setTimeout(() => {
      if (current + 1 >= questions.length) { finish(next); }
      else { setAnswers(next); setCurrent(c => c + 1); setSelected(null); }
    }, 600);
  };

  const score = answers.filter((a, i) => a === questions[i]?.ans).length;
  const pct   = Math.round((timeLeft / TOTAL_TIME) * 100);
  const mins  = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs  = String(timeLeft % 60).padStart(2, "0");

  if (phase === "intro") return (
    <div className="pg-page">
      <Link to="/prep" className="pg-back">← Back to Prep Hub</Link>
      <div className="pg-intro-card" style={{ "--c": "#2563EB", "--cl": "#EFF6FF" }}>
        <div className="pg-intro-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14Z"/>
          </svg>
        </div>
        <h1>IQ Level Game</h1>
        <p>25 randomly selected questions covering logical reasoning, number patterns, spatial thinking and verbal ability.</p>
        <ul className="pg-rules">
          <li>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "6px" }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Total time: <strong>~17 minutes</strong> (40s per question)
          </li>
          <li>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "6px" }}>
              <polyline points="16 3 21 3 21 8"/><path d="M4 20 21 3"/><polyline points="21 16 21 21 16 21"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/>
            </svg>
            Questions are shuffled every session
          </li>
          <li>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "6px" }}>
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
            You can pause and resume anytime
          </li>
          <li>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "6px" }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Each correct answer = 1 point
          </li>
          <li>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "6px" }}>
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Your IQ band is shown at the end
          </li>
        </ul>
        <button className="pg-btn-start" style={{ background: "#2563EB" }} onClick={startGame}>Start IQ Test →</button>
      </div>
    </div>
  );

  if (phase === "result") {
    const band = getIQBand(score);
    return (
      <div className="pg-page">
        <Link to="/prep" className="pg-back">← Back to Prep Hub</Link>
        <div className="pg-result-card">
          <div className="pg-result-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14Z"/>
            </svg>
          </div>
          <h2>Your IQ Band</h2>
          <div className="pg-iq-band" style={{ color: band.color, borderColor: band.color }}>{band.label}</div>
          <p className="pg-band-desc">{band.desc}</p>
          <div className="pg-score-row">
            <div className="pg-score-box"><strong>{score}</strong><span>Correct</span></div>
            <div className="pg-score-box"><strong>{questions.length - score}</strong><span>Wrong</span></div>
            <div className="pg-score-box"><strong>{Math.round((score / questions.length) * 100)}%</strong><span>Score</span></div>
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
          <button className="pg-btn-start" style={{ background: "#2563EB" }} onClick={startGame}>Try Again (New Questions)</button>
        </div>
      </div>
    );
  }

  if (phase === "paused") {
    return (
      <div className="pg-page">
        <div className="pg-paused-card">
          <div className="pg-paused-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          </div>
          <h2>Test Paused</h2>
          <p>Q {current + 1} of {questions.length} · {mins}:{secs} remaining</p>
          <button className="pg-btn-start" style={{ background: "#2563EB" }} onClick={resume}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "4px" }}>
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Resume Test
          </button>
          <button className="pg-btn-quit" onClick={startGame}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "4px" }}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Restart with New Questions
          </button>
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
            <div className="pg-timer-fill" style={{ width: `${pct}%`, background: pct < 20 ? "#DC2626" : "#2563EB" }} />
          </div>
          <span className="pg-timer-text" style={{ color: pct < 20 ? "#DC2626" : "var(--dark)" }}>{mins}:{secs}</span>
        </div>
        <button className="pg-btn-pause" onClick={pause}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "4px" }}>
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
          Pause
        </button>
      </div>
      <div className="pg-question-card" style={{ "--c": "#2563EB", "--cl": "#EFF6FF" }}>
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
