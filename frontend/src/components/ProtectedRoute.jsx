import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({ children }) {
  const { token, authLoading } = useAuth();
  if (authLoading) return <div className="page-loading">Checking your session…</div>;
  return token ? children : <Navigate to="/login" replace />;
}
