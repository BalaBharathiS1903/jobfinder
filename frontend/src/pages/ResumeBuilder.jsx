import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../lib/api";
import "./ResumeBuilder.css";

const TEMPLATES = [
  { id: "modern",      name: "Modern",      desc: "Clean two-column layout with accent color",       color: "#2563EB" },
  { id: "classic",     name: "Classic",     desc: "Traditional single-column professional format",   color: "#0F172A" },
  { id: "minimal",     name: "Minimal",     desc: "Simple and elegant with lots of white space",     color: "#64748B" },
  { id: "creative",    name: "Creative",    desc: "Bold header with sidebar for skills",             color: "#7C3AED" },
];

export default function ResumeBuilder() {
  const [step, setStep] = useState(1); // 1=template, 2=fill, 3=preview
  const [template, setTemplate] = useState("");
  const [source, setSource] = useState("manual"); // manual | profile | resume
  const [selectedResume, setSelectedResume] = useState("");

  const [data, setData] = useState({
    name: "", headline: "", email: "", phone: "", location: "", linkedin: "", github: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
  });

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
        github: profile.github || "", summary: profile.summary || "",
        experience: profile.experience || [], education: profile.education || [],
        skills: (profile.skills || []).map(s => s.name || s),
        certifications: profile.certifications || [], projects: profile.projects || [],
      });
    } else if (source === "resume" && selectedResume) {
      const r = resumes.find(x => x.id === parseInt(selectedResume));
      if (r) {
        setData(d => ({
          ...d, name: r.name || "", email: r.email || "", phone: r.phone || "",
          skills: r.skills || [],
        }));
      }
    }
    setStep(2);
  };

  const set = (f, v) => setData(d => ({ ...d, [f]: v }));
  const addArr = (f, item) => setData(d => ({ ...d, [f]: [...(d[f] || []), item] }));
  const removeArr = (f, i) => setData(d => ({ ...d, [f]: d[f].filter((_, idx) => idx !== i) }));
  const updateArr = (f, i, v) => setData(d => ({ ...d, [f]: d[f].map((x, idx) => idx === i ? v : x) }));

  return (
    <div className="rb-page">
      <div className="rb-header">
        <h1>Resume Builder</h1>
        <p>Build a professional resume in minutes using templates</p>
      </div>

      {/* Steps indicator */}
      <div className="rb-steps">
        {["Choose Template", "Fill Details", "Preview & Download"].map((s, i) => (
          <div key={i} className={`rb-step-item ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}>
            <div className="rb-step-dot">{step > i + 1 ? "✓" : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {/* Step 1 — Choose Template */}
      {step === 1 && (
        <div>
          <div className="rb-card">
            <h3>Choose a Template</h3>
            <div className="rb-templates">
              {TEMPLATES.map(t => (
                <div key={t.id} className={`rb-template-card ${template === t.id ? "selected" : ""}`}
                  onClick={() => setTemplate(t.id)}>
                  <div className="rb-template-preview" style={{ borderColor: t.color }}>
                    <div className="rb-tp-header" style={{ background: t.color }} />
                    <div className="rb-tp-lines">
                      <div className="rb-tp-line long" />
                      <div className="rb-tp-line medium" />
                      <div className="rb-tp-line short" />
                      <div className="rb-tp-line long" />
                      <div className="rb-tp-line medium" />
                    </div>
                  </div>
                  <div className="rb-template-info">
                    <strong>{t.name}</strong>
                    <p>{t.desc}</p>
                  </div>
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

          <button className="rb-btn-primary" disabled={!template} onClick={loadFromSource}>
            Continue to Fill Details →
          </button>
        </div>
      )}

      {/* Step 2 — Fill Details */}
      {step === 2 && (
        <div>
          <div className="rb-card">
            <h3>Personal Information</h3>
            <div className="rb-grid2">
              <RF label="Full Name"  value={data.name}     onChange={v => set("name", v)}     ph="John Doe" />
              <RF label="Headline"   value={data.headline} onChange={v => set("headline", v)} ph="Software Engineer" />
              <RF label="Email"      value={data.email}    onChange={v => set("email", v)}    ph="john@email.com" />
              <RF label="Phone"      value={data.phone}    onChange={v => set("phone", v)}    ph="+91 9999999999" />
              <RF label="Location"   value={data.location} onChange={v => set("location", v)} ph="Chennai, India" />
              <RF label="LinkedIn"   value={data.linkedin} onChange={v => set("linkedin", v)} ph="linkedin.com/in/username" />
            </div>
            <RF label="Professional Summary" value={data.summary} onChange={v => set("summary", v)}
              ph="Brief professional summary…" area rows={4} />
          </div>

          <div className="rb-card">
            <h3>Skills</h3>
            <div className="rb-skills-input">
              {(data.skills || []).map((s, i) => (
                <div key={i} className="rb-skill-chip">
                  <input value={s} onChange={e => updateArr("skills", i, e.target.value)} placeholder="Skill" />
                  <button onClick={() => removeArr("skills", i)}>×</button>
                </div>
              ))}
            </div>
            <button className="rb-btn-add" onClick={() => addArr("skills", "")}>+ Add Skill</button>
          </div>

          <div className="rb-card">
            <h3>Work Experience</h3>
            {(data.experience || []).map((e, i) => (
              <div key={i} className="rb-item">
                <div className="rb-item-top">
                  <button className="rb-btn-remove" onClick={() => removeArr("experience", i)}>Remove</button>
                </div>
                <div className="rb-grid2">
                  <RF label="Job Title" value={e.title    || ""} onChange={v => updateArr("experience", i, { ...e, title: v })}    ph="Software Engineer" />
                  <RF label="Company"   value={e.company  || ""} onChange={v => updateArr("experience", i, { ...e, company: v })}  ph="TCS" />
                  <RF label="Start"     value={e.start    || ""} onChange={v => updateArr("experience", i, { ...e, start: v })}    ph="Jan 2022" />
                  <RF label="End"       value={e.end      || ""} onChange={v => updateArr("experience", i, { ...e, end: v })}      ph="Present" />
                </div>
                <RF label="Description" value={e.description || ""} onChange={v => updateArr("experience", i, { ...e, description: v })} ph="Key responsibilities…" area rows={3} />
              </div>
            ))}
            <button className="rb-btn-add" onClick={() => addArr("experience", { title:"", company:"", start:"", end:"", description:"" })}>+ Add Experience</button>
          </div>

          <div className="rb-card">
            <h3>Education</h3>
            {(data.education || []).map((e, i) => (
              <div key={i} className="rb-item">
                <div className="rb-item-top">
                  <button className="rb-btn-remove" onClick={() => removeArr("education", i)}>Remove</button>
                </div>
                <div className="rb-grid2">
                  <RF label="Degree"      value={e.degree      || ""} onChange={v => updateArr("education", i, { ...e, degree: v })}      ph="B.Tech Computer Science" />
                  <RF label="Institution" value={e.institution || ""} onChange={v => updateArr("education", i, { ...e, institution: v })} ph="Anna University" />
                  <RF label="Start Year"  value={e.start       || ""} onChange={v => updateArr("education", i, { ...e, start: v })}       ph="2019" />
                  <RF label="End Year"    value={e.end         || ""} onChange={v => updateArr("education", i, { ...e, end: v })}         ph="2023" />
                </div>
              </div>
            ))}
            <button className="rb-btn-add" onClick={() => addArr("education", { degree:"", institution:"", start:"", end:"" })}>+ Add Education</button>
          </div>

          <div className="rb-card">
            <h3>Certifications</h3>
            {(data.certifications || []).map((c, i) => (
              <div key={i} className="rb-item">
                <div className="rb-item-top">
                  <button className="rb-btn-remove" onClick={() => removeArr("certifications", i)}>Remove</button>
                </div>
                <div className="rb-grid2">
                  <RF label="Certificate" value={c.name   || ""} onChange={v => updateArr("certifications", i, { ...c, name: v })}   ph="AWS Certified Developer" />
                  <RF label="Issuer"      value={c.issuer || ""} onChange={v => updateArr("certifications", i, { ...c, issuer: v })} ph="Amazon" />
                  <RF label="Date"        value={c.date   || ""} onChange={v => updateArr("certifications", i, { ...c, date: v })}   ph="March 2023" />
                  <RF label="URL"         value={c.url    || ""} onChange={v => updateArr("certifications", i, { ...c, url: v })}    ph="https://credential.link" />
                </div>
              </div>
            ))}
            <button className="rb-btn-add" onClick={() => addArr("certifications", { name:"", issuer:"", date:"", url:"" })}>+ Add Certification</button>
          </div>

          <div className="rb-nav-btns">
            <button className="rb-btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button className="rb-btn-primary" onClick={() => setStep(3)}>Preview Resume →</button>
          </div>
        </div>
      )}

      {/* Step 3 — Preview */}
      {step === 3 && (
        <div>
          <div className="rb-preview-actions">
            <button className="rb-btn-outline" onClick={() => setStep(2)}>← Edit</button>
            <button className="rb-btn-primary" onClick={() => window.print()}>Download / Print</button>
          </div>
          <div className={`rb-resume-preview rb-template-${template}`} id="resume-print">
            <ResumePreview data={data} template={template} />
          </div>
        </div>
      )}
    </div>
  );
}

function ResumePreview({ data }) {
  const contactParts = [data.email, data.phone, data.location, data.linkedin].filter(Boolean);
  return (
    <div className="rp-wrap">
      <div className="rp-header">
        <h1>{data.name || "Your Name"}</h1>
        {data.headline && <p className="rp-headline">{data.headline}</p>}
        {contactParts.length > 0 && (
          <p className="rp-contact">{contactParts.join(" | ")}</p>
        )}
      </div>

      {data.summary && <Section title="Professional Summary"><p className="rp-summary">{data.summary}</p></Section>}

      {data.skills?.filter(Boolean).length > 0 && (
        <Section title="Skills">
          <p className="rp-skills-text">{data.skills.filter(Boolean).join(" • ")}</p>
        </Section>
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
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rp-section">
      <h2 className="rp-section-title">{title}</h2>
      {children}
    </div>
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
