import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Login.css";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();


  const reset = async () => {
    setMsg("");

    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (!res.ok) throw data;

      setMsg("✅ Password updated successfully");

      setTimeout(() => navigate("/login"), 1500);
    } catch (e) {
      setMsg("❌ Reset failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Reset Password</h1>

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <p className="hint">
          Must contain 8+ chars, uppercase, lowercase & number
        </p>

        <button onClick={reset} className="primary">
          Update Password
        </button>

        {msg && <p className="info">{msg}</p>}
      </div>
    </div>
  );
}