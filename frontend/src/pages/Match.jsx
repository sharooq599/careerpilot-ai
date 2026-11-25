
import { useEffect, useState } from "react";
import {
  Target,
  FileText,
  BriefcaseBusiness,
  BrainCircuit,
  Plus,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Award,
  TrendingUp,
  Lightbulb,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import { Link } from "react-router-dom";
import api from "../services/api";

export default function Match() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [addingJob, setAddingJob] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState(null);

  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    description: "",
    url: "",
  });

  const getErrorMessage = (err, fallback) => {
    const detail = err.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          const field = Array.isArray(item.loc)
            ? item.loc.slice(1).join(".")
            : "Field";

          return `${field}: ${item.msg}`;
        })
        .join(" | ");
    }

    if (typeof detail === "string") return detail;

    return err.message || fallback;
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [resumeResponse, jobResponse] = await Promise.all([
        api.get("/resumes/my-resumes"),
        api.get("/jobs"),
      ]);

      const resumeData = Array.isArray(resumeResponse.data)
        ? resumeResponse.data
        : [];

      const jobData = Array.isArray(jobResponse.data)
        ? jobResponse.data
        : [];

      setResumes(resumeData);
      setJobs(jobData);
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load resumes or jobs.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJobFormChange = (event) => {
    const { name, value } = event.target;

    setJobForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddJob = async (event) => {
    event.preventDefault();

    if (addingJob) return;

    setError("");
    setSuccess("");

    const title = jobForm.title.trim();
    const company = jobForm.company.trim();
    const description = jobForm.description.trim();
    const url = jobForm.url.trim();

    if (!title || !company || !description) {
      setError(
        "Please fill in the job title, company and description."
      );
      return;
    }

    const jobPayload = {
      title,
      company,
      description,
      url: url || null,
    };

    setAddingJob(true);

    try {
      const response = await api.post("/jobs", jobPayload);
      const newJob = response.data;

      setJobs((previous) => [newJob, ...previous]);
      setJobId(String(newJob.id));

      setJobForm({
        title: "",
        company: "",
        description: "",
        url: "",
      });

      setSuccess("Job added successfully!");
    } catch (err) {
      console.error("Add Job Error:", err.response?.data || err);

      setError(
        getErrorMessage(err, "Unable to add job. Please try again.")
      );
    } finally {
      setAddingJob(false);
    }
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setResult(null);

    if (!resumeId || !jobId) {
      setError("Please select both a resume and a job.");
      return;
    }

    setAnalyzing(true);

    try {
      const response = await api.post("/analysis/match", {
        resume_id: Number(resumeId),
        job_id: Number(jobId),
      });

      setResult(response.data);
      setSuccess("AI resume analysis completed!");
    } catch (err) {
      console.error(
        "Resume Analysis Error:",
        err.response?.data || err
      );

      setError(
        getErrorMessage(
          err,
          "Resume analysis failed. Please try again."
        )
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const parseList = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value ? [value] : [];
      }
    }

    return [];
  };

  if (loading) {
    return (
      <div className="match-loading">
        <LoaderCircle className="spin" size={34} />
        <h3>Preparing your career workspace</h3>
        <p>Loading your resumes and job opportunities...</p>
      </div>
    );
  }

  const score = Math.min(
    100,
    Math.max(0, Number(result?.match_score ?? 0))
  );

  const matchedSkills = parseList(result?.matched_skills);
  const missingSkills = parseList(result?.missing_skills);
  const strengths = parseList(result?.strengths);
  const recommendations = parseList(result?.recommendations);

  return (
    <main className="match-page">
      <div className="match-container">
        {/* Header */}
        <header className="match-header">
          <div>
            <Link to="/dashboard" className="match-back-link">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="match-eyebrow">
              <Sparkles size={15} />
              AI POWERED CAREER INSIGHTS
            </div>

            <h1>AI Resume Matching</h1>

            <p>
              Discover how closely your resume matches your dream job.
              Get actionable insights to improve your profile.
            </p>
          </div>

          <div className="match-header-icon">
            <Target size={34} />
          </div>
        </header>

        {/* Messages */}
        {error && (
          <div className="match-message match-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="match-message match-success">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Analyze Resume */}
        <section className="match-card">
          <div className="match-section-title">
            <div className="match-icon-box purple">
              <BrainCircuit size={23} />
            </div>

            <div>
              <h2>Analyze Your Resume</h2>
              <p>
                Choose your resume and target job to get an AI-powered
                compatibility report.
              </p>
            </div>
          </div>

          <form onSubmit={handleAnalyze}>
            <div className="match-form-grid">
              <div className="match-field">
                <label htmlFor="resume-select">
                  <FileText size={17} />
                  Select Resume
                </label>

                <select
                  id="resume-select"
                  value={resumeId}
                  onChange={(event) => setResumeId(event.target.value)}
                  required
                >
                  <option value="">Choose your resume</option>

                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.filename || `Resume #${resume.id}`}
                    </option>
                  ))}
                </select>

                {resumes.length === 0 && (
                  <small>
                    No resumes found.{" "}
                    <Link to="/resumes">Upload a resume</Link>.
                  </small>
                )}
              </div>

              <div className="match-field">
                <label htmlFor="job-select">
                  <BriefcaseBusiness size={17} />
                  Select Job
                </label>

                <select
                  id="job-select"
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                  required
                >
                  <option value="">Choose a job</option>

                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.company}
                    </option>
                  ))}
                </select>

                {jobs.length === 0 && (
                  <small>
                    Add a job description below to get started.
                  </small>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="match-analyze-btn"
              disabled={analyzing || !resumeId || !jobId}
            >
              {analyzing ? (
                <>
                  <LoaderCircle className="spin" size={19} />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  Analyze Resume
                </>
              )}
            </button>
          </form>
        </section>

        {/* Add Job */}
        <section className="match-card">
          <div className="match-section-title">
            <div className="match-icon-box green">
              <Plus size={23} />
            </div>

            <div>
              <h2>Add a Job Description</h2>
              <p>
                Save a job opportunity to compare it with your resume.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddJob} noValidate>
            <div className="match-form-grid">
              <div className="match-field">
                <label htmlFor="job-title">Job Title</label>

                <input
                  id="job-title"
                  type="text"
                  name="title"
                  value={jobForm.title}
                  onChange={handleJobFormChange}
                  placeholder="e.g. Python Developer"
                  required
                />
              </div>

              <div className="match-field">
                <label htmlFor="company-name">Company Name</label>

                <input
                  id="company-name"
                  type="text"
                  name="company"
                  value={jobForm.company}
                  onChange={handleJobFormChange}
                  placeholder="e.g. ABC Technologies"
                  required
                />
              </div>
            </div>

            <div className="match-field">
              <label htmlFor="job-description">Job Description</label>

              <textarea
                id="job-description"
                name="description"
                value={jobForm.description}
                onChange={handleJobFormChange}
                placeholder="Paste the complete job description here..."
                rows={5}
                required
              />
            </div>

            <div className="match-field">
              <label htmlFor="job-url">Job URL (Optional)</label>

              <input
                id="job-url"
                type="url"
                name="url"
                value={jobForm.url}
                onChange={handleJobFormChange}
                placeholder="https://company.com/jobs/123"
              />
            </div>

            <button
              type="submit"
              className="match-add-btn"
              disabled={addingJob}
            >
              {addingJob ? (
                <>
                  <LoaderCircle className="spin" size={18} />
                  Adding Job...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Job
                </>
              )}
            </button>
          </form>
        </section>

        {/* Analysis Results */}
        {result && (
          <section className="match-results">
            <div className="match-results-heading">
              <div className="match-icon-box purple">
                <Sparkles size={23} />
              </div>

              <div>
                <h2>AI Analysis Results</h2>
                <p>
                  Your resume compatibility report and improvement plan.
                </p>
              </div>
            </div>

            {/* Score and Summary */}
            <div className="match-overview-grid">
              <div className="match-score-card">
                <div className="match-score-ring">
                  <div
                    className="match-score-ring-fill"
                    style={{
                      background: `conic-gradient(#4f46e5 ${score * 3.6}deg, #e9eaf5 0deg)`,
                    }}
                  >
                    <div className="match-score-inner">
                      <strong>{score.toFixed(0)}%</strong>
                      <span>Match</span>
                    </div>
                  </div>
                </div>

                <h3>Resume Match Score</h3>
                <p>
                  {score >= 80
                    ? "Excellent match! Your profile aligns well with this role."
                    : score >= 60
                    ? "Good match! A few improvements can strengthen your profile."
                    : "Keep improving! Focus on the missing skills below."}
                </p>
              </div>

              <div className="match-summary-card">
                <div className="match-card-heading">
                  <div className="match-small-icon">
                    <BrainCircuit size={20} />
                  </div>
                  <h3>AI Summary</h3>
                </div>

                <p>
                  {result.summary || "No summary available."}
                </p>

                <div className="match-summary-footer">
                  <Sparkles size={17} />
                  Generated by your AI Resume Analyzer
                </div>
              </div>
            </div>

            {/* Skill Statistics */}
            <div className="match-skill-stats">
              <div className="match-stat-box matched-stat">
                <div className="match-stat-icon">
                  <CheckCircle size={21} />
                </div>
                <div>
                  <strong>{matchedSkills.length}</strong>
                  <span>Matched Skills</span>
                </div>
              </div>

              <div className="match-stat-box missing-stat">
                <div className="match-stat-icon">
                  <Target size={21} />
                </div>
                <div>
                  <strong>{missingSkills.length}</strong>
                  <span>Skills to Improve</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="match-result-grid">
              <div className="match-result-card">
                <div className="match-card-heading">
                  <CheckCircle className="success-icon" size={21} />
                  <h3>Matched Skills</h3>
                </div>

                <p className="match-card-description">
                  Skills identified in your resume that match the job.
                </p>

                <div className="match-badge-list">
                  {matchedSkills.length > 0 ? (
                    matchedSkills.map((skill, index) => (
                      <span className="match-skill-badge" key={index}>
                        <CheckCircle size={14} />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p>No matched skills returned.</p>
                  )}
                </div>
              </div>

              <div className="match-result-card">
                <div className="match-card-heading">
                  <Target className="danger-icon" size={21} />
                  <h3>Missing Skills</h3>
                </div>

                <p className="match-card-description">
                  Skills you can develop to improve your job match.
                </p>

                <div className="match-badge-list">
                  {missingSkills.length > 0 ? (
                    missingSkills.map((skill, index) => (
                      <span className="missing-skill-badge" key={index}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p>No missing skills returned.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div className="match-result-card match-full-card">
              <div className="match-card-heading">
                <Award className="success-icon" size={22} />
                <h3>Your Strengths</h3>
              </div>

              <p className="match-card-description">
                Positive qualities identified from your resume.
              </p>

              {strengths.length > 0 ? (
                <ul className="match-enhanced-list strength-list">
                  {strengths.map((item, index) => (
                    <li key={index}>
                      <CheckCircle size={17} />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No strengths returned.</p>
              )}
            </div>

            {/* Recommendations */}
            <div className="match-recommendation-card">
              <div className="match-card-heading">
                <div className="match-recommendation-icon">
                  <Lightbulb size={22} />
                </div>
                <h3>AI Recommendations</h3>
              </div>

              <p className="match-card-description">
                Suggested actions to strengthen your profile.
              </p>

              {recommendations.length > 0 ? (
                <ul className="match-enhanced-list recommendation-list">
                  {recommendations.map((item, index) => (
                    <li key={index}>
                      <TrendingUp size={17} />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recommendations returned.</p>
              )}
            </div>

            <button
              type="button"
              className="match-retry-btn"
              onClick={handleAnalyze}
              disabled={analyzing || !resumeId || !jobId}
            >
              <RefreshCw size={17} />
              Analyze Again
            </button>
          </section>
        )}

        <footer className="match-footer">
          <Sparkles size={15} />
          Powered by AI Career Agent
        </footer>
      </div>
    </main>
  );
}
