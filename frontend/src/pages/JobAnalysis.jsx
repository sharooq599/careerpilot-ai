import { useEffect, useState } from "react";
import { Plus, BriefcaseBusiness, Trash2, ExternalLink, Search, Pencil } from "lucide-react";
import api from "../services/api";
import { Shell } from "./Dashboard";
import { useAuth } from "../context/AuthContext";

const emptyForm = { title: "", company: "", description: "", url: "" };
export default function JobAnalysis() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    api.get("/jobs").then(r => setJobs(r.data))
      .catch(e => setError(e.response?.data?.detail || "Unable to load jobs"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const startEdit = job => {
    setEditingId(job.id);
    setForm({ title: job.title, company: job.company, description: job.description, url: job.url || "" });
    setShow(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closeForm = () => { setShow(false); setEditingId(null); setForm(emptyForm); };
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const payload = { ...form, url: form.url || null };
      if (editingId) await api.patch(`/jobs/${editingId}`, payload);
      else await api.post("/jobs", payload);
      closeForm(); load();
    } catch (e) { setError(e.response?.data?.detail || "Could not save job"); }
    finally { setBusy(false); }
  };
  const remove = async id => {
    if (!window.confirm("Delete this job and its linked application/analysis records?")) return;
    try { await api.delete(`/jobs/${id}`); load(); }
    catch (e) { setError(e.response?.data?.detail || "Could not delete job"); }
  };
  const filtered = jobs.filter(j => `${j.title} ${j.company}`.toLowerCase().includes(query.toLowerCase()));

  return <Shell title="Job management"><div className="page-content">
    <div className="page-heading"><div><span className="eyebrow">OPPORTUNITY ORGANIZER</span><h1>Jobs</h1><p>Save job descriptions and use them for AI resume matching.</p></div><button className="btn btn-primary" onClick={() => { if (show) closeForm(); else { setEditingId(null); setForm(emptyForm); setShow(true); } }}><Plus size={17}/>{show ? "Close form" : "Add job"}</button></div>
    {error && <div className="alert alert-error">{error}</div>}
    {show && <form className="panel form-grid" onSubmit={submit}><h2 className="full">{editingId ? "Edit job" : "Add a job"}</h2>
      <label>Job title<input required name="title" value={form.title} onChange={change} minLength="2"/></label>
      <label>Company<input required name="company" value={form.company} onChange={change} minLength="2"/></label>
      <label className="full">Job description<textarea required name="description" value={form.description} onChange={change} rows="5" minLength="20" placeholder="Paste the job description here…"/></label>
      <label className="full">Job URL (optional)<input type="url" name="url" value={form.url} onChange={change} placeholder="https://…"/></label>
      <div className="form-actions full"><button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : editingId ? "Update job" : "Save job"}</button><button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button></div>
    </form>}
    <div className="search-row"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs or companies"/></div>
    {loading ? <p className="muted">Loading jobs…</p> : filtered.length === 0 ? <div className="empty-state"><BriefcaseBusiness size={34}/><h3>No jobs found</h3><p>Add a job description to start matching your resume.</p></div> : <div className="job-grid">{filtered.map(j => <article className="panel job-card" key={j.id}>
      <div className="job-card-top"><span className="metric-icon"><BriefcaseBusiness/></span>{j.owner_id === user?.id && <div><button className="icon-btn" onClick={() => startEdit(j)} title="Edit job"><Pencil size={16}/></button><button className="icon-btn danger" onClick={() => remove(j.id)} title="Delete job"><Trash2 size={17}/></button></div>}</div>
      <h3>{j.title}</h3><b className="muted">{j.company}</b><p>{j.description.slice(0, 210)}{j.description.length > 210 ? "…" : ""}</p>
      <div className="job-actions"><a className="btn btn-secondary" href={j.url || "#"} target="_blank" rel="noreferrer" onClick={e => !j.url && e.preventDefault()}><ExternalLink size={15}/> Job link</a><a className="btn btn-primary" href={`/match?job=${j.id}`}>Match resume</a></div>
    </article>)}</div>}
  </div></Shell>;
}
