import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../auth/AuthContext";
import "../App.css";

export default function Scan() {

  const [url, setUrl] = useState("");
  const [url2, setUrl2] = useState("");
  const [compareMode, setCompareMode] = useState(false);

  const [result, setResult] = useState(null);
  const [result2, setResult2] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanTime, setScanTime] = useState(null);

  const API ="http://127.0.0.1:8000";

  /* ---------------- HELPERS ---------------- */

  const normalizeUrl = (input) =>
    input.startsWith("http") ? input : "https://" + input;

  const getConfidenceLabel = (prob) => {
    if (prob < 0.3) return "✅ Safe URL (No phishing detected)";
    if (prob < 0.7) return "⚠️ Potentially suspicious - proceed with caution";
    return "🚨 High risk phishing detected";
  };

  /* ---------------- API CALL ---------------- */

  const scanSingle = async (targetUrl, setTarget) => {
    console.log("TOKEN FROM CONTEXT:", token);
    console.log("TOKEN FROM STORAGE:", localStorage.getItem("token"));

    // 🔥 Prevent request if token missing
    if (!token) {
      throw new Error("User not authenticated. Please login again.");
    }

    const response = await fetch(`${API}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
      body: JSON.stringify({ url: normalizeUrl(targetUrl) }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Scan failed");
    }

    setTarget(data);
    setScanTime(new Date().toLocaleString());
  };

  const scanUrl = async () => {
    if (!url || loading || (compareMode && !url2)) return;

    setLoading(true);
    setError("");
    setResult(null);
    setResult2(null);

    try {
      await scanSingle(url, setResult);

      if (compareMode && url2) {
        await scanSingle(url2, setResult2);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "❌ Failed to scan. Check login.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RESULT UI ---------------- */

  const renderResult = (data, title) => {
    const riskClass = data.risk_level.toLowerCase();

    return (
      <motion.div
        className={`result-card ${
          data.decision === "SUSPICIOUS" ? "danger" : "safe"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>{title}</h2>

        <p><b>Case ID:</b> {data.case_id}</p>

        <button
          className="copy-btn"
          onClick={() => navigator.clipboard.writeText(data.case_id)}
        >
          📋 Copy Case ID
        </button>

        <p className="meta">
          <b>Risk Level:</b>
          <span className={`risk-badge ${riskClass}`}>
            {data.risk_level}
          </span>
        </p>

        <p>
          <b>Threat Probability:</b>{" "}
          {(data.probability * 100).toFixed(2)}%
        </p>

        <p className="confidence-label">
          {getConfidenceLabel(data.probability)}
        </p>

        <div className="risk-meter">
          <motion.div
            className="risk-fill"
            initial={{ width: 0 }}
            animate={{ width: `${data.probability * 100}%` }}
          />
        </div>

        <p className="scan-time">
          🕒 {scanTime} | 🌐 Web App | 🔒 Authenticated scan
        </p>

        <h3>🧠 What AI thinks</h3>
        <ul className="explanation-list">
          {data.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>

        <h3>🔍 Technical Indicators</h3>
        <ul className="features-grid">
          {Object.entries(data.features).map(([k, v]) => (
            <li key={k}>
              <span>{k}</span>
              <span>{String(v)}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="app">
      <header className="header">
        <h1>PhishAI 🛡️</h1>
        <p className="subtitle">AI-powered phishing detection</p>
      </header>

      <div className="input-box">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          onKeyDown={(e) => e.key === "Enter" && scanUrl()}
        />

        {compareMode && (
          <input
            value={url2}
            onChange={(e) => setUrl2(e.target.value)}
            placeholder="Second URL"
            onKeyDown={(e) => e.key === "Enter" && scanUrl()}
          />
        )}

        <button
          onClick={scanUrl}
          className={loading ? "scanning" : ""}
          disabled={loading || !url || (compareMode && !url2)}
        >
          {loading ? "Analyzing…" : "Scan"}
        </button>
      </div>

      <label className="compare-toggle">
        <input
          type="checkbox"
          checked={compareMode}
          onChange={() => setCompareMode(!compareMode)}
        />
        Compare two URLs
      </label>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className={compareMode ? "compare-grid" : ""}>
          {renderResult(result, "🔎 Result A")}
          {compareMode && result2 && renderResult(result2, "🔍 Result B")}
        </div>
      )}
    </div>
  );
}