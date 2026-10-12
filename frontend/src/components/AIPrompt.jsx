import React, { useState } from "react";
import axios from "axios";
import "../styles/AIPrompt.css";

export default function AIPrompt({ file }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSuggest = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file in the Data & Model Setup card first.");
      return;
    }

    setLoading(true);
    setPrompt("Analyzing dataset with Groq AI...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/api/suggest-model", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data && res.data.recommendation) {
        setPrompt(res.data.recommendation);
      }
    } catch (error) {
      console.error("Error fetching model suggestion:", error);
      setPrompt("Error: Failed to retrieve model suggestion. Please verify the backend server status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-card">
      <h3 className="ai-title">Generative AI Recommendation</h3>

      <form onSubmit={handleSuggest}>
        <textarea
          className="ai-input"
          placeholder={
            file
              ? `Selected file: ${file.name}. Click 'Suggest me a model' to analyze.`
              : "Please upload a dataset file above to enable AI recommendations."
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          rows={10}
        />

        <div className="ai-actions">
          <button
            type="submit"
            className="ai-generate-btn"
            disabled={loading || !file}
          >
            {loading ? "Analyzing..." : "Suggest me a model"}
          </button>
        </div>
      </form>
    </section>
  );
}