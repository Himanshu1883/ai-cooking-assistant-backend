import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRecipe("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/api/generate_recipe/",
        { ingredients },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      const result = response.data.recipe;
      setRecipe(result);

      // 🎤 Speak the recipe
      const utterance = new SpeechSynthesisUtterance(result.replace(/[^a-zA-Z0-9,. ]/g, ""));
      utterance.lang = "en-IN";
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error generating recipe:", error);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">AI Cooking Assistant</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="ingredients" className="form-label">Enter Ingredients:</label>
          <textarea
            className="form-control"
            id="ingredients"
            rows="4"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., tomato, onion, garlic"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Generating..." : "Generate Recipe"}
        </button>
      </form>

      {recipe && (
        <div className="mt-4">
          <h4>Your Recipe:</h4>
          <p>{recipe}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
