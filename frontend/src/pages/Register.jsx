import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordRules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const register = async () => {
    if (!isPasswordValid) {
      setMsg("❌ Password does not meet all requirements");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg("❌ " + (data.detail || "Registration failed"));
      } else {
        setMsg("✅ Registered! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch {
      setMsg("❌ Backend not running");
    } finally {
      setLoading(false);
    }
  };

  const Rule = ({ ok, text }) => (
    <p style={{ color: ok ? "#00ff99" : "#ff6b6b", fontSize: "13px" }}>
      {ok ? "✔" : "✖"} {text}
    </p>
  );

  return (
    <div className="auth-page">
      <h1>Create Account</h1>

      <input
        placeholder="Email or Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* 🔐 PASSWORD RULES PANEL */}
      <div className="password-hints">
        <p style={{ marginBottom: "6px", color: "#94a3b8" }}>
          Password must contain:
        </p>
        <Rule ok={passwordRules.length} text="At least 8 characters" />
        <Rule ok={passwordRules.upper} text="One uppercase letter" />
        <Rule ok={passwordRules.lower} text="One lowercase letter" />
        <Rule ok={passwordRules.number} text="One number" />
      </div>

      <button onClick={register} disabled={loading}>
        {loading ? "Registering..." : "Create Account"}
      </button>

      {msg && <p>{msg}</p>}
    </div>
  );
}
