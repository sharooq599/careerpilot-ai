
import { useEffect, useRef, useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  ClipboardList,
} from "lucide-react";

import api from "../services/api";
import { Shell } from "./Dashboard";

export default function InterviewPrep() {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [topics, setTopics] = useState("");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) {
        clearTimeout(copyTimer.current);
      }
    };
  }, []);

  const generateQuestions = async (event) => {
    event?.preventDefault();

    setError("");
    setSuccess("");

    const topicList = topics
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);

    if (!role.trim()) {
      setError("Please enter your target role.");
      return;
    }

    if (!level) {
      setError("Please select your experience level.");
      return;
    }

    if (topicList.length === 0) {
      setError("Please enter at least one interview topic.");
      return;
    }

    setLoading(true);
    setQuestions([]);
    setCopiedIndex(null);

    try {
      const response = await api.post("/interview/questions", {
        role: role.trim(),
        level,
        topics: topicList,
      });

      const generatedQuestions = response.data.questions || [];

      if (!generatedQuestions.length) {
        setError("No questions were generated. Please try again.");
        return;
      }

      setQuestions(generatedQuestions);
      setSuccess("Interview questions generated successfully.");
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Could not generate interview questions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text, target = null) => {
    try {
      await navigator.clipboard.writeText(text);

      if (copyTimer.current) {
        clearTimeout(copyTimer.current);
      }

      setCopiedIndex(target);
      setError("");

      if (target === "all") {
        setSuccess(`All ${questions.length} questions copied successfully!`);
      } else {
        setSuccess("Question copied successfully!");
      }

      copyTimer.current = setTimeout(() => {
        setCopiedIndex(null);
        setSuccess("");
      }, 2500);
    } catch {
      setError(
        "Unable to copy. Please select and copy the text manually."
      );
    }
  };

  const copyAllQuestions = () => {
    const text = questions
      .map(
        (question, index) =>
          `${index + 1}. ${question.question}\nCategory: ${
            question.category || "Interview"
          }\nSuggested answer: ${
            question.answer_outline ||
            "Prepare an answer with a practical example."
          }`
      )
      .join("\n\n");

    copyText(text, "all");
  };

  return (
    <Shell title="Interview Preparation">
      <div className="page-content">
        <div className="page-heading">
          <div>
            <span className="eyebrow">PRACTICE WITH CONFIDENCE</span>
            <h1>Interview Preparation</h1>
            <p>
              Generate role-specific questions and prepare structured answers
              with AI.
            </p>
          </div>

          <span className="large-feature-icon">
            <BrainCircuit size={30} />
          </span>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div
            className="alert alert-success"
            role="status"
            aria-live="polite"
          >
            <Check size={17} />
            {success}
          </div>
        )}

        <form className="panel form-grid" onSubmit={generateQuestions}>
          <div className="full">
            <h2>Generate interview questions</h2>
            <p className="muted">
              Enter your preferred role and topics to get personalized
              interview questions.
            </p>
          </div>

          <label>
            Target role
            <input
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="e.g., Python Developer, React Developer"
              maxLength={120}
              required
            />
          </label>

          <label>
            Experience level
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              required
            >
              <option value="" disabled>
                Select your experience level
              </option>
              <option value="Fresher">Fresher</option>
              <option value="Entry-level">Entry-level</option>
              <option value="1–3 years">1–3 years</option>
              <option value="3–5 years">3–5 years</option>
            </select>
          </label>

          <label className="full">
            Interview topics
            <input
              type="text"
              value={topics}
              onChange={(event) => setTopics(event.target.value)}
              placeholder="e.g., Python, SQL, FastAPI, React, Projects"
            />
            <small className="muted">
              Enter your topics separated by commas.
            </small>
          </label>

          <div className="form-actions full">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={17} />
                  Generating questions...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate questions
                </>
              )}
            </button>
          </div>
        </form>

        {loading && (
          <div className="panel empty-state">
            <BrainCircuit size={35} />
            <h3>AI is preparing your interview</h3>
            <p>Please wait while your questions are generated.</p>
          </div>
        )}

        {!loading && questions.length > 0 && (
          <section className="question-list">
            <div className="section-title-row">
              <div>
                <h2>Practice questions</h2>
                <p className="muted">
                  {questions.length} questions for {role}
                </p>
              </div>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={copyAllQuestions}
                disabled={copiedIndex === "all"}
              >
                {copiedIndex === "all" ? (
                  <>
                    <Check size={15} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    Copy all
                  </>
                )}
              </button>
            </div>

            {questions.map((question, index) => (
              <article
                className="panel question-card"
                key={index}
              >
                <div className="section-title-row">
                  <span className="question-category">
                    {question.category || "Interview"}
                  </span>

                  <button
                    className="icon-btn"
                    type="button"
                    title={
                      copiedIndex === index
                        ? "Question copied"
                        : "Copy question and answer"
                    }
                    aria-label={
                      copiedIndex === index
                        ? "Question copied"
                        : "Copy question and answer"
                    }
                    onClick={() =>
                      copyText(
                        `${question.question}\n\nSuggested answer:\n${
                          question.answer_outline ||
                          "Prepare a practical example."
                        }`,
                        index
                      )
                    }
                  >
                    {copiedIndex === index ? (
                      <Check size={17} color="#22c55e" />
                    ) : (
                      <Copy size={17} />
                    )}
                  </button>
                </div>

                {copiedIndex === index && (
                  <p className="copy-confirmation" role="status">
                    <Check size={14} />
                    Question copied!
                  </p>
                )}

                <h3>
                  {index + 1}. {question.question}
                </h3>

                <details>
                  <summary>Suggested answer outline</summary>
                  <p>
                    {question.answer_outline ||
                      "Answer with a specific example and explain the result."}
                  </p>
                </details>
              </article>
            ))}

            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => generateQuestions()}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Generate another set
            </button>
          </section>
        )}

        {!loading && questions.length === 0 && (
          <div className="panel empty-state">
            <ClipboardList size={38} />
            <h3>Ready to practice?</h3>
            <p>
              Enter your interview preferences and generate your first set
              of personalized questions.
            </p>
          </div>
        )}
      </div>
    </Shell>
  );
}
