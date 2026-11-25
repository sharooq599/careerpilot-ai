
import { useEffect, useState } from "react";
import {
  BrainCircuit,
  BriefcaseBusiness,
  BookOpen,
  Code,
  Lightbulb,
  Target,
  Sparkles,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Career() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const loadResumes = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/resumes/my-resumes");
      const items = Array.isArray(response.data) ? response.data : [];

      setResumes(items);

      if (items.length > 0) {
        setResumeId((previous) =>
          previous && items.some((item) => String(item.id) === previous)
            ? previous
            : String(items[0].id)
        );
      } else {
        setResumeId("");
      }
    } catch (err) {
      setError(
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Unable to load your resumes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const generateRecommendations = async (event) => {
    event?.preventDefault?.();

    if (!resumeId || generating) return;

    setGenerating(true);
    setError("");
    setData(null);

    try {
      const response = await api.post(
        `/career/recommendations?resume_id=${encodeURIComponent(resumeId)}`
      );

      setData(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to generate career recommendations. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  // Convert API values into arrays, including JSON strings.
  const toList = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return value.trim() ? [value] : [];
      }
    }

    if (value && typeof value === "object") {
      return [value];
    }

    return [];
  };

  const getText = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
    return "";
  };

  const roles = toList(data?.recommended_roles);
  const existingSkills = toList(data?.existing_skills);
  const skillsToLearn = toList(data?.skills_to_learn);
  const roadmap = toList(data?.learning_roadmap);
  const projects = toList(data?.project_recommendations);
  const tips = toList(data?.career_tips);

  if (loading) {
    return (
      <div className="career-loading">
        <LoaderCircle className="career-spin" size={34} />
        <h3>Loading your career workspace...</h3>
      </div>
    );
  }

  return (
    <main className="career-page">
      <div className="career-container">
        <header className="career-header">
          <Link to="/dashboard" className="career-back">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <div className="career-eyebrow">
            <Sparkles size={15} /> AI-POWERED CAREER PLANNER
          </div>

          <h1>AI Career Recommendations</h1>

          <p>
            Discover suitable career paths, identify skill gaps and build
            a learning roadmap based on your resume.
          </p>
        </header>

        {error && (
          <div className="career-error">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        <section className="career-card">
          <div className="career-card-heading">
            <div className="career-icon purple">
              <BrainCircuit size={23} />
            </div>

            <div>
              <h2>Generate Your Career Plan</h2>
              <p>Select a resume to get personalized AI recommendations.</p>
            </div>
          </div>

          <form onSubmit={generateRecommendations}>
            <label className="career-label" htmlFor="career-resume">
              <BookOpen size={17} /> Select Your Resume
            </label>

            <select
              id="career-resume"
              className="career-select"
              value={resumeId}
              onChange={(event) => setResumeId(event.target.value)}
              required
            >
              <option value="">Choose a resume</option>

              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.filename || `Resume #${resume.id}`}
                </option>
              ))}
            </select>

            {resumes.length === 0 && (
              <p className="career-hint">
                No resume found. <Link to="/resumes">Upload your resume</Link>.
              </p>
            )}

            <button
              className="career-generate-btn"
              type="submit"
              disabled={!resumeId || generating}
            >
              {generating ? (
                <>
                  <LoaderCircle className="career-spin" size={19} />
                  Generating Your Career Plan...
                </>
              ) : (
                <>
                  <Sparkles size={19} /> Generate Recommendations
                </>
              )}
            </button>
          </form>
        </section>

        {data && (
          <section className="career-results">
            <div className="career-results-heading">
              <div className="career-icon purple">
                <Target size={23} />
              </div>

              <div>
                <h2>Your Personalized Career Plan</h2>
                <p>AI-generated insights based on your resume.</p>
              </div>
            </div>

            {/* Career Summary */}
            <div className="career-card career-summary">
              <div className="career-card-heading">
                <BrainCircuit size={21} />
                <h3>Career Summary</h3>
              </div>

              <p>
                {getText(data.career_summary) ||
                  "No career summary was returned."}
              </p>
            </div>

            {/* Recommended Roles */}
            <div className="career-card">
              <div className="career-card-heading">
                <BriefcaseBusiness size={21} />
                <h3>Recommended Job Roles</h3>
              </div>

              <div className="career-role-grid">
                {roles.map((role, index) => {
                  const title =
                    typeof role === "string"
                      ? role
                      : role.role || role.title || role.name || "Recommended Role";

                  const reason =
                    typeof role === "object" ? role.reason : "";

                  return (
                    <div className="career-role-card" key={index}>
                      <h4>
                        <BriefcaseBusiness size={17} />
                        {title}
                      </h4>

                      {reason && <p>{reason}</p>}
                    </div>
                  );
                })}

                {roles.length === 0 && <p>No roles returned.</p>}
              </div>
            </div>

            {/* Existing and Missing Skills */}
            <div className="career-two-column">
              <div className="career-card">
                <div className="career-card-heading">
                  <CheckCircle className="career-green" size={21} />
                  <h3>Existing Skills</h3>
                </div>

                <div className="career-chip-list">
                  {existingSkills.map((skill, index) => {
                    const name =
                      typeof skill === "string"
                        ? skill
                        : skill.skill || skill.name || "Skill";

                    return (
                      <span className="career-skill-chip" key={index}>
                        {name}
                      </span>
                    );
                  })}

                  {existingSkills.length === 0 && <p>No skills returned.</p>}
                </div>
              </div>

              <div className="career-card">
                <div className="career-card-heading">
                  <Target className="career-red" size={21} />
                  <h3>Skills to Learn</h3>
                </div>

                <div className="career-skill-list">
                  {skillsToLearn.map((skill, index) => {
                    const name =
                      typeof skill === "string"
                        ? skill
                        : skill.skill || skill.name || "Skill";

                    const priority =
                      typeof skill === "object" ? skill.priority : "";

                    const reason =
                      typeof skill === "object" ? skill.reason : "";

                    return (
                      <div className="career-skill-item" key={index}>
                        <div className="career-skill-item-heading">
                          <strong>{name}</strong>

                          {priority && (
                            <span className="career-priority">
                              {priority} Priority
                            </span>
                          )}
                        </div>

                        {reason && <p>{reason}</p>}
                      </div>
                    );
                  })}

                  {skillsToLearn.length === 0 && (
                    <p>No skill gaps returned.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Learning Roadmap */}
            <div className="career-card">
              <div className="career-card-heading">
                <GraduationCap size={22} />
                <h3>Learning Roadmap</h3>
              </div>

              <div className="career-roadmap">
                {roadmap.map((step, index) => {
                  const topic =
                    typeof step === "string"
                      ? step
                      : step.topic || step.title || step.description || "Learning Step";

                  const duration =
                    typeof step === "object" ? step.duration : "";

                  const tasks =
                    typeof step === "object" && Array.isArray(step.tasks)
                      ? step.tasks
                      : [];

                  return (
                    <div className="career-roadmap-item" key={index}>
                      <span className="career-step-number">
                        {index + 1}
                      </span>

                      <div className="career-roadmap-content">
                        <h4>{topic}</h4>

                        {duration && (
                          <span className="career-duration">
                            {duration}
                          </span>
                        )}

                        {tasks.length > 0 && (
                          <ul>
                            {tasks.map((task, taskIndex) => (
                              <li key={taskIndex}>{task}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}

                {roadmap.length === 0 && <p>No roadmap returned.</p>}
              </div>
            </div>

            {/* Projects and Career Tips */}
            <div className="career-two-column">
              <div className="career-card">
                <div className="career-card-heading">
                  <Code size={21} />
                  <h3>Project Recommendations</h3>
                </div>

                <ul className="career-list">
                  {projects.map((project, index) => {
                    const title =
                      typeof project === "string"
                        ? project
                        : project.title || project.description || project.name || "Project";

                    return <li key={index}>{title}</li>;
                  })}
                </ul>

                {projects.length === 0 && <p>No projects returned.</p>}
              </div>

              <div className="career-card">
                <div className="career-card-heading">
                  <Lightbulb size={21} />
                  <h3>Career Tips</h3>
                </div>

                <ul className="career-list">
                  {tips.map((tip, index) => {
                    const text =
                      typeof tip === "string"
                        ? tip
                        : tip.tip || tip.title || tip.description || "Career tip";

                    return <li key={index}>{text}</li>;
                  })}
                </ul>

                {tips.length === 0 && <p>No tips returned.</p>}
              </div>
            </div>

            <button
              type="button"
              className="career-again-btn"
              onClick={generateRecommendations}
              disabled={generating || !resumeId}
            >
              <RefreshCw size={17} /> Generate Again
            </button>
          </section>
        )}

        <footer className="career-footer">
          <Sparkles size={15} /> Powered by AI Career Agent
        </footer>
      </div>
    </main>
  );
}
