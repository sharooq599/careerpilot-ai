
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  RefreshCw,
  Eye,
  ArrowLeft,
  File,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  X,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";
import api from "../services/api";

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch resumes from backend
  const fetchResumes = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/resumes/my-resumes");

      setResumes(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load resumes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Validate selected file
  const handleFileChange = (event) => {
    setError("");
    setSuccess("");

    const file = event.target.files?.[0];

    if (!file) return;

    const allowedExtensions = [".pdf", ".docx"];
    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError("Only PDF and DOCX files are allowed.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than or equal to 5 MB.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // Upload resume
  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/resumes/upload", formData);

      setSuccess("Resume uploaded successfully!");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchResumes();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Resume upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // Delete a resume owned by the signed-in user
  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm("Delete this resume? Related saved analyses may no longer be useful.")) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/resumes/${resumeId}`);
      setSuccess("Resume deleted successfully.");
      if (selectedResume?.id === resumeId) setSelectedResume(null);
      await fetchResumes();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to delete resume.");
    }
  };

  // View resume details
  const handleViewResume = async (resumeId) => {
    setDetailsLoading(true);
    setError("");
    setSelectedResume(null);

    try {
      const response = await api.get(`/resumes/${resumeId}`);
      setSelectedResume(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load resume details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedResume(null);
  };

  return (
    <div className="resume-page">
      <header className="resume-header">
        <div>
          <Link to="/dashboard" className="resume-back-link">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <h1>Resume Management</h1>

          <p>
            Upload, organize and review your resumes in one place.
          </p>
        </div>

        <button
          className="resume-refresh-btn"
          onClick={fetchResumes}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="resume-message error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="resume-message success-message">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <section className="resume-upload-card">
        <div className="resume-section-heading">
          <div className="resume-heading-icon">
            <Upload size={22} />
          </div>

          <div>
            <h2>Upload Your Resume</h2>
            <p>Upload your latest resume to get started.</p>
          </div>
        </div>

        <form onSubmit={handleUpload}>
          <div
            className="resume-dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();

              const file = event.dataTransfer.files?.[0];

              if (file && fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;

                handleFileChange({
                  target: fileInputRef.current,
                });
              }
            }}
          >
            <div className="resume-upload-icon">
              <Upload size={30} />
            </div>

            <h3>
              Click to choose a resume or drag and drop
            </h3>

            <p>PDF or DOCX · Maximum file size 5 MB</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              hidden
            />

            {selectedFile && (
              <div className="selected-resume">
                <File size={18} />
                <span>{selectedFile.name}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="resume-upload-btn"
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <LoaderCircle className="spin" size={18} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload Resume
              </>
            )}
          </button>
        </form>
      </section>

      <section className="resume-list-section">
        <div className="resume-list-heading">
          <div>
            <h2>My Resumes</h2>
            <p>All resumes uploaded to your account.</p>
          </div>

          <span className="resume-count">
            {resumes.length} {resumes.length === 1 ? "Resume" : "Resumes"}
          </span>
        </div>

        {loading ? (
          <div className="resume-empty-state">
            <LoaderCircle className="spin" size={30} />
            <p>Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="resume-empty-state">
            <FileText size={42} />
            <h3>No resumes uploaded yet</h3>
            <p>Upload your first resume to get started.</p>
          </div>
        ) : (
          <div className="resume-list">
            {resumes.map((resume) => (
              <article className="resume-item" key={resume.id}>
                <div className="resume-item-icon">
                  <FileText size={25} />
                </div>

                <div className="resume-item-info">
                  <h3>{resume.filename || `Resume #${resume.id}`}</h3>

                  <p>
                    Resume ID: {resume.id}
                  </p>

                  {resume.created_at && (
                    <p>
                      Uploaded:{" "}
                      {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="resume-item-actions">
                  <button
                    className="resume-view-btn"
                    onClick={() => handleViewResume(resume.id)}
                  >
                    <Eye size={17} />
                    View
                  </button>
                  <button className="resume-delete-btn" onClick={() => handleDeleteResume(resume.id)} aria-label="Delete resume">
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {detailsLoading && (
        <div className="resume-modal-overlay">
          <div className="resume-modal">
            <LoaderCircle className="spin" size={30} />
            <p>Loading resume details...</p>
          </div>
        </div>
      )}

      {selectedResume && (
        <div
          className="resume-modal-overlay"
          onClick={closeDetails}
        >
          <div
            className="resume-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="resume-modal-header">
              <div>
                <h2>{selectedResume.filename || "Resume Details"}</h2>
                <p>Resume ID: {selectedResume.id}</p>
              </div>

              <button
                className="resume-close-btn"
                onClick={closeDetails}
                aria-label="Close resume details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="resume-parsed-text">
              {selectedResume.parsed_text ? (
                selectedResume.parsed_text
              ) : (
                "No extracted text is available for this resume."
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
