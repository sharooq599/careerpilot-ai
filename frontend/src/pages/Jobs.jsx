
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  RefreshCw,
  Building2,
  CalendarDays,
} from "lucide-react";

import api from "../services/api";
import { Shell } from "./Dashboard";
import "./Jobs.css";

const emptyForm = {
  title: "",
  company: "",
  description: "",
  url: "",
};

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }

  return fallback;
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/jobs");
      setJobs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load jobs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase();

    return (
      job.title?.toLowerCase().includes(searchText) ||
      job.company?.toLowerCase().includes(searchText) ||
      job.description?.toLowerCase().includes(searchText)
    );
  });

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (job) => {
    setForm({
      title: job.title || "",
      company: job.company || "",
      description: job.description || "",
      url: job.url || "",
    });

    setEditingId(job.id);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.company.trim() || !form.description.trim()) {
      setError("Please fill in the job title, company and description.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      description: form.description.trim(),
      url: form.url.trim() || null,
    };

    try {
      if (editingId !== null) {
        const response = await api.patch(`/jobs/${editingId}`, payload);

        setJobs((previous) =>
          previous.map((job) =>
            job.id === editingId ? response.data : job
          )
        );

        setSuccess("Job updated successfully.");
      } else {
        const response = await api.post("/jobs", payload);

        setJobs((previous) => [response.data, ...previous]);
        setSuccess("Job added successfully.");
      }

      closeForm();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingId !== null
            ? "Unable to update job."
            : "Unable to add job."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (job) => {
    const confirmed = window.confirm(
      `Delete "${job.title}" at ${job.company}?\n\nYour backend also deletes applications and resume analyses linked to this job. This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(job.id);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/jobs/${job.id}`);

      setJobs((previous) =>
        previous.filter((item) => item.id !== job.id)
      );

      setSuccess("Job deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete job."));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Shell title="Job Management">
      <div className="page-content jobs-page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">YOUR JOB OPPORTUNITIES</span>
            <h1>Jobs</h1>
            <p>Manage and organize your job opportunities in one place.</p>
          </div>

          <div className="jobs-heading-actions">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={loadJobs}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              className="btn btn-primary"
              type="button"
              onClick={openAddForm}
            >
              <Plus size={17} />
              Add job
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="jobs-summary-grid">
          <div className="jobs-summary-card">
            <span className="jobs-summary-icon">
              <BriefcaseBusiness size={21} />
            </span>
            <span>Total jobs</span>
            <strong>{jobs.length}</strong>
          </div>

          <div className="jobs-summary-card">
            <span className="jobs-summary-icon">
              <Building2 size={21} />
            </span>
            <span>Companies</span>
            <strong>
              {new Set(jobs.map((job) => job.company?.toLowerCase()).filter(Boolean)).size}
            </strong>
          </div>
        </div>

        <section className="jobs-panel">
          <div className="jobs-panel-heading">
            <div>
              <h2>Your job opportunities</h2>
              <p>{filteredJobs.length} job(s) found</p>
            </div>

            <div className="jobs-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search by title or company..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="jobs-empty-state">
              <RefreshCw size={25} className="jobs-loading-icon" />
              <h3>Loading jobs...</h3>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="jobs-empty-state">
              <BriefcaseBusiness size={35} />
              <h3>{search ? "No matching jobs found" : "No jobs added yet"}</h3>
              <p>
                {search
                  ? "Try another search term."
                  : "Start by adding your first job opportunity."}
              </p>

              {!search && (
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={openAddForm}
                >
                  <Plus size={17} />
                  Add your first job
                </button>
              )}
            </div>
          ) : (
            <div className="jobs-list">
              {filteredJobs.map((job) => (
                <article className="job-card" key={job.id}>
                  <div className="job-card-main">
                    <div className="job-card-icon">
                      <BriefcaseBusiness size={23} />
                    </div>

                    <div className="job-card-content">
                      <h3>{job.title}</h3>

                      <div className="job-company">
                        <Building2 size={15} />
                        {job.company}
                      </div>

                      <p className="job-description">
                        {job.description}
                      </p>

                      <div className="job-card-meta">
                        <span>
                          <CalendarDays size={14} />
                          Added {formatDate(job.created_at)}
                        </span>

                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View job <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="job-card-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => openEditForm(job)}
                      title="Edit job"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(job)}
                      disabled={deletingId === job.id}
                      title="Delete job"
                    >
                      <Trash2 size={15} />
                      {deletingId === job.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {showForm && (
          <div
            className="jobs-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                closeForm();
              }
            }}
          >
            <section
              className="jobs-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="jobs-modal-title"
            >
              <div className="jobs-modal-heading">
                <div>
                  <span className="eyebrow">
                    {editingId !== null ? "UPDATE OPPORTUNITY" : "NEW OPPORTUNITY"}
                  </span>

                  <h2 id="jobs-modal-title">
                    {editingId !== null ? "Edit job" : "Add a job"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={closeForm}
                  disabled={saving}
                  aria-label="Close form"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="jobs-form">
                <label>
                  Job title *
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Python Developer"
                    maxLength={255}
                    required
                  />
                </label>

                <label>
                  Company name *
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="e.g. Infosys"
                    maxLength={255}
                    required
                  />
                </label>

                <label>
                  Job description *
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter the job responsibilities, skills and requirements..."
                    rows={5}
                    required
                  />
                </label>

                <label>
                  Job application URL
                  <input
                    name="url"
                    type="url"
                    value={form.url}
                    onChange={handleChange}
                    placeholder="https://company.com/careers/job"
                    maxLength={500}
                  />
                </label>

                <div className="jobs-form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId !== null
                        ? "Save changes"
                        : "Add job"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </Shell>
  );
}
