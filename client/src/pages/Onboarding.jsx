import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Onboarding() {
  const navigate = useNavigate();

  const [assets, setAssets] = useState("");
  const [investorType, setInvestorType] = useState("");
  const [contentType, setContentType] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/preferences", {
        assets: assets.split(",").map((a) => a.trim()),
        investor_type: investorType,
        content_type: contentType.split(",").map((c) => c.trim()),
      });

      navigate("/dashboard");
    } catch (err) {
      setMessage("Failed to save preferences");
    }
  };

  return (
    <div>
      <h1>Onboarding</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Assets (bitcoin, ethereum)"
          value={assets}
          onChange={(e) => setAssets(e.target.value)}
        />

        <input
          placeholder="Investor Type (HODLer / Trader)"
          value={investorType}
          onChange={(e) => setInvestorType(e.target.value)}
        />

        <input
          placeholder="Content (News, Charts, Fun)"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
        />

        <button type="submit">Save Preferences</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Onboarding;