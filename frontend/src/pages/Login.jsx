import { useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isRegister
        ? `${API_BASE}/auth/register`
        : `${API_BASE}/auth/login`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw data;

      login(data.access_token, username);
      navigate("/");
    } catch (err) {
      setError(err?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1 className="logo">PhishAI</h1>

        <p className="subtitle">
          {isRegister ? "Create account" : "Sign in to your account"}
        </p>

        <p className="muted">
          {isRegister ? (
            <>Already have an account? <span onClick={() => setIsRegister(false)}>Login</span></>
          ) : (
            <>Don’t have an account? <span onClick={() => setIsRegister(true)}>Create one</span></>
          )}
        </p>

        {error && <div className="auth-error">{error}</div>}

        {/* FIXED GOOGLE BUTTON */}
        <div className="google-wrapper">
          <GoogleLogin
            onSuccess={async (res) => {
              const r = await fetch(`${API_BASE}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: res.credential }),
              });

              const data = await r.json();
              login(data.access_token);
              navigate("/");
            }}
          />
        </div>

        <div className="divider">OR</div>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username or Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* PASSWORD WITH EYE FIX */}
          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>

          {!isRegister && (
            <p className="forgot" onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </p>
          )}

          <button className="primary" disabled={loading}>
            {loading ? "Loading..." : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}