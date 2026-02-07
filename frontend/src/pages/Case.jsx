import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Case() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/case/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((d) => setData(d));
  }, [id, token]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>🗂️ Case {data.case_id}</h1>
      <p><b>URL:</b> {data.url}</p>
      <p><b>Risk:</b> {data.risk_level}</p>
      <p><b>Decision:</b> {data.decision}</p>
      <p><b>Probability:</b> {(data.probability * 100).toFixed(2)}%</p>

      <h3>Explanation</h3>
      <p>{data.explanation}</p>
    </div>
  );
}
