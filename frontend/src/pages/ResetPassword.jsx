import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const reset = async () => {
    setMsg("");

    const res = await fetch("http://127.0.0.1:8000/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });

    const data = await res.json();

    if (!res.ok) setMsg("❌ " + (data.detail || "Reset failed"));
    else {
      setMsg("✅ Password updated successfully");
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  return (
    <div className="auth-page">
      <h1>Reset Password</h1>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <div style={{ fontSize: "13px", color: "#9aa4b2", marginBottom: "15px" }}>
        Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number.
      </div>

      <button onClick={reset}>Update Password</button>

      {msg && <p>{msg}</p>}
    </div>
  );
}
