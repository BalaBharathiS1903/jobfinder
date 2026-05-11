import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import "./ManualProfile.css";
import JobMatchCard from "../components/JobMatchCard";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const LANG_LIST = ["English","Tamil","Hindi","Telugu","Kannada","Malayalam","French","German","Spanish","Arabic","Chinese","Japanese"];
const PROF_LIST = ["Native","Fluent","Conversational","Basic"];

const TABS = [
  { id: "personal",       label: "Personal"       },
  { id: "skills",         label: "Skills"         },
  { id: "experience",     label: "Experience"     },
  { id: "education",      label: "Education"      },
  { id: "certifications", label: "Certifications" },
  { id: "projects",       label: "Projects"       },
  { id: "languages",      label: "Languages"      },
  { id: "achievements",   label: "Achievements"   },
  { id: "job_matches",    label: "Job Matches"    },
  { id: "password",       label: "Password"       },
];

export default function ManualProfile() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState("personal");
  const [saved, setSaved] = useState(false);
  const [matchLocation, setMatchLocation] = useState("");
  const [matchCountry, setMatchCountry] = useState("in");

  const matchMutation = useMutation({
    mutationFn: () => api.post("/jobs/profile-search/", { location: matchLocation, country: matchCountry }).then(r => r.data),
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["myprofile"],
    queryFn: () => api.get("/profile/").then(r => r.data),
  });

  const [form, setForm] = useState({
    full_name:"", headline:"", email:"", phone:"", location:"",
    website:"", linkedin:"", github:"", leetcode:"", summary:"", photo:"",
    skills:[], experience:[], education:[], certifications:[],
    projects:[], languages:[], achievements:[],
  });

  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const mutation = useMutation({
    mutationFn: d => api.put("/profile/", d).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myprofile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: d => api.post("/auth/change-password/", d).then(r => r.data),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordForm({ current: "", new: "", confirm: "" });
      setPasswordError("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (err) => {
      setPasswordError(err.response?.data?.error || "Failed to change password.");
    },
  });

  const [githubAvatar, setGithubAvatar] = useState("");

  useEffect(() => {
    if (form.github) {
      try {
        const url = new URL(form.github);
        const username = url.pathname.split('/').filter(Boolean).pop();
        if (username) {
          fetch(`https://api.github.com/users/${username}`)
            .then(res => res.json())
            .then(data => setGithubAvatar(data.avatar_url || ""))
            .catch(() => setGithubAvatar(""));
        }
      } catch {
        setGithubAvatar("");
      }
    } else {
      setGithubAvatar("");
    }
  }, [form.github]);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const add = (f, item) => set(f, [...(form[f] || []), item]);
  const remove = (f, i) => set(f, form[f].filter((_, idx) => idx !== i));
  const update = (f, i, v) => set(f, form[f].map((x, idx) => idx === i ? v : x));

  if (isLoading) return <div className="mp-loading">Loading…</div>;

  return (
    <div className="mp-page">
      <div className="mp-page-header">
        <div>
          <h1>Professional Profile</h1>
          <p>Build and manage your career profile</p>
        </div>
        <div className="mp-header-actions">
          <button className="mp-btn-activity" onClick={() => navigate("/my-activity")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            My Activity
          </button>
          <button className="mp-btn-activity" onClick={() => navigate("/resume-builder", { state: { fromProfile: true } })}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>
            Build Resume
          </button>
          <button className={`mp-btn-save ${saved ? "saved" : ""}`}
            onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
            {saved ? "Saved" : mutation.isPending ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>

      <div className="mp-card mp-profile-card">
        <div className="mp-photo-wrap">
          {form.photo
            ? <img src={form.photo} alt="Profile" className="mp-photo-img" />
            : <div className="mp-avatar">{form.full_name ? form.full_name.slice(0,2).toUpperCase() : "—"}</div>
          }
          <label className="mp-photo-btn">
            {form.photo ? "Change Photo" : "Add Photo"}
            <input type="file" accept="image/*" hidden onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => set("photo", ev.target.result);
              reader.readAsDataURL(file);
            }} />
          </label>
          {form.photo && (
            <button className="mp-photo-remove" onClick={() => set("photo", "")}>Remove</button>
          )}
        </div>
        <div className="mp-profile-info">
          <h2>{form.full_name || "Your Name"}</h2>
          <p className="mp-profile-headline">{form.headline || "Professional Headline"}</p>
          {githubAvatar && <img src={githubAvatar} alt="GitHub Avatar" style={{width: '60px', height: '60px', borderRadius: '50%', margin: '10px 0'}} />}
          <div className="mp-profile-meta">
            {form.location && <span>{form.location}</span>}
            {form.email    && <span>{form.email}</span>}
            {form.phone    && <span>{form.phone}</span>}
          </div>
          <div className="mp-profile-links">
            {form.linkedin && (
              <a href={form.linkedin} target="_blank" rel="noreferrer" className="mp-link-btn mp-link-linkedin">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/></svg>
                LinkedIn
              </a>
            )}
            {form.github && (
              <a href={form.github} target="_blank" rel="noreferrer" className="mp-link-btn mp-link-github">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
            )}
            {form.website && (
              <a href={form.website} target="_blank" rel="noreferrer" className="mp-link-btn mp-link-website">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                Website
              </a>
            )}
            {form.leetcode && (
              <a href={form.leetcode} target="_blank" rel="noreferrer" className="mp-link-btn mp-link-website">
                LeetCode
              </a>
            )}
          </div>
        </div>
        <div className="mp-stats">
          {[["Skills", form.skills?.length], ["Experience", form.experience?.length],
            ["Certifications", form.certifications?.length], ["Projects", form.projects?.length]
          ].map(([l, v]) => (
            <div key={l} className="mp-stat">
              <strong>{v || 0}</strong>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mp-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`mp-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="mp-card mp-content">

        {tab === "personal" && (
          <Section title="Personal Information">
            <Grid2>
              <F label="Full Name"   value={form.full_name} onChange={v => set("full_name", v)} ph="John Doe" />
              <HeadlineField value={form.headline} onChange={v => set("headline", v)} form={form} />
              <F label="Email"       value={form.email}     onChange={v => set("email", v)}     ph="john@email.com" type="email" />
              <F label="Phone"       value={form.phone}     onChange={v => set("phone", v)}     ph="+91 9999999999" />
              <F label="Location"    value={form.location}  onChange={v => set("location", v)}  ph="Chennai, India" />
              <F label="Website"     value={form.website}   onChange={v => set("website", v)}   ph="https://yoursite.com" />
              <F label="LinkedIn"    value={form.linkedin}  onChange={v => set("linkedin", v)}  ph="https://linkedin.com/in/username" />
              <F label="GitHub"      value={form.github}    onChange={v => set("github", v)}    ph="https://github.com/username" />
              <F label="LeetCode"    value={form.leetcode}  onChange={v => set("leetcode", v)}  ph="https://leetcode.com/u/username" />
            </Grid2>
            <F label="Professional Summary" value={form.summary} onChange={v => set("summary", v)}
              ph="Brief overview of your experience, skills and career goals…" area rows={5} />
          </Section>
        )}

        {tab === "skills" && (
          <Section title="Skills">
            {(form.skills || []).map((s, i) => (
              <div key={i} className="mp-skill-row">
                <input value={s.name || ""} onChange={e => update("skills", i, { ...s, name: e.target.value })} placeholder="Skill name" />
                <select value={s.level || "Intermediate"} onChange={e => update("skills", i, { ...s, level: e.target.value })}>
                  {SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
                <div className="mp-bar"><div className="mp-bar-fill" style={{ width: `${(SKILL_LEVELS.indexOf(s.level || "Intermediate") + 1) * 25}%` }} /></div>
                <button className="mp-btn-remove" onClick={() => remove("skills", i)}>Remove</button>
              </div>
            ))}
            <AddBtn onClick={() => add("skills", { name: "", level: "Intermediate" })} label="Add Skill" />
          </Section>
        )}

        {tab === "experience" && (
          <Section title="Work Experience">
            {(form.experience || []).map((e, i) => (
              <ItemCard key={i} onRemove={() => remove("experience", i)}>
                <Grid2>
                  <F label="Job Title"  value={e.title    || ""} onChange={v => update("experience", i, { ...e, title: v })}    ph="Software Engineer" />
                  <F label="Company"    value={e.company  || ""} onChange={v => update("experience", i, { ...e, company: v })}  ph="TCS" />
                  <F label="Location"   value={e.location || ""} onChange={v => update("experience", i, { ...e, location: v })} ph="Chennai" />
                  <F label="Type"       value={e.type     || ""} onChange={v => update("experience", i, { ...e, type: v })}     ph="Full-time" />
                  <F label="Start Date" value={e.start    || ""} onChange={v => update("experience", i, { ...e, start: v })}    ph="Jan 2022" />
                  <F label="End Date"   value={e.end      || ""} onChange={v => update("experience", i, { ...e, end: v })}      ph="Present" />
                </Grid2>
                <F label="Description" value={e.description || ""} onChange={v => update("experience", i, { ...e, description: v })} ph="Responsibilities and achievements…" area rows={3} />
              </ItemCard>
            ))}
            <AddBtn onClick={() => add("experience", { title:"", company:"", location:"", type:"", start:"", end:"", description:"" })} label="Add Experience" />
          </Section>
        )}

        {tab === "education" && (
          <Section title="Education">
            {(form.education || []).map((e, i) => (
              <ItemCard key={i} onRemove={() => remove("education", i)}>
                <Grid2>
                  <F label="Degree"      value={e.degree      || ""} onChange={v => update("education", i, { ...e, degree: v })}      ph="B.Tech Computer Science" />
                  <F label="Institution" value={e.institution || ""} onChange={v => update("education", i, { ...e, institution: v })} ph="Anna University" />
                  <F label="Location"    value={e.location    || ""} onChange={v => update("education", i, { ...e, location: v })}    ph="Chennai" />
                  <F label="Grade/CGPA"  value={e.grade       || ""} onChange={v => update("education", i, { ...e, grade: v })}       ph="8.5 CGPA" />
                  <F label="Start Year"  value={e.start       || ""} onChange={v => update("education", i, { ...e, start: v })}       ph="2019" />
                  <F label="End Year"    value={e.end         || ""} onChange={v => update("education", i, { ...e, end: v })}         ph="2023" />
                </Grid2>
                <F label="Activities" value={e.description || ""} onChange={v => update("education", i, { ...e, description: v })} ph="Clubs, thesis, activities…" area rows={2} />
              </ItemCard>
            ))}
            <AddBtn onClick={() => add("education", { degree:"", institution:"", location:"", grade:"", start:"", end:"", description:"" })} label="Add Education" />
          </Section>
        )}

        {tab === "certifications" && (
          <Section title="Certifications">
            {(form.certifications || []).map((c, i) => (
              <ItemCard key={i} onRemove={() => remove("certifications", i)}>
                <Grid2>
                  <F label="Certificate Name"     value={c.name          || ""} onChange={v => update("certifications", i, { ...c, name: v })}          ph="AWS Certified Developer" />
                  <F label="Issuing Organization" value={c.issuer        || ""} onChange={v => update("certifications", i, { ...c, issuer: v })}        ph="Amazon Web Services" />
                  <F label="Issue Date"           value={c.date          || ""} onChange={v => update("certifications", i, { ...c, date: v })}          ph="March 2023" />
                  <F label="Expiry Date"          value={c.expiry        || ""} onChange={v => update("certifications", i, { ...c, expiry: v })}        ph="No Expiry" />
                  <F label="Credential ID"        value={c.credential_id || ""} onChange={v => update("certifications", i, { ...c, credential_id: v })} ph="ABC123" />
                  <F label="Certificate URL"      value={c.url           || ""} onChange={v => update("certifications", i, { ...c, url: v })}           ph="https://credential.link" />
                </Grid2>
              </ItemCard>
            ))}
            <AddBtn onClick={() => add("certifications", { name:"", issuer:"", date:"", expiry:"", credential_id:"", url:"" })} label="Add Certification" />
          </Section>
        )}

        {tab === "projects" && (
          <Section title="Projects">
            {(form.projects || []).map((p, i) => (
              <ItemCard key={i} onRemove={() => remove("projects", i)}>
                <Grid2>
                  <F label="Project Name"  value={p.name     || ""} onChange={v => update("projects", i, { ...p, name: v })}     ph="Job Finder App" />
                  <F label="Role"          value={p.role     || ""} onChange={v => update("projects", i, { ...p, role: v })}     ph="Full Stack Developer" />
                  <F label="Technologies"  value={p.tech     || ""} onChange={v => update("projects", i, { ...p, tech: v })}     ph="React, Django, PostgreSQL" />
                  <F label="Duration"      value={p.duration || ""} onChange={v => update("projects", i, { ...p, duration: v })} ph="Jan 2024 – Mar 2024" />
                  <F label="GitHub URL"    value={p.github   || ""} onChange={v => update("projects", i, { ...p, github: v })}   ph="https://github.com/…" />
                  <F label="Live URL"      value={p.url      || ""} onChange={v => update("projects", i, { ...p, url: v })}      ph="https://yourproject.com" />
                </Grid2>
                <F label="Description" value={p.description || ""} onChange={v => update("projects", i, { ...p, description: v })} ph="What the project does and your contribution…" area rows={3} />
              </ItemCard>
            ))}
            <AddBtn onClick={() => add("projects", { name:"", role:"", tech:"", duration:"", github:"", url:"", description:"" })} label="Add Project" />
          </Section>
        )}

        {tab === "languages" && (
          <Section title="Languages">
            {(form.languages || []).map((l, i) => (
              <div key={i} className="mp-lang-row">
                <select value={l.name || ""} onChange={e => update("languages", i, { ...l, name: e.target.value })}>
                  <option value="">Select language</option>
                  {LANG_LIST.map(x => <option key={x}>{x}</option>)}
                </select>
                <select value={l.proficiency || "Conversational"} onChange={e => update("languages", i, { ...l, proficiency: e.target.value })}>
                  {PROF_LIST.map(x => <option key={x}>{x}</option>)}
                </select>
                <button className="mp-btn-remove" onClick={() => remove("languages", i)}>Remove</button>
              </div>
            ))}
            <AddBtn onClick={() => add("languages", { name:"", proficiency:"Conversational" })} label="Add Language" />
          </Section>
        )}

        {tab === "job_matches" && (
          <Section title="Job Matches from Your Profile">
            <div className="mp-match-controls">
              <input className="mp-match-input" placeholder="Location (optional)" value={matchLocation}
                onChange={e => setMatchLocation(e.target.value)} />
              <select className="mp-match-select" value={matchCountry} onChange={e => setMatchCountry(e.target.value)}>
                {[["in","India"],["us","USA"],["gb","UK"],["au","Australia"],["ca","Canada"],["de","Germany"],["sg","Singapore"]]
                  .map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button className="mp-btn-save" onClick={() => matchMutation.mutate()}
                disabled={matchMutation.isPending}>
                {matchMutation.isPending ? "Searching…" : "Find Matching Jobs"}
              </button>
            </div>
            {matchMutation.isError && (
              <p className="mp-match-error">
                {matchMutation.error?.response?.data?.error || "Failed to fetch jobs. Please try again."}
              </p>
            )}
            {matchMutation.data && (
              <>
                <p className="mp-match-query">Query: <strong>{matchMutation.data.query}</strong> — {matchMutation.data.results.length} jobs found</p>
                <div className="mp-match-list">
                  {matchMutation.data.results.map(job => <JobMatchCard key={job.id} job={job} />)}
                </div>
              </>
            )}
          </Section>
        )}

        {tab === "achievements" && (
          <Section title="Achievements & Awards">
            {(form.achievements || []).map((a, i) => (
              <ItemCard key={i} onRemove={() => remove("achievements", i)}>
                <Grid2>
                  <F label="Title"        value={a.title  || ""} onChange={v => update("achievements", i, { ...a, title: v })}  ph="Best Developer Award" />
                  <F label="Organization" value={a.issuer || ""} onChange={v => update("achievements", i, { ...a, issuer: v })} ph="VDart Academy" />
                  <F label="Date"         value={a.date   || ""} onChange={v => update("achievements", i, { ...a, date: v })}   ph="December 2023" />
                  <F label="URL"          value={a.url    || ""} onChange={v => update("achievements", i, { ...a, url: v })}    ph="https://…" />
                </Grid2>
                <F label="Description" value={a.description || ""} onChange={v => update("achievements", i, { ...a, description: v })} ph="Describe the achievement…" area rows={2} />
              </ItemCard>
            ))}
            <AddBtn onClick={() => add("achievements", { title:"", issuer:"", date:"", url:"", description:"" })} label="Add Achievement" />
          </Section>
        )}

        {tab === "password" && (
          <Section title="Change Password">
            {passwordError && <div className="mp-error">{passwordError}</div>}
            {passwordSuccess && <div className="mp-success">Password changed successfully!</div>}
            <Grid2>
              <F label="Current Password" value={passwordForm.current} onChange={v => setPasswordForm(p => ({ ...p, current: v }))} type="password" ph="Enter current password" />
              <F label="New Password"     value={passwordForm.new}    onChange={v => setPasswordForm(p => ({ ...p, new: v }))}    type="password" ph="Enter new password" />
              <F label="Confirm Password" value={passwordForm.confirm} onChange={v => setPasswordForm(p => ({ ...p, confirm: v }))} type="password" ph="Confirm new password" />
            </Grid2>
            <button
              className="mp-btn-save"
              onClick={() => {
                if (passwordForm.new !== passwordForm.confirm) {
                  setPasswordError("New passwords do not match.");
                  return;
                }
                passwordMutation.mutate({ current_password: passwordForm.current, new_password: passwordForm.new });
              }}
              disabled={passwordMutation.isPending}
            >
              {passwordMutation.isPending ? "Changing…" : "Change Password"}
            </button>
          </Section>
        )}

      </div>

      <div className="mp-footer-save">
        <button className={`mp-btn-save ${saved ? "saved" : ""}`}
          onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {saved ? "Saved" : mutation.isPending ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

function HeadlineField({ value, onChange, form }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const suggestions = buildHeadlineSuggestions(form);

  return (
    <div className="mp-field mp-headline-field" ref={ref}>
      <label>Professional Headline</label>
      <div className="mp-headline-input-wrap">
        <input
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder="Software Engineer | React | Node.js"
          onFocus={() => setOpen(true)}
        />
        {suggestions.length > 0 && (
          <button type="button" className="mp-headline-suggest-btn"
            onClick={() => setOpen(o => !o)} title="Show suggestions">✦</button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="mp-headline-dropdown">
          <p className="mp-headline-dropdown-label">Suggestions based on your profile</p>
          {suggestions.map((s, i) => (
            <button key={i} className="mp-headline-option"
              onClick={() => { onChange(s); setOpen(false); }}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function buildHeadlineSuggestions(form) {
  const skills = (form.skills || []).map(s => s.name || s).filter(Boolean);
  const latestJob = form.experience?.[0];
  const title = latestJob?.title || "";
  const top3 = skills.slice(0, 3).join(" | ");
  const top2 = skills.slice(0, 2).join(" | ");

  const suggestions = [];
  if (title && top3) suggestions.push(`${title} | ${top3}`);
  if (title && top2) suggestions.push(`${title} | ${top2}`);
  if (title)         suggestions.push(title);
  if (top3)          suggestions.push(top3);
  if (skills[0] && skills[1]) suggestions.push(`${skills[0]} Developer | ${skills[1]} | ${skills[2] || ""}`.replace(/ \|\s*$/, ""));
  return [...new Set(suggestions)].slice(0, 5);
}

function Section({ title, children }) {
  return <div className="mp-section"><h3 className="mp-section-title">{title}</h3>{children}</div>;
}
function Grid2({ children }) { return <div className="mp-grid2">{children}</div>; }
function ItemCard({ children, onRemove }) {
  return (
    <div className="mp-item-card">
      <div className="mp-item-header">
        <button className="mp-btn-remove" onClick={onRemove}>Remove</button>
      </div>
      {children}
    </div>
  );
}
function AddBtn({ onClick, label }) {
  return <button className="mp-btn-add" onClick={onClick}>+ {label}</button>;
}
function F({ label, value, onChange, ph, type = "text", area, rows }) {
  return (
    <div className="mp-field">
      <label>{label}</label>
      {area
        ? <textarea rows={rows || 3} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={ph} />
        : <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={ph} />
      }
    </div>
  );
}
