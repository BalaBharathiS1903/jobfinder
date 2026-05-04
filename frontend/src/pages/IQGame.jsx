import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./PrepGame.css";

const QUESTIONS = [
  { q: "2, 4, 8, 16, ?", opts: ["24","32","28","20"], ans: 1 },
  { q: "Which number is odd one out? 3, 5, 7, 9, 11", opts: ["3","9","11","5"], ans: 1 },
  { q: "If all Bloops are Razzles and all Razzles are Lazzles, are all Bloops definitely Lazzles?", opts: ["Yes","No","Maybe","Cannot say"], ans: 0 },
  { q: "A clock shows 3:15. What is the angle between the hands?", opts: ["0°","7.5°","15°","22.5°"], ans: 1 },
  { q: "1, 1, 2, 3, 5, 8, ?", opts: ["11","12","13","14"], ans: 2 },
  { q: "If you rearrange CIFAIPC you get a name of:", opts: ["Ocean","Country","City","Animal"], ans: 1 },
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
  { q: "If FRIEND = GSJFOE, what does ENEMY = ?", opts: ["FOFNZ","FNFNZ","FOFOZ","FOFNY"], ans: 0 },
  { q: "How many triangles in a Star of David?", opts: ["6","8","10","12"], ans: 1 },
  { q: "Which fraction is largest? 3/4, 5/8, 7/10, 2/3", opts: ["3/4","5/8","7/10","2/3"], ans: 0 },
  { q: "A man walks 3 km north, 4 km east. Distance from start?", opts: ["5 km","7 km","6 km","4 km"], ans: 0 },
  { q: "What is 15% of 200?", opts: ["25","30","35","40"], ans: 1 },
  { q: "Complete: J, F, M, A, M, J, ?", opts: ["A","J","S","O"], ans: 3 },
  { q: "If today is Wednesday, what day is 100 days from now?", opts: ["Monday","Tuesday","Friday","Thursday"], ans: 3 },
  { q: "Which word is the antonym of BENEVOLENT?", opts: ["Kind","Malevolent","Generous","Gentle"], ans: 1 },
  { q: "A cube has how many edges?", opts: ["8","10","12","6"], ans: 2 },
];

const TOTAL_TIME = 25 * 40; // 40s per question

function getIQBand(score) {
  if (score >= 23) return { label: "Genius", color: "#7C3AED", desc: "Top 2% — exceptional reasoning ability." };
  if (score >= 20) return { label: "Superior", color: "#2563EB", desc: "Top 10% — well above average intelligence." };
  if (score >= 16) return { label: "Above Average", color: "#059669", desc: "Top 25% — strong analytical skills." };
  if (score >= 11) return { label: "Average", color: "#D97706", desc: "Solid performance — room to grow." };
  return { label: "Below Average", color: "#DC2626", desc: "Keep practising — you'll improve!" };
}

export default function IQGame() {
  const [phase, setPhase] = useState("intro"); // intro | playing | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const timer = useRef();

  useEffect(() => {
    if (phase !== "playing") return;
    timer.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer.current); finish(answers); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [phase]);

  const finish = (ans) => { clearInterval(timer.current); setAnswers(ans); setPhase("result"); };

  const pick = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const next = [...answers, idx];
    setTimeout(() => {
      if (current + 1 >= QUESTIONS.length) { finish(next); }
      else { setAnswers(next); setCurrent(c => c + 1); setSelected(null); }
    }, 600);
  };

  const restart = () => { setCurrent(0); setAnswers([]); setSelected(null); setTimeLeft(TOTAL_TIME); setPhase("intro"); };

  const score = answers.filter((a, i) => a === QUESTIONS[i].ans).length;
  const pct = Math.round((timeLeft / TOTAL_TIME) * 100);
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  if (phase === "intro") return (
    <div className="pg-page">
      <Link to="/prep" className="pg-back">← Back to Prep Hub</Link>
      <div className="pg-intro-card" style={{ "--c": "#7C3AED", "--cl": "#F5F3FF" }}>
        <div className="pg-intro-icon">🧠</div>
        <h1>IQ Level Game</h1>
        <p>25 questions covering logical reasoning, number patterns, spatial thinking and verbal ability.</p>
        <ul className="pg-rules">
          <li>⏱ Total time: <strong>~17 minutes</strong> (40s per question)</li>
          <li>✅ Each correct answer = 1 point</li>
          <li>🚫 No negative marking</li>
          <li>📊 Your IQ band is shown at the end</li>
        </ul>
        <button className="pg-btn-start" style={{ background: "#7C3AED" }} onClick={() => setPhase("playing")}>
          Start IQ Test →
        </button>
      </div>
    </div>
  );

  if (phase === "result") {
    const band = getIQBand(score);
    return (
      <div className="pg-page">
        <Link to="/prep" className="pg-back">← Back to Prep Hub</Link>
        <div className="pg-result-card">
          <div className="pg-result-icon">🧠</div>
          <h2>Your IQ Band</h2>
          <div className="pg-iq-band" style={{ color: band.color, borderColor: band.color }}>{band.label}</div>
          <p className="pg-band-desc">{band.desc}</p>
          <div className="pg-score-row">
            <div className="pg-score-box"><strong>{score}</strong><span>Correct</span></div>
            <div className="pg-score-box"><strong>{QUESTIONS.length - score}</strong><span>Wrong</span></div>
            <div className="pg-score-box"><strong>{Math.round((score / QUESTIONS.length) * 100)}%</strong><span>Score</span></div>
          </div>
          <div className="pg-review">
            {QUESTIONS.map((q, i) => (
              <div key={i} className={`pg-review-item ${answers[i] === q.ans ? "correct" : "wrong"}`}>
                <span className="pg-review-num">Q{i + 1}</span>
                <span className="pg-review-q">{q.q}</span>
                <span className="pg-review-ans">{answers[i] === q.ans ? "✓" : `✗ → ${q.opts[q.ans]}`}</span>
              </div>
            ))}
          </div>
          <button className="pg-btn-start" style={{ background: "#7C3AED" }} onClick={restart}>Try Again</button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[current];
  return (
    <div className="pg-page">
      <div className="pg-play-header">
        <span className="pg-qcount">Q {current + 1} / {QUESTIONS.length}</span>
        <div className="pg-timer-wrap">
          <div className="pg-timer-bar"><div className="pg-timer-fill" style={{ width: `${pct}%`, background: pct < 20 ? "#DC2626" : "#7C3AED" }} /></div>
          <span className="pg-timer-text" style={{ color: pct < 20 ? "#DC2626" : "var(--dark)" }}>{mins}:{secs}</span>
        </div>
      </div>
      <div className="pg-question-card" style={{ "--c": "#7C3AED", "--cl": "#F5F3FF" }}>
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
