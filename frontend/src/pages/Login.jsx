import { useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

function extractError(data) {
  if (typeof data === "string") return data;
  if (data?.detail) {
    if (Array.isArray(data.detail)) {
      return data.detail.map(e => e.msg).join(", ");
    }
    return data.detail;
  }
  if (data?.message) return data.message;
  return "Something went wrong";
}

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isRegister
        ? "http://127.0.0.1:8000/auth/register"
        : "http://127.0.0.1:8000/auth/login";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw data;

      if (isRegister) {
        const loginRes = await fetch("http://127.0.0.1:8000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw loginData;

        login(loginData.access_token, username);
      } else {
        login(data.access_token, username);
      }

      navigate("/");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1 className="logo">PhishAI</h1>

        <p className="subtitle">
          {isRegister ? "Create your account" : "Sign in to your account"}
        </p>

        <p className="muted">
          {isRegister ? (
            <>Already have an account? <span onClick={() => setIsRegister(false)}>Log in</span></>
          ) : (
            <>Don’t have an account? <span onClick={() => setIsRegister(true)}>Create one</span></>
          )}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <GoogleLogin
          onSuccess={async res => {
            try {
              const r = await fetch("http://127.0.0.1:8000/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: res.credential })
              });

              const data = await r.json();
              if (!r.ok) throw data;

              login(data.access_token);
              navigate("/");
            } catch (e) {
              setError(extractError(e));
            }
          }}
          onError={() => setError("Google sign-in failed")}
        />

        <div className="divider">OR</div>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username or Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!isRegister && (
            <p
              style={{
                textAlign: "right",
                color: "#4f7cff",
                cursor: "pointer",
                fontSize: "14px",
                marginTop: "-6px",
                marginBottom: "14px"
              }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </p>
          )}

          <button className="primary" disabled={loading}>
            {loading
              ? isRegister ? "Creating..." : "Signing in..."
              : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

      </div>
    </div>
  );
}
