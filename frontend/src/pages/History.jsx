import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function History() {
  const { token, logout } = useContext(AuthContext);
  const [cases, setCases] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/cases", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          throw new Error("Session expired");
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCases(data);
        } else {
          setCases([]);
        }
      })
      .catch(() => {
        setError("⚠️ Please login again.");
      });
  }, [token]);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="page">
      <h1>📜 Case History</h1>

      {cases.length === 0 ? (
        <p>No cases found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Case ID</th>
              <th>URL</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr
                key={c.case_id}
                onClick={() => navigate(`/case/${c.case_id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{c.case_id}</td>
                <td>{c.url}</td>
                <td>{c.risk_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
