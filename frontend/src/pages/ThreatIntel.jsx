import { useState } from "react";
import { motion } from "framer-motion";
import { generateThreatIntel } from "../ThreatIntel";

export default function ThreatIntel() {
  const [url, setUrl] = useState("");
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanIntel = () => {
    if (!url || loading) return; // SAFETY

    setLoading(true);
    setIntel(null);

    setTimeout(() => {
      const data = generateThreatIntel(url);
      setIntel(data);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="app">
      <h1>Threat Intelligence 🌐</h1>
      <p className="subtitle">
        Simulated cyber intelligence enrichment
      </p>

      <div className="input-box">
        <input
          placeholder="Enter domain"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && scanIntel()}   
        />

        <button
          onClick={scanIntel}
          disabled={loading || !url}        
          className={loading ? "scanning" : ""}
        >
          {loading ? "Enriching…" : "Enrich"}  {/* TEXT CHANGE */}
        </button>
      </div>

      {loading && (
        <motion.div
          className="result-card"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
        >
          <h3>Fetching Threat Intel...</h3>
          <p>Querying WHOIS, dark web, reputation feeds</p>
        </motion.div>
      )}

      {intel && (
        <motion.div
          className="result-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>🌐 WHOIS</h2>
          <p><b>Registrar:</b> {intel.registrar}</p>
          <p><b>Created:</b> {intel.created}</p>
          <p><b>Country:</b> {intel.country}</p>

          <h2>⭐ Reputation</h2>
          <p>
            Score: <b>{intel.reputation}/100</b>
          </p>
          <div className="risk-meter">
            <div
              className="risk-fill"
              style={{ width: `${intel.reputation}%` }}
            />
          </div>

          <h2>🕵️ Dark Web</h2>
          {intel.darkWeb ? (
            <p style={{ color: "#ef4444" }}>
              ⚠️ Domain mentioned in underground forums
            </p>
          ) : (
            <p style={{ color: "#22c55e" }}>
              ✅ No dark web exposure found
            </p>
          )}

          <p className="scan-time">
            Simulated Threat Intel Feed
          </p>
        </motion.div>
      )}
    </div>
  );
}
