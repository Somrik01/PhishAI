import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import "./Settings.css";

export default function Settings() {
  const { user, token } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const API = "http://127.0.0.1:8000";

  const updateEmail = async () => {
    const res = await fetch(`${API}/auth/change-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: newEmail }),
    });

    const data = await res.json();
    setMessage(data.message || "Email updated");
  };

  const updatePassword = async () => {
    const res = await fetch(`${API}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: newPassword }),
    });

    const data = await res.json();
    setMessage(data.message || "Password updated");
    setNewPassword("");
  };

  return (
    <div className="settings-container">
      <h1>Account Settings</h1>

      {message && <div className="settings-msg">{message}</div>}

      {/* Profile */}
      <div className="settings-card">
        <h2>Profile</h2>
        <div className="settings-row">
          <span>Username</span>
          <span>{user?.username}</span>
        </div>
        <div className="settings-row">
          <span>Email</span>
          <span>{user?.email}</span>
        </div>
      </div>

      {/* Change Email */}
      <div className="settings-card">
        <h2>Change Email</h2>
        <input
          type="email"
          placeholder="Enter new email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <button onClick={updateEmail}>Update Email</button>
      </div>

      {/* Change Password */}
      <div className="settings-card">
        <h2>Change Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={updatePassword}>Update Password</button>
      </div>

      {/* Security */}
      <div className="settings-card">
        <h2>Security</h2>
        <p>✔ Passwords are hashed</p>
        <p>✔ JWT-based authentication</p>
        <p>✔ Google OAuth supported</p>
      </div>

      {/* Danger */}
      <div className="settings-card danger">
        <h2>Danger Zone</h2>
        <button className="delete-btn">Delete My Account</button>
      </div>
    </div>
  );
}
