import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import api from "../lib/api";
import "./ResumeBuilder.css";

const SKILL_LIST = [
  "Python","JavaScript","TypeScript","Java","C++","C#","Go","Rust","Ruby","PHP","Swift","Kotlin","Scala","R","SQL","Bash","HTML","CSS","Dart",
  "React","Vue","Angular","Next.js","Node.js","Express","Django","Flask","FastAPI","Spring Boot","Laravel","Flutter","Tailwind CSS","Bootstrap","GraphQL","REST API","Svelte",
  "Git","GitHub","GitLab","Docker","Kubernetes","AWS","Azure","GCP","Terraform","Linux","MySQL","PostgreSQL","MongoDB","Redis","SQLite","Figma","Jira","Jenkins","Nginx","Postman","Elasticsearch","Kafka","Celery","Webpack","Vite",
  "NumPy","Pandas","Matplotlib","Seaborn","Scikit-learn","TensorFlow","PyTorch","Power BI","Tableau","Excel",
  "Communication","Leadership","Teamwork","Problem Solving","Agile","Scrum","Time Management","Critical Thinking",
];

const TEMPLATES = [
  { id: "modern",   name: "Modern",   desc: "Clean two-column layout with accent color",      color: "#2563EB" },
  { id: "classic",  name: "Classic",  desc: "Traditional single-column professional format",  color: "#0F172A" },
  { id: "minimal",  name: "Minimal",  desc: "Simple and elegant with lots of white space",    color: "#64748B" },
  { id: "creative", name: "Creative", desc: "Bold header with sidebar for skills",            color: "#7C3AED" },
];

export default function ResumeBuilder() {
  const location = useLocation();
  const incomingState = location.state || {};
  const incoming = (incomingState.missingSkills || []).filter(s => typeof s === "string" && s.trim());

  const [step, setStep]               = useState(incoming.length ? 2 : 1);
  const [template, setTemplate]       = useState("classic");
  const [source, setSource]           = useState("manual");
  const [selectedResume, setSelectedResume] = useState("");
  const [kwBanner, setKwBanner]       = useState(!!incoming.length);
  const [savedItems, setSavedItems]   = useState({});
  const [customSections, setCustomSections] = useState([]);

  const [data, setData] = useState({
    name: "", headline: incomingState.jobTitle || "", email: "", phone: "",
    location: "", linkedin: "", github: "", summary: "", photo: "",
    experience: [], education: [], skills: incoming, certifications: [], projects: [],
  });

  useEffect(() => {
    if (!incoming.length) return;
    setData(d => ({
      ...d,
      headline: d.headline || incomingState.jobTitle || "",
      skills: [...new Set([...d.skills, ...incoming])],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: resumes = [] } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get("/resume/").then(r => r.data),
  });
  const { data: profile } = useQuery({
    queryKey: ["myprofile"],
    queryFn: () => api.get("/profile/").then(r => r.data),
  });

  const loadFromSource = () => {
    if (source === "profile" && profile) {
      setData({
        name: profile.full_name || "", headline: profile.headline || "",
        email: profile.email || "", phone: profile.phone || "",
        location: profile.location || "", linkedin: profile.linkedin || "",
        github: profile.github || "", summary: profile.summary || "", photo: "",
        experience: profile.experience || [], education: profile.education || [],
        skills: (profile.skills || []).map(s => s.name || s),
        certifications: profile.certifications || [], projects: profile.projects || [],
      });
    } else if (source === "resume" && selectedResume) {
      const r = resumes.find(x => x.id === parseInt(selectedResume));
      if (r) setData(d => ({ ...d, name: r.name || "", email: r.email || "", phone: r.phone || "", skills: r.skills || [] }));
    }
    setStep(2);
  };

  const set       = (f, v) => setData(d => ({ ...d, [f]: v }));
  const addArr    = (f, item) => setData(d => ({ ...d, [f]: [...(d[f] || []), item] }));
  const removeArr = (f, i) => setData(d => ({ ...d, [f]: d[f].filter((_, idx) => idx !== i) }));
  const updateArr = (f, i, v) => setData(d => ({ ...d, [f]: d[f].map((x, idx) => idx === i ? v : x) }));
  const saveItem  = (f, i) => setSavedItems(p => ({ ...p, [`${f}-${i}`]: true }));
  const editItem  = (f, i) => setSavedItems(p => ({ ...p, [`${f}-${i}`]: false }));
  const isSaved   = (f, i) => !!savedItems[`${f}-${i}`];

  return (
    <div className="rb-page">
      <div className="rb-header">
        <h1>Resume Builder</h1>
        <p>Build a professional resume in minutes using templates</p>
      </div>

      <div className="rb-steps">
        {["Choose Template", "Fill Details", "Preview & Download"].map((s, i) => (
          <div key={i} className={`rb-step-item ${step === i+1 ? "active" : step > i+1 ? "done" : ""}`}>
            <div className="rb-step-dot">{step > i+1 ? "✓" : i+1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div>
          <div className="rb-card">
            <h3>Choose a Template</h3>
            <div className="rb-templates">
              {TEMPLATES.map(t => (
                <div key={t.id} className={`rb-template-card ${template === t.id ? "selected" : ""}`} onClick={() => setTemplate(t.id)}>
                  <div className="rb-template-preview" style={{ borderColor: t.color }}>
                    <div className="rb-tp-header" style={{ background: t.color }} />
                    <div className="rb-tp-lines">
                      <div className="rb-tp-line long" /><div className="rb-tp-line medium" />
                      <div className="rb-tp-line short" /><div className="rb-tp-line long" />
                    </div>
                  </div>
                  <div className="rb-template-info"><strong>{t.name}</strong><p>{t.desc}</p></div>
                  {template === t.id && <div className="rb-template-check">✓</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="rb-card">
            <h3>Import Data (Optional)</h3>
            <div className="rb-source-options">
              {[["manual","Start from scratch"],["profile","Import from My Profile"],["resume","Import from uploaded resume"]].map(([val, label]) => (
                <label key={val} className={`rb-source-opt ${source === val ? "active" : ""}`}>
                  <input type="radio" name="source" value={val} checked={source === val} onChange={() => setSource(val)} />
                  {label}
                </label>
              ))}
            </div>
            {source === "resume" && (
              <select className="rb-select" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                <option value="">Select resume…</option>
                {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}</option>)}
              </select>
            )}
          </div>
          <button className="rb-btn-primary" disabled={!template} onClick={loadFromSource}>Continue to Fill Details →</button>
        </div>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <div>
          {/* Personal */}
          <div className="rb-card">
            <h3>Personal Information</h3>
            <div className="rb-photo-row">
              <div className="rb-photo-wrap">
                {data.photo
                  ? <img src={data.photo} alt="Profile" className="rb-photo-img" />
                  : <div className="rb-photo-placeholder">{data.name ? data.name.slice(0,2).toUpperCase() : "📷"}</div>
                }
                <label className="rb-photo-btn">
                  {data.photo ? "Change" : "Upload Photo"}
                  <input type="file" accept="image/*" hidden onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => set("photo", ev.target.result);
                    reader.readAsDataURL(file);
                  }} />
                </label>
                {data.photo && <button className="rb-photo-remove" onClick={() => set("photo", "")}>Remove</button>}
              </div>
              <div className="rb-grid2" style={{ flex: 1 }}>
                <RF label="Full Name" value={data.name}     onChange={v => set("name", v)}     ph="John Doe" />
                <RF label="Headline"  value={data.headline} onChange={v => set("headline", v)} ph="Software Engineer" />
                <RF label="Email"     value={data.email}    onChange={v => set("email", v)}    ph="john@email.com" />
                <RF label="Phone"     value={data.phone}    onChange={v => set("phone", v)}    ph="+91 9999999999" />
                <RF label="Location"  value={data.location} onChange={v => set("location", v)} ph="Chennai, India" />
                <RF label="LinkedIn"  value={data.linkedin} onChange={v => set("linkedin", v)} ph="linkedin.com/in/username" />
              </div>
            </div>
            <RF label="Professional Summary" value={data.summary} onChange={v => set("summary", v)} ph="Brief professional summary…" area rows={4} />
          </div>

          {/* Skills */}
          <div className="rb-card">
            <h3>Skills</h3>
            {kwBanner && (
              <div className="rb-kw-banner">
                <span>🎯 <strong>{incoming.length} missing skill{incoming.length !== 1 ? "s" : ""}</strong> from <em>{incomingState.jobTitle || "your job match"}</em> pre-filled below.</span>
                <button className="rb-kw-dismiss" onClick={() => setKwBanner(false)}>✕</button>
              </div>
            )}
            <SkillSelector skills={data.skills.filter(Boolean)} onChange={v => set("skills", v)} />
          </div>

          {/* Work Experience */}
          <div className="rb-card">
            <h3>Work Experience</h3>
            {data.experience.length === 0 ? (
              <div className="rb-empty-state">
                <span className="rb-empty-icon">💼</span>
                <p className="rb-empty-title">No work experience added</p>
                <p className="rb-empty-sub">Add your job title, company, dates and key responsibilities.</p>
                <button className="rb-empty-btn" onClick={() => addArr("experience", { title:"", company:"", start:"", end:"", description:"" })}>+ Add Work Experience</button>
              </div>
            ) : (
              <>
                {data.experience.map((e, i) => (
                  <div key={i} className={`rb-item${isSaved("experience",i) ? " rb-item-saved" : ""}`}>
                    <div className="rb-item-top">
                      <span className="rb-item-label">
                        {isSaved("experience",i)
                          ? <><span className="rb-saved-tick">✓</span> {e.title||"Job Title"}{e.company?` @ ${e.company}`:""}{e.start?` (${e.start}${e.end?` – ${e.end}`:""})`:""}  </>
                          : "Filling details…"}
                      </span>
                      <div className="rb-item-actions">
                        {isSaved("experience",i)
                          ? <button className="rb-btn-edit" onClick={() => editItem("experience",i)}>✏️ Edit</button>
                          : <button className="rb-btn-save-entry" onClick={() => saveItem("experience",i)}>✓ Save Entry</button>}
                        <button className="rb-btn-remove" onClick={() => removeArr("experience",i)}>Remove</button>
                      </div>
                    </div>
                    {!isSaved("experience",i) && (
                      <>
                        <div className="rb-grid2">
                          <RF label="Job Title" value={e.title   ||""} onChange={v => updateArr("experience",i,{...e,title:v})}   ph="Software Engineer" />
                          <RF label="Company"   value={e.company ||""} onChange={v => updateArr("experience",i,{...e,company:v})} ph="TCS" />
                          <RF label="Start"     value={e.start   ||""} onChange={v => updateArr("experience",i,{...e,start:v})}   ph="Jan 2022" />
                          <RF label="End"       value={e.end     ||""} onChange={v => updateArr("experience",i,{...e,end:v})}     ph="Present" />
                        </div>
                        <RF label="Description" value={e.description||""} onChange={v => updateArr("experience",i,{...e,description:v})} ph="Key responsibilities…" area rows={3} />
                        <button className="rb-btn-save-entry rb-btn-save-bottom" onClick={() => saveItem("experience",i)}>✓ Save Entry</button>
                      </>
                    )}
                  </div>
                ))}
                <AddBtn onClick={() => addArr("experience",{title:"",company:"",start:"",end:"",description:""})} label="Add Another Experience" icon="💼" />
              </>
            )}
          </div>

          {/* Education */}
          <div className="rb-card">
            <h3>Education</h3>
            {data.education.length === 0 ? (
              <div className="rb-empty-state">
                <span className="rb-empty-icon">🎓</span>
                <p className="rb-empty-title">No education added</p>
                <p className="rb-empty-sub">Add your degree, institution and years of study.</p>
                <button className="rb-empty-btn" onClick={() => addArr("education",{degree:"",institution:"",start:"",end:""})}>+ Add Education</button>
              </div>
            ) : (
              <>
                {data.education.map((e, i) => (
                  <div key={i} className={`rb-item${isSaved("education",i) ? " rb-item-saved" : ""}`}>
                    <div className="rb-item-top">
                      <span className="rb-item-label">
                        {isSaved("education",i)
                          ? <><span className="rb-saved-tick">✓</span> {e.degree||"Degree"}{e.institution?` — ${e.institution}`:""}{e.start?` (${e.start}${e.end?` – ${e.end}`:""})`:""}  </>
                          : "Filling details…"}
                      </span>
                      <div className="rb-item-actions">
                        {isSaved("education",i)
                          ? <button className="rb-btn-edit" onClick={() => editItem("education",i)}>✏️ Edit</button>
                          : <button className="rb-btn-save-entry" onClick={() => saveItem("education",i)}>✓ Save Entry</button>}
                        <button className="rb-btn-remove" onClick={() => removeArr("education",i)}>Remove</button>
                      </div>
                    </div>
                    {!isSaved("education",i) && (
                      <>
                        <div className="rb-grid2">
                          <RF label="Degree"      value={e.degree     ||""} onChange={v => updateArr("education",i,{...e,degree:v})}      ph="B.Tech Computer Science" />
                          <RF label="Institution" value={e.institution||""} onChange={v => updateArr("education",i,{...e,institution:v})} ph="Anna University" />
                          <RF label="Start Year"  value={e.start      ||""} onChange={v => updateArr("education",i,{...e,start:v})}       ph="2019" />
                          <RF label="End Year"    value={e.end        ||""} onChange={v => updateArr("education",i,{...e,end:v})}         ph="2023" />
                        </div>
                        <button className="rb-btn-save-entry rb-btn-save-bottom" onClick={() => saveItem("education",i)}>✓ Save Entry</button>
                      </>
                    )}
                  </div>
                ))}
                <AddBtn onClick={() => addArr("education",{degree:"",institution:"",start:"",end:""})} label="Add Another Education" icon="🎓" />
              </>
            )}
          </div>

          {/* Certifications */}
          <div className="rb-card">
            <h3>Certifications</h3>
            {data.certifications.length === 0 ? (
              <div className="rb-empty-state">
                <span className="rb-empty-icon">🏅</span>
                <p className="rb-empty-title">No certifications added</p>
                <p className="rb-empty-sub">Add AWS, Google, Microsoft or any professional certifications.</p>
                <button className="rb-empty-btn" onClick={() => addArr("certifications",{name:"",issuer:"",date:"",url:""})}>+ Add Certification</button>
              </div>
            ) : (
              <>
                {data.certifications.map((c, i) => (
                  <div key={i} className={`rb-item${isSaved("certifications",i) ? " rb-item-saved" : ""}`}>
                    <div className="rb-item-top">
                      <span className="rb-item-label">
                        {isSaved("certifications",i)
                          ? <><span className="rb-saved-tick">✓</span> {c.name||"Certificate"}{c.issuer?` — ${c.issuer}`:""}  </>
                          : "Filling details…"}
                      </span>
                      <div className="rb-item-actions">
                        {isSaved("certifications",i)
                          ? <button className="rb-btn-edit" onClick={() => editItem("certifications",i)}>✏️ Edit</button>
                          : <button className="rb-btn-save-entry" onClick={() => saveItem("certifications",i)}>✓ Save Entry</button>}
                        <button className="rb-btn-remove" onClick={() => removeArr("certifications",i)}>Remove</button>
                      </div>
                    </div>
                    {!isSaved("certifications",i) && (
                      <>
                        <div className="rb-grid2">
                          <RF label="Certificate" value={c.name  ||""} onChange={v => updateArr("certifications",i,{...c,name:v})}   ph="AWS Certified Developer" />
                          <RF label="Issuer"      value={c.issuer||""} onChange={v => updateArr("certifications",i,{...c,issuer:v})} ph="Amazon" />
                          <RF label="Date"        value={c.date  ||""} onChange={v => updateArr("certifications",i,{...c,date:v})}   ph="March 2023" />
                          <RF label="URL"         value={c.url   ||""} onChange={v => updateArr("certifications",i,{...c,url:v})}    ph="https://credential.link" />
                        </div>
                        <button className="rb-btn-save-entry rb-btn-save-bottom" onClick={() => saveItem("certifications",i)}>✓ Save Entry</button>
                      </>
                    )}
                  </div>
                ))}
                <AddBtn onClick={() => addArr("certifications",{name:"",issuer:"",date:"",url:""})} label="Add Another Certification" icon="🏅" />
              </>
            )}
          </div>

          {/* Projects */}
          <div className="rb-card">
            <h3>Projects</h3>
            {data.projects.length === 0 ? (
              <div className="rb-empty-state">
                <span className="rb-empty-icon">🛠️</span>
                <p className="rb-empty-title">No projects added</p>
                <p className="rb-empty-sub">Showcase your personal or professional projects with tech stack and links.</p>
                <button className="rb-empty-btn" onClick={() => addArr("projects",{name:"",tech:"",url:"",description:""})}>+ Add Project</button>
              </div>
            ) : (
              <>
                {data.projects.map((p, i) => (
                  <div key={i} className={`rb-item${isSaved("projects",i) ? " rb-item-saved" : ""}`}>
                    <div className="rb-item-top">
                      <span className="rb-item-label">
                        {isSaved("projects",i)
                          ? <><span className="rb-saved-tick">✓</span> {p.name||"Project"}{p.tech?` — ${p.tech}`:""}</>
                          : "Filling details…"}
                      </span>
                      <div className="rb-item-actions">
                        {isSaved("projects",i)
                          ? <button className="rb-btn-edit" onClick={() => editItem("projects",i)}>✏️ Edit</button>
                          : <button className="rb-btn-save-entry" onClick={() => saveItem("projects",i)}>✓ Save Entry</button>}
                        <button className="rb-btn-remove" onClick={() => removeArr("projects",i)}>Remove</button>
                      </div>
                    </div>
                    {!isSaved("projects",i) && (
                      <>
                        <div className="rb-grid2">
                          <RF label="Project Name" value={p.name||""} onChange={v => updateArr("projects",i,{...p,name:v})} ph="Job Finder App" />
                          <RF label="Tech Stack"   value={p.tech||""} onChange={v => updateArr("projects",i,{...p,tech:v})} ph="React, Django, PostgreSQL" />
                          <RF label="Live URL"     value={p.url ||""} onChange={v => updateArr("projects",i,{...p,url:v})}  ph="https://yourproject.com" />
                          <RF label="GitHub URL"   value={p.github||""} onChange={v => updateArr("projects",i,{...p,github:v})} ph="https://github.com/…" />
                        </div>
                        <RF label="Description" value={p.description||""} onChange={v => updateArr("projects",i,{...p,description:v})} ph="What the project does and your contribution…" area rows={3} />
                        <button className="rb-btn-save-entry rb-btn-save-bottom" onClick={() => saveItem("projects",i)}>✓ Save Entry</button>
                      </>
                    )}
                  </div>
                ))}
                <AddBtn onClick={() => addArr("projects",{name:"",tech:"",url:"",github:"",description:""})} label="Add Another Project" icon="🛠️" />
              </>
            )}
          </div>

          {/* Custom Sections */}
          {customSections.map((sec, si) => (
            <div key={si} className="rb-card">
              <div className="rb-custom-header">
                <input
                  className="rb-custom-title-input"
                  value={sec.title}
                  onChange={e => setCustomSections(p => p.map((s, idx) => idx === si ? { ...s, title: e.target.value } : s))}
                  placeholder="Section title (e.g. Achievements, Hobbies)"
                />
                <button className="rb-btn-remove" onClick={() => setCustomSections(p => p.filter((_, idx) => idx !== si))}>Remove Section</button>
              </div>
              <textarea
                className="rb-custom-body"
                rows={5}
                value={sec.content}
                onChange={e => setCustomSections(p => p.map((s, idx) => idx === si ? { ...s, content: e.target.value } : s))}
                placeholder="Enter content for this section… (one item per line)"
              />
            </div>
          ))}

          {/* Add Custom Section */}
          <button className="rb-btn-add-section" onClick={() => setCustomSections(p => [...p, { title: "", content: "" }])}>
            <span>&#43;</span> Add Custom Section
          </button>

          <div className="rb-nav-btns">
            <button className="rb-btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button className="rb-btn-primary" onClick={() => setStep(3)}>Preview Resume →</button>
          </div>
        </div>
      )}

      {/* ── Step 3 ── */}
      {step === 3 && (
        <div>
          <div className="rb-preview-actions">
            <button className="rb-btn-outline" onClick={() => setStep(2)}>← Edit</button>
            <button className="rb-btn-primary" onClick={() => window.print()}>Download / Print</button>
          </div>
          <div className={`rb-resume-preview rb-template-${template}`} id="resume-print">
            <ResumePreview data={data} customSections={customSections} />
          </div>
        </div>
      )}
    </div>
  );
}

function SkillSelector({ skills, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);

  const filtered = query.trim()
    ? SKILL_LIST.filter(s => s.toLowerCase().includes(query.toLowerCase()) && !skills.includes(s)).slice(0,8)
    : SKILL_LIST.filter(s => !skills.includes(s)).slice(0,8);

  const add = (skill) => { if (!skills.includes(skill)) onChange([...skills, skill]); setQuery(""); setOpen(false); };
  const addCustom = () => { const v = query.trim(); if (v && !skills.includes(v)) onChange([...skills, v]); setQuery(""); setOpen(false); };
  const remove = (skill) => onChange(skills.filter(s => s !== skill));

  return (
    <div className="rb-skill-selector">
      {skills.length > 0 && (
        <div className="rb-skill-tags">
          {skills.map(s => (
            <span key={s} className="rb-skill-tag">{s}<button onClick={() => remove(s)}>×</button></span>
          ))}
        </div>
      )}
      <div className="rb-skill-input-wrap">
        <input className="rb-skill-input" placeholder="Search or type a skill…" value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} />
        <span className="rb-skill-arrow">{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className="rb-skill-dropdown">
          {filtered.map(s => <button key={s} className="rb-skill-option" onMouseDown={() => add(s)}>{s}</button>)}
          {query.trim() && !SKILL_LIST.some(s => s.toLowerCase() === query.toLowerCase()) && (
            <button className="rb-skill-option rb-skill-custom" onMouseDown={addCustom}>+ Add "{query.trim()}"</button>
          )}
          {filtered.length === 0 && !query.trim() && <p className="rb-skill-empty">All common skills added. Type to search more.</p>}
        </div>
      )}
    </div>
  );
}

function ResumePreview({ data, customSections }) {
  const contactParts = [data.email, data.phone, data.location, data.linkedin].filter(Boolean);
  return (
    <div className="rp-wrap">
      <div className="rp-header">
        {data.photo && <img src={data.photo} alt="Profile" className="rp-photo" />}
        <h1>{data.name || "Your Name"}</h1>
        {data.headline && <p className="rp-headline">{data.headline}</p>}
        {contactParts.length > 0 && <p className="rp-contact">{contactParts.join(" | ")}</p>}
      </div>
      {data.summary && <Section title="Professional Summary"><p className="rp-summary">{data.summary}</p></Section>}
      {data.skills?.filter(Boolean).length > 0 && (
        <Section title="Skills"><p className="rp-skills-text">{data.skills.filter(Boolean).join(" • ")}</p></Section>
      )}
      {data.experience?.length > 0 && (
        <Section title="Work Experience">
          {data.experience.map((e, i) => (
            <div key={i} className="rp-item">
              <div className="rp-item-header">
                <strong>{e.title}{e.company ? `, ${e.company}` : ""}</strong>
                <span>{e.start}{e.end ? ` – ${e.end}` : ""}</span>
              </div>
              {e.description && (
                <ul className="rp-bullets">
                  {e.description.split("\n").filter(Boolean).map((line, j) => (
                    <li key={j}>{line.replace(/^[-•*]\s*/, "")}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}
      {data.education?.length > 0 && (
        <Section title="Education">
          {data.education.map((e, i) => (
            <div key={i} className="rp-item">
              <div className="rp-item-header">
                <strong>{e.degree}{e.institution ? `, ${e.institution}` : ""}</strong>
                <span>{e.start}{e.end ? ` – ${e.end}` : ""}</span>
              </div>
            </div>
          ))}
        </Section>
      )}
      {data.certifications?.length > 0 && (
        <Section title="Certifications">
          {data.certifications.map((c, i) => (
            <div key={i} className="rp-item">
              <div className="rp-item-header">
                <strong>{c.name}{c.issuer ? ` — ${c.issuer}` : ""}</strong>
                <span>{c.date}</span>
              </div>
            </div>
          ))}
        </Section>
      )}
      {data.projects?.length > 0 && (
        <Section title="Projects">
          {data.projects.map((p, i) => (
            <div key={i} className="rp-item">
              <div className="rp-item-header">
                <strong>{p.name}</strong>
                <span>{p.tech}</span>
              </div>
              {p.description && (
                <ul className="rp-bullets">
                  {p.description.split("\n").filter(Boolean).map((line, j) => (
                    <li key={j}>{line.replace(/^[-•*]\s*/, "")}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}
      {customSections?.filter(s => s.title || s.content).map((sec, i) => (
        <Section key={i} title={sec.title || "Custom Section"}>
          <ul className="rp-bullets">
            {sec.content.split("\n").filter(Boolean).map((line, j) => (
              <li key={j}>{line.replace(/^[-•*]\s*/, "")}</li>
            ))}
          </ul>
        </Section>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return <div className="rp-section"><h2 className="rp-section-title">{title}</h2>{children}</div>;
}

function AddBtn({ onClick, label, icon }) {
  return (
    <button className="rb-btn-add" onClick={onClick}>
      <span className="rb-btn-add-icon">{icon || "+"}</span>+ {label}
     </button>
  );
}

function RF({ label, value, onChange, ph, type = "text", area, rows }) {
  return (
    <div className="rb-field">
      <label>{label}</label>
      {area
        ? <textarea rows={rows || 3} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={ph} />
        : <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={ph} />
      }
    </div>
  );
}
