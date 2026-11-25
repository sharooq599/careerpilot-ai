
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Resumes from "./pages/Resumes";
import Jobs from "./pages/Jobs";
import Match from "./pages/Match";
import Career from "./pages/career";
import Application from "./pages/Application";
import InterviewPrep from "./pages/InterviewPrep";
import Profile from "./pages/Profile";

import "./index.css";
import "./App.css";

const moduleDetails = {
  "job-analysis": {
    title: "Job Analysis",
    description:
      "Analyze job descriptions and identify required skills.",
  },
};

function ModulePlaceholder() {
  const { module } = useParams();
  const details = moduleDetails[module];

  if (!details) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="module-placeholder">
      <h1>{details.title}</h1>
      <p>{details.description}</p>
      <p>This module will be implemented next.</p>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Resume Management */}
          <Route
            path="/resumes"
            element={
              <ProtectedRoute>
                <Resumes />
              </ProtectedRoute>
            }
          />

          {/* Jobs Management */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            }
          />

          {/* AI Resume Matching */}
          <Route
            path="/match"
            element={
              <ProtectedRoute>
                <Match />
              </ProtectedRoute>
            }
          />

          {/* Career Advice */}
          <Route
            path="/career"
            element={
              <ProtectedRoute>
                <Career />
              </ProtectedRoute>
            }
          />

          {/* Application Tracking */}
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Application />
              </ProtectedRoute>
            }
          />

          {/* Interview Preparation */}
          <Route
            path="/interview-prep"
            element={
              <ProtectedRoute>
                <InterviewPrep />
              </ProtectedRoute>
            }
          />

          {/* Profile Management */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Other modules */}
          <Route
            path="/:module"
            element={
              <ProtectedRoute>
                <ModulePlaceholder />
              </ProtectedRoute>
            }
          />

          {/* Default routes */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
