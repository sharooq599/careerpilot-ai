
import { useEffect, useState } from "react";
import {
  UserRound,
  LockKeyhole,
  Save,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Shell } from "./Dashboard";

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  useEffect(() => {
    setProfile({
      name: user?.name || "",
      email: user?.email || "",
    });
  }, [user]);

  const getErrorMessage = (err, fallback) => {
    const detail = err.response?.data?.detail;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ");
    }

    return fallback;
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    setProfileBusy(true);
    setError("");
    setProfileMessage("");
    setPasswordMessage("");

    try {
      await api.patch("/profile", {
        name: profile.name.trim(),
        email: profile.email.trim(),
      });

      await refreshUser();

      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not update profile."));
    } finally {
      setProfileBusy(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    setPasswordBusy(true);
    setError("");
    setPasswordMessage("");
    setProfileMessage("");

    if (password.current_password === password.new_password) {
      setError("Your new password must be different from your current password.");
      setPasswordBusy(false);
      return;
    }

    try {
      const response = await api.patch("/profile/password", password);

      setPasswordMessage(
        response.data.message || "Password updated successfully."
      );

      setPassword({
        current_password: "",
        new_password: "",
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not update password."));
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <Shell title="Profile and settings">
      <div className="page-content">
        <div className="page-heading">
          <div>
            <span className="eyebrow">ACCOUNT SETTINGS</span>
            <h1>Your Profile</h1>
            <p>
              Manage your personal information and keep your account secure.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {profileMessage && (
          <div className="alert alert-success" role="status">
            <ShieldCheck size={18} />
            {profileMessage}
          </div>
        )}

        {passwordMessage && (
          <div className="alert alert-success" role="status">
            <ShieldCheck size={18} />
            {passwordMessage}
          </div>
        )}

        <div className="settings-grid">
          <form className="panel settings-card" onSubmit={saveProfile}>
            <div className="settings-heading">
              <div className="settings-icon">
                <UserRound size={22} />
              </div>
              <div>
                <h2>Personal Information</h2>
                <p>Update your account details.</p>
              </div>
            </div>

            <label htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={profile.name}
              placeholder="Enter your full name"
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
            />

            <label htmlFor="profile-email">Email Address</label>
            <input
              id="profile-email"
              type="email"
              required
              value={profile.email}
              placeholder="Enter your email address"
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />

            {user?.created_at && (
              <div className="profile-created">
                <CalendarDays size={17} />
                <span>
                  Member since{" "}
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={profileBusy}
            >
              <Save size={16} />
              {profileBusy ? "Saving..." : "Save Profile"}
            </button>
          </form>

          <form className="panel settings-card" onSubmit={changePassword}>
            <div className="settings-heading">
              <div className="settings-icon">
                <LockKeyhole size={22} />
              </div>
              <div>
                <h2>Change Password</h2>
                <p>Update your account password securely.</p>
              </div>
            </div>

            <label htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              type="password"
              required
              value={password.current_password}
              placeholder="Enter current password"
              onChange={(e) =>
                setPassword({
                  ...password,
                  current_password: e.target.value,
                })
              }
            />

            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              value={password.new_password}
              placeholder="Enter new password (minimum 8 characters)"
              onChange={(e) =>
                setPassword({
                  ...password,
                  new_password: e.target.value,
                })
              }
            />

            <p className="muted password-hint">
              Use at least 8 characters for your new password.
            </p>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={passwordBusy}
            >
              <LockKeyhole size={16} />
              {passwordBusy ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </Shell>
  );
}
