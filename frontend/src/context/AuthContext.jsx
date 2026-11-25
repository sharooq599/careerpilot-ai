
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("access_token")
  );

  const [user, setUser] = useState(null);

  const [authLoading, setAuthLoading] = useState(() =>
    Boolean(localStorage.getItem("access_token"))
  );

  // Clear authentication completely
  const clearAuth = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    setAuthLoading(false);
  };

  // Validate existing token when application starts
  useEffect(() => {
    let active = true;

    const verifyToken = async () => {
      if (!token) {
        if (active) {
          setUser(null);
          setAuthLoading(false);
        }
        return;
      }

      try {
        const response = await api.get("/auth/me");

        if (active) {
          setUser(response.data);
        }
      } catch (error) {
        if (active) {
          clearAuth();
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    };

    verifyToken();

    return () => {
      active = false;
    };
  }, [token]);

  // Login
  const login = async (email, password) => {
    try {
      const body = new URLSearchParams({
        username: email,
        password: password,
      });

      const { data } = await api.post(
        "/auth/login",
        body,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!data.access_token) {
        throw new Error("Login failed: access token not received.");
      }

      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);

      // Fetch logged-in user profile
      const profile = await api.get("/auth/me");

      setUser(profile.data);
      setAuthLoading(false);

      return profile.data;
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  // Register
  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      return data;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = () => {
    clearAuth();
  };

  // Refresh logged-in user profile
  const refreshUser = async () => {
    try {
      const { data } = await api.get("/auth/me");

      setUser(data);

      return data;
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        authLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
