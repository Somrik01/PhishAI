import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setMsg("");

    const res = await fetch("http://127.0.0.1:8000/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email })
    });

    const data = await res.json();
    setMsg("🔗 " + data.reset_link);
  };

  return (
    <div className="auth-page">
      <h1>Forgot Password</h1>

      <input
        placeholder="Enter your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <button onClick={submit}>Send Reset Link</button>

      {msg && <p>{msg}</p>}
    </div>
  );
}
