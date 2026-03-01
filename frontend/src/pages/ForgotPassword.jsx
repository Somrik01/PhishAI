import { useState } from "react";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");


  const submit = async () => {
    setMsg("");

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email })
      });

      const data = await res.json();

      if (!res.ok) throw data;

      setMsg("✅ Reset link sent to your email");
    } catch (e) {
      setMsg("❌ Failed to send reset link");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Forgot Password</h1>

        <input
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <button onClick={submit} className="primary">
          Send Reset Link
        </button>

        {msg && <p className="info">{msg}</p>}
      </div>
    </div>
  );
}