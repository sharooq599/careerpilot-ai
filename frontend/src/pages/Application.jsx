
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  ClipboardList,
  Trash2,
  CalendarDays,
  Pencil,
  RefreshCw,
  X,
  Save,
} from "lucide-react";

import api from "../services/api";
import { Shell } from "./Dashboard";

const statuses = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

const emptyForm = () => ({
  job_id: "",
  status: "Applied",
  applied_date: new Date().toLocaleDateString("en-CA"),
  follow_up_date: "",
  notes: "",
});

const getErrorMessage = (err, fallback) => {
  const detail = err.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || "Invalid input").join(", ");
  }

  return fallback;
};

export default function Application() {
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  // Load applications and jobs
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [applicationsResponse, jobsResponse] = await Promise.all([
        api.get("/applications/my-applications"),
        api.get("/jobs"),
      ]);

      setApps(applicationsResponse.data);
      setJobs(jobsResponse.data);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load applications. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open create form
  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (application) => {
    setEditingId(application.id);

    setForm({
      job_id: application.job_id,
      status: application.status,
      applied_date: application.applied_date || "",
      follow_up_date: application.follow_up_date || "",
      notes: application.notes || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  // Add or update application
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!editingId && !form.job_id) {
      setError("Please select a job.");
      return;
    }

    const payload = {
      status: form.status,
      applied_date: form.applied_date || null,
      follow_up_date: form.follow_up_date || null,
      notes: form.notes.trim() || null,
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.patch(`/applications/${editingId}`, payload);
        setSuccess("Application updated successfully.");
      } else {
        await api.post("/applications", {
          ...payload,
          job_id: Number(form.job_id),
        });

        setSuccess("Application added successfully.");
      }

      closeForm();
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save application."));
    } finally {
      setSaving(false);
    }
  };

  // Update application status without reloading the page
  const handleStatusChange = async (newStatus, id) => {
    const previousApplication = apps.find((app) => app.id === id);

    if (
      !previousApplication ||
      previousApplication.status === newStatus ||
      updatingStatusId !== null
    ) {
      return;
    }

    const previousStatus = previousApplication.status;

    setError("");
    setSuccess("");
    setUpdatingStatusId(id);

    // Update UI immediately
    setApps((previousApps) =>
      previousApps.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );

    try {
      await api.patch(`/applications/${id}`, {
        status: newStatus,
      });

      setSuccess("Application status updated successfully.");
    } catch (err) {
      // Restore previous status if API request fails
      setApps((previousApps) =>
        previousApps.map((app) =>
          app.id === id ? { ...app, status: previousStatus } : app
        )
      );

      setError(
        getErrorMessage(err, "Unable to update application status.")
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete application
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this application?"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/applications/${id}`);

      setApps((previousApps) =>
        previousApps.filter((app) => app.id !== id)
      );

      setSuccess("Application deleted successfully.");
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to delete application.")
      );
    }
  };

  // Calculate application statistics
  const counts = statuses.map((status) => ({
    status,
    count: apps.filter((app) => app.status === status).length,
  }));

  const today = new Date().toLocaleDateString("en-CA");

  const upcomingFollowUps = apps.filter(
    (app) => app.follow_up_date && app.follow_up_date >= today
  ).length;

  return (
    <Shell title="Application Tracking">
      <div className="page-content">
        {/* Page heading */}
        <div className="page-heading">
          <div>
            <span className="eyebrow">
              YOUR JOB SEARCH PIPELINE
            </span>
            <h1>Applications</h1>
            <p>
              Track every opportunity from application to offer.
            </p>
          </div>

          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={loadData}
              disabled={loading}
              type="button"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              className="btn btn-primary"
              onClick={openCreateForm}
              type="button"
            >
              <Plus size={17} />
              Add application
            </button>
          </div>
        </div>

        {/* Error and success messages */}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Application statistics */}
        <div className="status-summary">
          <div className="status-chip">
            <span>Total applications</span>
            <b>{apps.length}</b>
          </div>

          {counts.map(({ status, count }) => (
            <div className="status-chip" key={status}>
              <span>{status}</span>
              <b>{count}</b>
            </div>
          ))}

          <div className="status-chip">
            <span>Upcoming follow-ups</span>
            <b>{upcomingFollowUps}</b>
          </div>
        </div>

        {/* Create / Edit application form */}
        {showForm && (
          <form
            className="panel form-grid"
            onSubmit={handleSubmit}
          >
            <div className="full page-heading">
              <h2>
                {editingId ? "Edit application" : "New application"}
              </h2>

              <button
                className="icon-btn"
                type="button"
                onClick={closeForm}
                title="Close form"
              >
                <X size={18} />
              </button>
            </div>

            {!editingId && (
              <label className="full">
                Job

                <select
                  required
                  value={form.job_id}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      job_id: event.target.value,
                    })
                  }
                >
                  <option value="">
                    Choose a saved job
                  </option>

                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} — {job.company}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {editingId && (
              <div className="full">
                <span className="muted">Job</span>

                <p>
                  {apps.find((app) => app.id === editingId)?.job_title}
                  {" — "}
                  {apps.find((app) => app.id === editingId)?.company}
                </p>
              </div>
            )}

            <label>
              Status

              <select
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value,
                  })
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Applied date

              <input
                type="date"
                value={form.applied_date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    applied_date: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Follow-up date

              <input
                type="date"
                value={form.follow_up_date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    follow_up_date: event.target.value,
                  })
                }
              />
            </label>

            <label className="full">
              Notes

              <textarea
                rows="4"
                value={form.notes}
                onChange={(event) =>
                  setForm({
                    ...form,
                    notes: event.target.value,
                  })
                }
                placeholder="Recruiter details, interview notes, next steps..."
              />
            </label>

            <div className="form-actions full">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={
                  saving || (!editingId && jobs.length === 0)
                }
              >
                <Save size={16} />

                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update application"
                    : "Save application"}
              </button>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>

            {!editingId && jobs.length === 0 && (
              <p className="muted full">
                Add a job in Job Management before creating an application.
              </p>
            )}
          </form>
        )}

        {/* Applications table heading */}
        <div className="page-heading">
          <h2>Your applications</h2>
          <span className="muted">
            {apps.length} records
          </span>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="panel empty-state">
            <p>Loading applications...</p>
          </div>
        ) : apps.length === 0 ? (
          /* Empty state */
          <div className="panel empty-state">
            <ClipboardList size={40} />
            <h3>No applications yet</h3>
            <p>
              Add a saved job to start tracking your job search.
            </p>

            <button
              className="btn btn-primary"
              onClick={openCreateForm}
              type="button"
            >
              <Plus size={16} />
              Add your first application
            </button>
          </div>
        ) : (
          /* Applications table */
          <div className="panel table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {apps.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <b>
                        {application.job_title ||
                          `Job #${application.job_id}`}
                      </b>

                      <small>
                        {application.company ||
                          "Company not available"}
                      </small>
                    </td>

                    <td>
                      {application.applied_date || "—"}
                    </td>

                    <td>
                      <select
                        className="status-select"
                        value={application.status}
                        disabled={
                          updatingStatusId === application.id
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            event.target.value,
                            application.id
                          )
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {updatingStatusId === application.id && (
                        <small>Saving...</small>
                      )}
                    </td>

                    <td>
                      <span className="date-cell">
                        <CalendarDays size={14} />
                        {application.follow_up_date || "—"}
                      </span>
                    </td>

                    <td className="notes-cell">
                      {application.notes || "—"}
                    </td>

                    <td>
                      <div className="form-actions">
                        <button
                          className="icon-btn"
                          type="button"
                          title="Edit application"
                          onClick={() =>
                            openEditForm(application)
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="icon-btn danger"
                          type="button"
                          title="Delete application"
                          onClick={() =>
                            handleDelete(application.id)
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
